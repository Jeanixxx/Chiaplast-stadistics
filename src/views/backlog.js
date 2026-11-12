/** Módulo: views/backlog.js */
import { Chart } from '../vendor.js';

import { predecirProximaFalla } from '../domain/predictions.js';
import { state } from '../core/state.js';

import { badge, esc, escAttr, save, toast } from '../core/ui.js';

import { camposClasificacion } from '../domain/failure-classifier.js';

import { MACHINE_TARGETS, allMachineIds, isAllAreas, parseLocalDate } from '../domain/machines.js';

import { downtimeMinutes, eventsInPeriod, periodMinutes, productionHybrid } from '../domain/production.js';

import { safeChartDestroy } from '../ui/charts.js';

import { getDashPeriod } from './dashboard.js';

// ================= BACKLOG SMRP 5.4.9 (READY BACKLOG) =================

export function guardarCrew(){
  state.db.crew={
    personasTotal:Number(document.getElementById('cr_personas').value)||0,
    horasSemanaPersona:Number(document.getElementById('cr_horas').value)||0,
    indirectoPct:Number(document.getElementById('cr_indirecto').value)||0,
    reservaEmergenciaPct:Number(document.getElementById('cr_reserva').value)||0
  };
  save();renderBacklog();toast('Capacidad de cuadrilla guardada');
}

export function backlogToggleReady(id,checked){
  const wo=state.db.workOrders.find(x=>x.id===id);
  if(!wo)return;
  wo.ready=checked;save();renderBacklog();
}

function getBacklogStats(){
  const abiertas=(state.db.workOrders||[]).filter(x=>x.status!=='Cerrada');
  const readyWork=abiertas.filter(x=>x.ready).reduce((a,x)=>a+(Number(x.downtime)||0),0);
  const c=state.db.crew||{};
  const netCapacity=Math.max(0,(c.personasTotal||0)*(c.horasSemanaPersona||c.horasTurno||8)*(1-(c.indirectoPct||0)/100)*(1-(c.reservaEmergenciaPct||0)/100));
  const ratio=netCapacity>0?readyWork/netCapacity:0;
  const criticas=abiertas.filter(x=>{
    const p=String(x.priority||'').toLowerCase();
    return p.includes('crít')||p.includes('crit')||p.includes('alta');
  });
  return {abiertas,readyWork,netCapacity,ratio,criticas};
}

export function renderSemanaPlanta(){
  const period=getDashPeriod();
  const evs=eventsInPeriod(null, period, true, state.dashRefDate);
  const mins=downtimeMinutes(evs);
  const hybrid=productionHybrid(evs);
  const bk=getBacklogStats();
  const byM={};
  evs.forEach(e=>{
    if(!e.machine) return;
    if(!byM[e.machine]) byM[e.machine]={m:e.machine,minutes:0,n:0};
    byM[e.machine].minutes+=Number(e.minutes)||0;
    byM[e.machine].n++;
  });
  const topM=Object.values(byM).sort((a,b)=>b.minutes-a.minutes).slice(0,5);
  const byC={};
  evs.forEach(e=>{
    let c=e.componente;
    if((!c||c==='No especificado')&&e.desc){ Object.assign(e,camposClasificacion(e.desc)); c=e.componente; }
    if(!c||c==='No especificado') c='(sin clasificar)';
    byC[c]=(byC[c]||0)+1;
  });
  const topC=Object.entries(byC).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const areaTxt=isAllAreas()?'Toda la planta':state.currentArea;
  const kpis=document.getElementById('spKpis');
  if(kpis){
    kpis.innerHTML=[
      ['Alcance',areaTxt,state.selectedMachine||'Todas las máquinas'],
      ['Paro total',(mins/60).toFixed(1)+' h',evs.length+' eventos'],
      ['Kg A (reportado)',hybrid.reported.waste.toLocaleString('es-MX',{maximumFractionDigits:0}),'Dato1 − Dato2'],
      ['Kg B (estimado)',hybrid.estimated.waste.toLocaleString('es-MX',{maximumFractionDigits:0}),'Capacidad × paro'],
      ['Backlog ratio',bk.ratio.toFixed(2)+' sem.',bk.ratio>=2&&bk.ratio<=4?'En meta 2–4':'Fuera de meta'],
      ['OT críticas',bk.criticas.length,bk.abiertas.length+' OT abiertas']
    ].map(x=>`<div class="card kpi"><div class="label">${esc(x[0])}</div><div class="value" style="font-size:22px">${esc(String(x[1]))}</div><div class="sub">${esc(x[2])}</div></div>`).join('');
  }

  document.getElementById('spTopMachines').innerHTML=topM.length?topM.map((r,i)=>`
    <div class="item"><div class="flex"><span><strong>${i+1}. ${esc(r.m)}</strong></span>
      <span class="badge b-warn">${(r.minutes/60).toFixed(1)} h · ${r.n} ev.</span></div>
      <div class="progress mt"><span style="width:${Math.min(100,topM[0].minutes?r.minutes/topM[0].minutes*100:0)}%"></span></div>
    </div>`).join(''):'<div class="empty">Sin paro en el periodo</div>';

  document.getElementById('spTopComps').innerHTML=topC.length?topC.map(([c,n],i)=>`
    <div class="item"><div class="flex"><span><strong>${i+1}. ${esc(c)}</strong></span><span class="badge b-info">${n}×</span></div></div>`).join(''):'<div class="empty">Sin componentes clasificados</div>';

  document.getElementById('spCritOt').innerHTML=bk.criticas.length?bk.criticas.slice(0,10).map(x=>`
    <div class="item"><div class="flex"><strong>${esc(x.id)} · ${esc(x.machine)}</strong>${badge(x.priority)}</div>
      <div style="font-size:12px;margin-top:4px">${esc(x.fault)}</div>
      <div class="muted" style="font-size:10px">${esc(x.date)} · ${x.downtime||0} h · ${x.ready?'Listo':'No listo'}</div>
    </div>`).join(''):'<div class="success">No hay OT de prioridad alta/crítica abiertas</div>';

  const ratioBadge=bk.ratio>=2&&bk.ratio<=4?'b-ok':bk.ratio<2?'b-warn':'b-bad';
  document.getElementById('spBacklog').innerHTML=`
    <div class="item"><div class="flex"><span>Ready Work</span><strong>${bk.readyWork.toFixed(1)} h</strong></div></div>
    <div class="item"><div class="flex"><span>Net Crew Capacity</span><strong>${bk.netCapacity.toFixed(1)} h/sem</strong></div></div>
    <div class="item"><div class="flex"><span>Ready Backlog Ratio</span><span class="badge ${ratioBadge}">${bk.ratio.toFixed(2)} semanas</span></div>
      <div class="muted" style="font-size:11px;margin-top:4px">Referencia SMRP sana: 2 a 4 semanas. ${bk.netCapacity<=0?'Configura la cuadrilla en Backlog.':''}</div>
    </div>`;

  // Comparativo A vs B
  const rep=hybrid.reported, est=hybrid.estimated;
  const delta=est.waste-rep.waste;
  document.getElementById('spKgCompare').innerHTML=[
    ['Método A (reportado)',rep.waste.toLocaleString('es-MX',{maximumFractionDigits:0})+' kg','Objetivo: '+rep.target.toLocaleString('es-MX',{maximumFractionDigits:0})],
    ['Método B (estimado)',est.waste.toLocaleString('es-MX',{maximumFractionDigits:0})+' kg','Capacidad×paro del periodo'],
    ['Diferencia B − A',delta.toLocaleString('es-MX',{maximumFractionDigits:0})+' kg',delta===0?'Coinciden':(delta>0?'Estimado mayor':'Reportado mayor')],
    ['Método activo en KPI',hybrid.useReported?'A':'B','Dashboard usa el que tenga datos de kg reportados si existen']
  ].map(x=>`<div class="card kpi"><div class="label">${esc(x[0])}</div><div class="value" style="font-size:20px">${esc(x[1])}</div><div class="sub">${esc(x[2])}</div></div>`).join('');

  safeChartDestroy(state.charts,'spKg');
  const ctx=document.getElementById('spKgChart');
  if(ctx){
    state.charts.spKg=new Chart(ctx,{
      type:'bar',
      data:{labels:['Desperdicio kg','Objetivo / capacidad kg','Producción útil kg'],
        datasets:[
          {label:'A · Reporte diario',data:[rep.waste,rep.target,rep.actual],backgroundColor:'#3b82f6'},
          {label:'B · Capacidad × paro',data:[est.waste,est.target,est.actual],backgroundColor:'#f59e0b'}
        ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true}}}
    });
  }
  // Tabla por máquina (top 12 por estimado o reportado)
  const map={};
  rep.rows.forEach(r=>{
    if(!map[r.machine]) map[r.machine]={machine:r.machine,repW:0,repT:0,estW:0,estT:0};
    map[r.machine].repW+=r.dead||r.waste||0; map[r.machine].repT+=r.target||0;
  });
  est.rows.forEach(r=>{
    if(!map[r.machine]) map[r.machine]={machine:r.machine,repW:0,repT:0,estW:0,estT:0};
    map[r.machine].estW+=r.waste||0; map[r.machine].estT+=r.target||0;
  });
  const rows=Object.values(map).sort((a,b)=>(b.estW+b.repW)-(a.estW+a.repW)).slice(0,15);
  document.getElementById('spKgTable').innerHTML=rows.length?`<table><thead><tr><th>Máquina</th><th>Kg A desperdicio</th><th>Kg B desperdicio</th><th>Capacidad/obj A</th><th>Capacidad B</th></tr></thead>
    <tbody>${rows.map(r=>`<tr><td><strong>${esc(r.machine)}</strong></td><td>${r.repW.toLocaleString('es-MX',{maximumFractionDigits:0})}</td><td>${r.estW.toLocaleString('es-MX',{maximumFractionDigits:0})}</td><td>${r.repT.toLocaleString('es-MX',{maximumFractionDigits:0})}</td><td>${r.estT.toLocaleString('es-MX',{maximumFractionDigits:0})}</td></tr>`).join('')}</tbody></table>`
    :'<div class="empty">Sin datos de kg ni de paro para comparar</div>';
}

export function fillFichaMachineSelect(){
  const sel=document.getElementById('fichaMachineSelect');
  if(!sel) return;
  const ids=allMachineIds();
  const cur=sel.value||state.selectedMachine||ids[0]||'';
  sel.innerHTML=ids.map(id=>`<option value="${escAttr(id)}">${esc(id)}</option>`).join('')||'<option value="">—</option>';
  if(cur&&ids.includes(cur)) sel.value=cur;
}

export function renderFichaMaquina(){
  fillFichaMachineSelect();
  const mid=document.getElementById('fichaMachineSelect')?.value||state.selectedMachine||'';
  const box=document.getElementById('fichaContent');
  if(!box) return;
  if(!mid){ box.innerHTML='<div class="empty">Selecciona una máquina</div>'; return; }
  const period=getDashPeriod();
  const evs=eventsInPeriod(mid, period, false, state.dashRefDate);
  const mins=downtimeMinutes(evs);
  const totalMin=periodMinutes(period, state.dashRefDate);
  const avail=Math.max(0,100-(mins/totalMin*100));
  const m=state.db.machines.find(x=>x.id===mid)||{id:mid,dailyTarget:MACHINE_TARGETS[mid]||0};
  const daily=m.dailyTarget!=null?m.dailyTarget:(MACHINE_TARGETS[mid]||0);
  const hybrid=productionHybrid(evs);
  const pred=typeof predecirProximaFalla==='function'?predecirProximaFalla(mid):null;
  // MTBF / MTTR simple
  const sorted=evs.map(e=>({d:parseLocalDate(e.date),min:Number(e.minutes)||0})).filter(x=>!isNaN(x.d)).sort((a,b)=>a.d-b.d);
  let mtbf=null, mttr=null;
  if(sorted.length>=2){
    let sum=0,n=0;
    for(let i=1;i<sorted.length;i++){
      const diff=(sorted[i].d-sorted[i-1].d)/(1000*60*60*24);
      if(diff>0&&diff<400){sum+=diff;n++;}
    }
    if(n) mtbf=sum/n;
  }
  if(sorted.length) mttr=sorted.reduce((a,x)=>a+x.min,0)/sorted.length/60;
  const comps={};
  evs.forEach(e=>{
    let c=e.componente; if((!c||c==='No especificado')&&e.desc){Object.assign(e,camposClasificacion(e.desc));c=e.componente;}
    if(c&&c!=='No especificado') comps[c]=(comps[c]||0)+1;
  });
  const topComp=Object.entries(comps).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const ots=(state.db.workOrders||[]).filter(x=>x.machine===mid&&x.status!=='Cerrada');
  const pms=(state.db.pm||[]).filter(p=>p[0]===mid).slice(0,8);
  const area=state.LIVE_MACHINE_DB.find(r=>r.code===mid)?.area||'—';

  box.innerHTML=`
  <div class="grid kpis" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">
    <div class="card kpi"><div class="label">Máquina</div><div class="value" style="font-size:20px">${esc(mid)}</div><div class="sub">Área ${esc(area)}</div></div>
    <div class="card kpi"><div class="label">Capacidad</div><div class="value" style="font-size:20px">${Number(daily).toLocaleString('es-MX')}</div><div class="sub">kg / día</div></div>
    <div class="card kpi"><div class="label">Disponibilidad</div><div class="value" style="font-size:20px">${avail.toFixed(1)}%</div><div class="sub">${(mins/60).toFixed(1)} h paro</div></div>
    <div class="card kpi"><div class="label">Eventos</div><div class="value" style="font-size:20px">${evs.length}</div><div class="sub">en el periodo</div></div>
    <div class="card kpi"><div class="label">MTBF</div><div class="value" style="font-size:20px">${mtbf!=null?mtbf.toFixed(1)+' d':'—'}</div><div class="sub">intervalo medio</div></div>
    <div class="card kpi"><div class="label">MTTR</div><div class="value" style="font-size:20px">${mttr!=null?mttr.toFixed(2)+' h':'—'}</div><div class="sub">duración media</div></div>
  </div>
  <div class="grid layout2 mt">
    <div class="card">
      <div class="section-title">Kg en el periodo</div>
      <div class="item"><div class="flex"><span>Método A (reportado)</span><strong>${hybrid.reported.waste.toLocaleString('es-MX',{maximumFractionDigits:0})} kg desp.</strong></div></div>
      <div class="item"><div class="flex"><span>Método B (estimado)</span><strong>${hybrid.estimated.waste.toLocaleString('es-MX',{maximumFractionDigits:0})} kg desp.</strong></div></div>
      <div class="muted" style="font-size:11px;margin-top:6px">Útil / obj A: ${hybrid.reported.actual.toLocaleString('es-MX',{maximumFractionDigits:0})} / ${hybrid.reported.target.toLocaleString('es-MX',{maximumFractionDigits:0})}</div>
      ${pred?`<div class="notice mt">Próxima falla estimada ~ ${esc(pred.proxima)} (intervalo medio ${pred.promedio} d, n=${pred.n})</div>`:''}
    </div>
    <div class="card">
      <div class="section-title">Componentes más frecuentes</div>
      ${topComp.length?topComp.map(([c,n])=>`<div class="item"><div class="flex"><span>${esc(c)}</span><span class="badge b-info">${n}×</span></div></div>`).join(''):'<div class="empty">Sin componentes clasificados</div>'}
    </div>
  </div>
  <div class="grid layout2 mt">
    <div class="card">
      <div class="section-title">OT abiertas</div>
      ${ots.length?ots.map(x=>`<div class="item"><div class="flex"><strong>${esc(x.id)}</strong>${badge(x.priority)}</div><div style="font-size:12px">${esc(x.fault)}</div></div>`).join(''):'<div class="success">Sin OT abiertas</div>'}
    </div>
    <div class="card">
      <div class="section-title">Planes preventivos</div>
      ${pms.length?`<table><thead><tr><th>Actividad</th><th>Frecuencia</th><th>Próxima</th><th>Estado</th></tr></thead><tbody>
        ${pms.map(p=>`<tr><td>${esc(p[1])}</td><td>${esc(p[2])}</td><td>${esc(p[4])}</td><td>${badge(p[5])}</td></tr>`).join('')}
      </tbody></table>`:'<div class="empty">Sin PM registrados para esta máquina</div>'}
    </div>
  </div>
  <div class="card mt">
    <div class="section-title">Últimos eventos</div>
    ${evs.length?`<table><thead><tr><th>Fecha</th><th>Tipo</th><th>Min</th><th>Componente</th><th>Descripción</th></tr></thead><tbody>
      ${evs.slice(0,15).map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.type)}</td><td>${e.minutes||0}</td><td>${esc(e.componente||'—')}</td><td>${esc(e.desc)}</td></tr>`).join('')}
    </tbody></table>`:'<div class="empty">Sin eventos en el periodo</div>'}
  </div>`;
}

export function renderTableroCompra(){
  const period=getDashPeriod();
  const evs=eventsInPeriod(null, period, true, state.dashRefDate);
  const map={};
  evs.forEach(e=>{
    let c=e.componente;
    if((!c||c==='No especificado')&&e.desc){ Object.assign(e,camposClasificacion(e.desc)); c=e.componente; }
    if(!c||c==='No especificado') return;
    if(!map[c]) map[c]={comp:c,n:0,minutes:0};
    map[c].n++;
    map[c].minutes+=Number(e.minutes)||0;
  });
  const parts=state.db.parts||[];
  const rows=Object.values(map).map(r=>{
    const match=parts.find(p=>String(p[0]||'').toLowerCase().includes(r.comp.toLowerCase())||r.comp.toLowerCase().includes(String(p[0]||'').toLowerCase()));
    const stock=match?Number(match[2])||0:null;
    const min=match?Number(match[3])||0:null;
    let estado='Sin registro';
    if(stock!=null){
      if(stock<=min) estado='Reponer';
      else estado='OK';
    }
    let prioridad='Baja', score=r.n + (r.minutes/60);
    if(estado==='Reponer') score+=20;
    if(stock===0) score+=15;
    if(score>=25||(r.n>=5&&estado!=='OK')) prioridad='Alta';
    else if(score>=12||r.n>=3) prioridad='Media';
    return {...r,stock,min,estado,prioridad,score,part:match?match[0]:null};
  }).sort((a,b)=>b.score-a.score);

  const altas=rows.filter(r=>r.prioridad==='Alta').length;
  const reponer=rows.filter(r=>r.estado==='Reponer').length;
  document.getElementById('tcKpis').innerHTML=[
    ['Componentes con falla',rows.length,'En el periodo filtrado'],
    ['Prioridad alta',altas,'Comprar / revisar pronto'],
    ['Stock a reponer',reponer,'Bajo mínimo en inventario'],
    ['Horas paro asociadas',(rows.reduce((a,r)=>a+r.minutes,0)/60).toFixed(1)+' h','Suma de eventos clasificados']
  ].map(x=>`<div class="card kpi"><div class="label">${esc(x[0])}</div><div class="value" style="font-size:22px">${esc(String(x[1]))}</div><div class="sub">${esc(x[2])}</div></div>`).join('');

  safeChartDestroy(state.charts,'tc');
  const top=rows.slice(0,10);
  const ctx=document.getElementById('tcChart');
  if(ctx){
    state.charts.tc=new Chart(ctx,{
      type:'bar',
      data:{labels:top.map(r=>r.comp),datasets:[
        {label:'Eventos',data:top.map(r=>r.n),backgroundColor:'#a855f7'},
        {label:'Horas paro',data:top.map(r=>+(r.minutes/60).toFixed(2)),backgroundColor:'#ef4444'}
      ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true}}}
    });
  }
  document.getElementById('tcTable').innerHTML=rows.length?rows.map((r,i)=>`<tr>
    <td>${i+1}</td><td><strong>${esc(r.comp)}</strong>${r.part&&r.part!==r.comp?' <span class="muted">('+esc(r.part)+')</span>':''}</td>
    <td>${r.n}</td><td>${(r.minutes/60).toFixed(1)}</td>
    <td>${r.stock!=null?r.stock:'—'}</td><td>${r.min!=null?r.min:'—'}</td>
    <td>${r.estado==='Reponer'?badge('Reponer'):r.estado==='OK'?badge('Disponible'):'<span class="muted">Sin registro</span>'}</td>
    <td><span class="badge ${r.prioridad==='Alta'?'b-bad':r.prioridad==='Media'?'b-warn':'b-info'}">${r.prioridad}</span></td>
  </tr>`).join(''):'<tr><td colspan="8" class="empty">Sin componentes clasificados en el periodo — importa eventos o reclasifica</td></tr>';
}

export function renderBacklog(){
  document.getElementById('cr_personas').value=state.db.crew.personasTotal||'';
  document.getElementById('cr_horas').value=state.db.crew.horasSemanaPersona||'';
  document.getElementById('cr_indirecto').value=state.db.crew.indirectoPct||'';
  document.getElementById('cr_reserva').value=state.db.crew.reservaEmergenciaPct||'';

  const abiertas=state.db.workOrders.filter(x=>x.status!=='Cerrada');
  document.getElementById('backlogOtTable').innerHTML=abiertas.map(x=>`<tr><td>${esc(x.id)}</td><td>${esc(x.machine)}</td><td>${esc(x.fault)}</td><td>${x.downtime||0}</td><td style="text-align:center"><input type="checkbox" ${x.ready?'checked':''} onchange="backlogToggleReady('${x.id}',this.checked)"></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Sin OTs abiertas</td></tr>';

  const st=getBacklogStats();
  document.getElementById('bkReadyWork').textContent=st.readyWork.toFixed(1);
  document.getElementById('bkNetCapacity').textContent=st.netCapacity.toFixed(1);
  document.getElementById('bkRatio').textContent=st.ratio.toFixed(2)+' sem.';

  if(state.charts.backlog){try{state.charts.backlog.destroy()}catch{}}
  state.charts.backlog=new Chart(document.getElementById('backlogChart'),{type:'bar',data:{labels:['Ready Work (h)','Net Crew Capacity (h/sem)'],datasets:[{data:[st.readyWork,st.netCapacity],backgroundColor:[st.ratio>=2&&st.ratio<=4?'#22c55e':st.ratio<2?'#f59e0b':'#ef4444','#3b82f6']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},title:{display:true,text:'Referencia sana SMRP: 2 a 4 semanas de Ready Backlog'}}}});
}

