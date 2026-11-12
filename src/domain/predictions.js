/** Módulo: domain/predictions.js */
import { Chart } from '../vendor.js';

import { state } from '../core/state.js';

import { badge, esc } from '../core/ui.js';

import { camposClasificacion, normTxt } from './failure-classifier.js';

import { MACHINES, iso, now, parseLocalDate } from './machines.js';

const EARLY_SIGNAL_WORDS=['ruido','vibracion','vibración','calentando','calienta','falseaba','falseo','intermitente','chispa','humo','olor','extraño','anomal','prealarm','pre-alarm','sobrecorriente','sobretemperatura'];

function _predEventPool(histDays, onlyCorrectivo){
  const scopeIds=new Set(MACHINES());
  const cutoff=new Date();
  cutoff.setDate(cutoff.getDate()-(Number(histDays)||60));
  cutoff.setHours(0,0,0,0);
  return (state.db.events||[]).filter(e=>{
    if(!e.date) return false;
    if(state.selectedMachine && e.machine!==state.selectedMachine) return false;
    if(e.machine && e.machine!=='SIN ASIGNAR' && !scopeIds.has(e.machine)) return false;
    const d=parseLocalDate(e.date);
    if(isNaN(d) || d<cutoff) return false;
    // asegurar clasificación
    if((!e.componente || e.componente==='No especificado') && e.desc){
      Object.assign(e, camposClasificacion(e.desc));
    }
    if(onlyCorrectivo){
      const t=String(e.type||'').toUpperCase();
      if(!(t.includes('CORRECTIVO')||t.includes('FALLA')||t==='FALLO')) return false;
    }
    // excluir mantenimiento programado puro
    if(e.clasificacion==='Mantenimiento programado' && (!e.componente || e.componente==='No especificado')) return false;
    return true;
  });
}

function calcularPrediccionesComponente(opts){
  const histDays=Number(opts.histDays)||60;
  const minEv=Number(opts.minEvents)||3;
  const onlyCorr=!!opts.onlyCorrectivo;
  const compFilter=opts.compFilter||'';
  const pool=_predEventPool(histDays, onlyCorr);
  const groups={};
  pool.forEach(e=>{
    const comp=e.componente;
    if(!comp || comp==='No especificado') return;
    if(compFilter && comp!==compFilter) return;
    const key=e.machine+'||'+comp;
    if(!groups[key]) groups[key]={machine:e.machine, componente:comp, dates:[]};
    const d=parseLocalDate(e.date);
    if(!isNaN(d)) groups[key].dates.push(d);
  });
  const now=new Date();
  const out=[];
  Object.values(groups).forEach(g=>{
    g.dates.sort((a,b)=>a-b);
    // dedupe same day
    const uniq=[];
    g.dates.forEach(d=>{
      if(!uniq.length || iso(uniq[uniq.length-1])!==iso(d)) uniq.push(d);
    });
    if(uniq.length<minEv) return;
    let sum=0,cnt=0;
    for(let i=1;i<uniq.length;i++){
      const diff=(uniq[i]-uniq[i-1])/(1000*60*60*24);
      if(diff>0 && diff<400){ sum+=diff; cnt++; }
    }
    if(!cnt) return;
    const promedio=sum/cnt;
    const ultimo=uniq[uniq.length-1];
    const diasDesde=(now-ultimo)/(1000*60*60*24);
    const riesgoRatio=promedio>0?(diasDesde/promedio):0;
    let nivel='baja', badgeCls='b-ok';
    if(riesgoRatio>=1){ nivel='alta'; badgeCls='b-bad'; }
    else if(riesgoRatio>=0.7){ nivel='media'; badgeCls='b-warn'; }
    const confianza=uniq.length>=6?'alta':uniq.length>=4?'media':'baja';
    const diasRestantes=Math.max(0, promedio-diasDesde);
    const prob=Math.min(95, Math.round(riesgoRatio*70 + (uniq.length>5?10:0)));
    out.push({
      machine:g.machine,
      componente:g.componente,
      promedio:+promedio.toFixed(1),
      diasDesde:+diasDesde.toFixed(1),
      diasRestantes:+diasRestantes.toFixed(1),
      ultimo:iso(ultimo),
      n:uniq.length,
      nivel, badgeCls, confianza, riesgoRatio:+riesgoRatio.toFixed(2), prob
    });
  });
  out.sort((a,b)=>b.riesgoRatio-a.riesgoRatio || b.n-a.n);
  return out;
}

function fillPredCompFilter(pool){
  const sel=document.getElementById('predCompFilter');
  if(!sel) return;
  const cur=sel.value;
  const comps=new Set();
  (pool||[]).forEach(e=>{
    if(e.componente && e.componente!=='No especificado') comps.add(e.componente);
  });
  const list=[...comps].sort();
  sel.innerHTML='<option value="">Todos los componentes</option>'+list.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  if(cur && list.includes(cur)) sel.value=cur;
}

export function renderPrediccionesAvanzadas(){
  const histDays=Number(document.getElementById('predHistDays')?.value)||60;
  const minEvents=Number(document.getElementById('predMinEvents')?.value)||3;
  const onlyCorrectivo=document.getElementById('predOnlyCorrectivo')?.value==='1';
  const pool=_predEventPool(histDays, onlyCorrectivo);
  fillPredCompFilter(pool);
  const compFilter=document.getElementById('predCompFilter')?.value||'';
  const preds=calcularPrediccionesComponente({histDays,minEvents,onlyCorrectivo,compFilter});

  const altas=preds.filter(p=>p.nivel==='alta').length;
  const medias=preds.filter(p=>p.nivel==='media').length;
  const bajas=preds.filter(p=>p.nivel==='baja').length;
  const kpis=document.getElementById('predAlertKpis');
  if(kpis){
    kpis.innerHTML=[
      ['Riesgo alto',altas,'Superaron el intervalo medio'],
      ['Riesgo medio',medias,'≥70% del intervalo'],
      ['Riesgo bajo',bajas,'Dentro del patrón'],
      ['Pares analizados',preds.length,'Máquina + componente']
    ].map((x,i)=>`<div class="card kpi"><div class="label">${x[0]}</div><div class="value" style="${i===0&&altas?'color:var(--red)':''}">${x[1]}</div><div class="sub">${x[2]}</div></div>`).join('');
  }

  const alertEl=document.getElementById('predAlertList');
  if(alertEl){
    const urg=preds.filter(p=>p.nivel==='alta'||p.nivel==='media').slice(0,8);
    alertEl.innerHTML=urg.length?urg.map(p=>`
      <div class="item" style="border-left:4px solid ${p.nivel==='alta'?'var(--red)':'var(--yellow)'}">
        <div class="flex">
          <strong>Alerta: ${esc(p.machine)} — ${esc(p.componente)}</strong>
          <span class="badge ${p.badgeCls}">${p.nivel.toUpperCase()} · ~${p.prob}%</span>
        </div>
        <div class="muted" style="font-size:12px;margin-top:4px">
          Último evento hace <strong>${p.diasDesde}</strong> días · intervalo medio <strong>${p.promedio}</strong> días
          (${p.n} eventos, confianza ${p.confianza})
          ${p.nivel==='alta'?' · Revisar / programar preventivo o stock de refacción.':p.diasRestantes>0?' · Ventana estimada ~'+p.diasRestantes+' días.':''}
        </div>
      </div>`).join(''):'<div class="success">No hay alertas de riesgo medio/alto con los filtros actuales.</div>';
  }

  const tbody=document.getElementById('predTableAvanzada');
  if(tbody){
    tbody.innerHTML=preds.length?preds.map(p=>`<tr>
      <td><strong>${esc(p.machine)}</strong></td>
      <td>${esc(p.componente)}</td>
      <td>${esc(p.ultimo)}</td>
      <td>${p.promedio} d</td>
      <td>${p.diasDesde} d</td>
      <td><span class="badge ${p.badgeCls}">${p.nivel}</span></td>
      <td>${p.confianza}</td>
      <td>${p.n}</td>
    </tr>`).join(''):`<tr><td colspan="8" class="empty">Sin pares máquina+componente con ≥${minEvents} eventos en ${histDays} días. Importa reportes o reclasifica eventos.</td></tr>`;
  }

  // Patrón semanal
  if(state.charts.predWeek){ try{state.charts.predWeek.destroy()}catch(e){} }
  const days=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const counts=new Array(7).fill(0);
  pool.forEach(e=>{
    const d=parseLocalDate(e.date);
    if(!isNaN(d)) counts[d.getDay()]++;
  });
  const wctx=document.getElementById('predWeekdayChart');
  if(wctx){
    state.charts.predWeek=new Chart(wctx,{
      type:'bar',
      data:{labels:days,datasets:[{label:'Eventos',data:counts,backgroundColor:'#3b82f6'}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
    });
  }

  // Señales tempranas NLP
  const earlyEl=document.getElementById('predEarlySignals');
  if(earlyEl){
    const hits=[];
    pool.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).forEach(e=>{
      const t=normTxt(e.desc||'');
      const found=EARLY_SIGNAL_WORDS.filter(w=>t.includes(normTxt(w)));
      if(found.length) hits.push({e,found:[...new Set(found)]});
    });
    earlyEl.innerHTML=hits.length?hits.slice(0,15).map(h=>`
      <div class="item">
        <div class="flex"><strong>${esc(h.e.machine)}</strong><span class="badge b-warn">${esc(h.found.join(', '))}</span></div>
        <div style="font-size:12px;margin:4px 0">${esc(h.e.desc)}</div>
        <div class="muted" style="font-size:10px">${esc(h.e.date)} · ${esc(h.e.componente||'sin componente')}</div>
      </div>`).join(''):'<div class="empty">No se detectaron señales tempranas en el historial filtrado</div>';
  }
}

export function renderPredictive(){
 document.getElementById('predictiveTable').innerHTML=state.db.predictive.filter(x=>!state.selectedMachine||x[1]===state.selectedMachine).map(x=>`<tr>${x.map((v,i)=>`<td>${i===6?badge(v):esc(v)}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="7" class="empty">Sin mediciones</td></tr>';
 const p=state.db.predictive.filter(x=>x[1]===(state.selectedMachine||MACHINES()[0]));
 document.getElementById('conditionCards').innerHTML=p.slice(0,3).map(x=>`<div class="card"><div class="muted" style="font-size:10px">${esc(x[2])}</div><div style="font-size:23px;font-weight:800;margin:5px 0">${esc(x[3])} ${esc(x[4])}</div>${badge(x[6])}<div class="muted mt" style="font-size:10px">Umbral: ${esc(x[5])}</div></div>`).join('')||'<div class="empty">Sin datos de condición</div>';
 const listEl=document.getElementById('predNextFailList');
 if(listEl){
   const ids=state.selectedMachine?[state.selectedMachine]:MACHINES().slice(0,12);
   const rows=ids.map(id=>{
     const pred=predecirProximaFalla(id);
     if(!pred) return null;
     const daysLeft=(parseLocalDate(pred.proxima)-new Date())/(1000*60*60*24);
     const urg=daysLeft<7?'b-bad':daysLeft<21?'b-warn':'b-ok';
     return `<div class="item"><div class="flex"><strong>${esc(id)}</strong><span class="badge ${urg}">próxima ~ ${esc(pred.proxima)}</span></div>
       <div class="muted" style="font-size:11px;margin-top:4px">${pred.n} eventos · intervalo medio ${pred.promedio} días · última ${esc(pred.ultima)}</div></div>`;
   }).filter(Boolean);
   listEl.innerHTML=rows.length?rows.join(''):'<div class="empty">Insuficientes eventos (≥3) para estimar próxima falla</div>';
 }
 renderPrediccionesAvanzadas();
}


/**
 * Próxima falla estimada de una máquina: última falla + intervalo medio entre fallas registradas.
 * Requiere al menos 3 eventos con fecha válida (mismo criterio que muestra la vista Predictivo).
 * Restaurado: la vista llamaba a esta función, que no existía en el código original.
 */
export function predecirProximaFalla(machineId){
  const fechas = state.db.events
    .filter(e => e.machine === machineId)
    .map(e => parseLocalDate(e.date))
    .filter(d => d && !isNaN(d))
    .sort((a, b) => a - b);
  if (fechas.length < 3) return null;
  const DIA = 86400000;
  let suma = 0;
  for (let i = 1; i < fechas.length; i++) suma += (fechas[i] - fechas[i - 1]) / DIA;
  const promedio = suma / (fechas.length - 1);
  const ultima = fechas[fechas.length - 1];
  const proxima = new Date(ultima.getTime() + promedio * DIA);
  return {
    proxima: iso(proxima),
    n: fechas.length,
    promedio: Math.round(promedio * 10) / 10,
    ultima: iso(ultima),
  };
}
