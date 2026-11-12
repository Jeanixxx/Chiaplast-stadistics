/** Módulo: views/machine-detail.js */
import { services } from '../core/services.js';
import { Chart } from '../vendor.js';

import { state } from '../core/state.js';

import { badge, esc } from '../core/ui.js';

import { MACHINES, iso, parseKg } from '../domain/machines.js';

import { downtimeMinutes, eventDate, eventsInPeriod, periodMinutes, periodRange, productionFromEvents } from '../domain/production.js';

import { destroyCharts, renderEventRankings } from '../ui/charts.js';


import { renderHistory } from './history.js';

import { renderEvents, renderWO } from './operations.js';

import { renderPreventiveChecklist } from './preventive.js';

export function setMachinePeriod(p,btn){
  state.machinePeriod=p;
  window.dashPeriod=p; // mantiene coherencia con el periodo global del sidebar
  document.querySelectorAll('#dashActivePanel .tab').forEach(x=>x.classList.remove('active'));
  if(btn) btn.classList.add('active');
  services.syncPeriodControls();
  services.updateDashPeriodLabel();
  renderMachineDetail();
  // También refresca pestañas que dependen del periodo
  renderWO(); renderEvents(); renderHistory();
}

export function renderMachineDetail(){
  const mid=state.selectedMachine;
  document.getElementById('activeMachineLabel').textContent=mid;
  const periods=['day','week','month'];
  const labels={day:'Día',week:'Semana',month:'Mes'};
  const period=state.machinePeriod||'day';
  const {start,end}=periodRange(period, state.dashRefDate);
  const rangeTxt=iso(start)+(period==='day'?'':' → '+iso(end));

  // Filtrar SOLO eventos de esta máquina en el rango del periodo
  const evs=state.db.events.filter(x=>{
    if(x.machine!==mid) return false;
    const d=eventDate(x);
    return d>=start && d<=end;
  }).sort((a,b)=>String(b.date).localeCompare(String(a.date)));

  const mins=downtimeMinutes(evs);
  const totalMin=periodMinutes(period, state.dashRefDate);
  const pctOff=Math.min(100,(mins/totalMin)*100);
  const pctOn=Math.max(0,100-pctOff);
  const prod=productionFromEvents(evs);

  document.getElementById('machinePeriodKpis').innerHTML=[
    ['% tiempo apagado / parado', pctOff.toFixed(1)+'%', labels[period]+': '+rangeTxt],
    ['Veces que paró', evs.length, 'Eventos en '+rangeTxt],
    ['Horas de paro', (mins/60).toFixed(2)+' h', 'Acumulado del periodo'],
    ['Kg desperdiciados', prod.waste.toLocaleString('es-MX',{maximumFractionDigits:0}), 'Obj '+prod.target.toLocaleString('es-MX')+' / Real '+prod.actual.toLocaleString('es-MX')]
  ].map(x=>`<div class="card kpi"><div class="label">${x[0]}</div><div class="value">${x[1]}</div><div class="sub">${x[2]}</div></div>`).join('');

  // Comparativa día/semana/mes anclada a la misma fecha de referencia
  const comp=periods.map(p=>{
    const rg=periodRange(p, state.dashRefDate);
    const e=state.db.events.filter(x=>x.machine===mid && eventDate(x)>=rg.start && eventDate(x)<=rg.end);
    const mi=downtimeMinutes(e);
    const pr=productionFromEvents(e);
    return {p, label:labels[p], stops:e.length, pct:(mi/periodMinutes(p,state.dashRefDate)*100).toFixed(1), hours:(mi/60).toFixed(1), waste:pr.waste, range:iso(rg.start)+(p==='day'?'':' → '+iso(rg.end))};
  });

  const listHtml=evs.length?evs.slice(0,30).map(x=>`<div class="item"><div class="flex"><strong>${esc(x.type)}</strong>${badge(x.severity)}</div><div style="font-size:12px;margin:4px 0">${esc(x.desc)}</div><div class="muted" style="font-size:10px">${esc(x.date)} • ${x.minutes||0} min${(x.kgTarget||x.kgActual)?` • Kg real ${parseKg(x.kgActual)} / obj ${parseKg(x.kgTarget)}`:''}</div></div>`).join(''):'<div class="empty">Sin eventos de <strong>'+esc(mid)+'</strong> en '+esc(rangeTxt)+'</div>';
  const compHtml='<div class="muted mt" style="font-size:11px">Comparativa (fecha ref. '+esc(state.dashRefDate)+'):<br>'+comp.map(c=>`<strong>${c.label}</strong> [${esc(c.range)}]: ${c.stops} eventos, ${c.pct}% parado, ${c.hours}h, desperdicio ${c.waste.toLocaleString('es-MX')} kg`).join('<br>')+'</div>';
  document.getElementById('machinePeriodEvents').innerHTML=listHtml+compHtml;

  if(state.charts.machinePie){try{state.charts.machinePie.destroy()}catch{}}
  if(state.charts.machineCause){try{state.charts.machineCause.destroy()}catch{}}
  if(state.charts.machineDay){try{state.charts.machineDay.destroy()}catch{}}
  const pieCtx=document.getElementById('machineDowntimePie');
  if(pieCtx){
    state.charts.machinePie=new Chart(pieCtx,{type:'doughnut',data:{labels:['Parado %','Operativo %'],datasets:[{data:[+pctOff.toFixed(2),+pctOn.toFixed(2)],backgroundColor:['#ef4444','#22c55e']}]},options:{responsive:true,maintainAspectRatio:false}});
  }
  const types={};evs.forEach(x=>types[x.type]=(types[x.type]||0)+(Number(x.minutes)||0)/60);
  const causeCtx=document.getElementById('machineCauseChart');
  if(causeCtx){
    state.charts.machineCause=new Chart(causeCtx,{type:'bar',data:{labels:Object.keys(types).length?Object.keys(types):['Sin datos'],datasets:[{label:'Horas',data:Object.keys(types).length?Object.values(types):[0],backgroundColor:'#f59e0b'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
  }
  const byDay={};
  evs.forEach(x=>{const d=iso(eventDate(x));byDay[d]=(byDay[d]||0)+(Number(x.minutes)||0)/60;});
  const fillDays=[];
  for(let t=new Date(start.getFullYear(),start.getMonth(),start.getDate()); t<=end; t.setDate(t.getDate()+1)){
    fillDays.push(iso(t));
  }
  const days=fillDays.length?fillDays:Object.keys(byDay).sort();
  const dayCtx=document.getElementById('machineDayChart');
  if(dayCtx){
    state.charts.machineDay=new Chart(dayCtx,{type:'bar',data:{labels:days.length?days:['—'],datasets:[{label:'Horas paradas',data:days.length?days.map(d=>+(byDay[d]||0).toFixed(2)):[0],backgroundColor:'#ef4444'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
  }
}

export function renderCharts(){
  destroyCharts();
  services.updateDashPeriodLabel();
  services.syncPeriodControls();
  const period=services.getDashPeriod();
  const areaEvents=eventsInPeriod(null,period,true,state.dashRefDate);
  const scopeIds=new Set(MACHINES());

  // Paros por causa: solo el periodo seleccionado.
  const types={};areaEvents.forEach(x=>types[x.type]=(types[x.type]||0)+(Number(x.minutes)||0)/60);
  const causeCtx=document.getElementById('downtimeChart');
  if(causeCtx){
    state.charts.downtime=new Chart(causeCtx,{type:'doughnut',data:{labels:Object.keys(types).length?Object.keys(types):['Sin paros'],datasets:[{data:Object.keys(types).length?Object.values(types):[1]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10}}}}}});
  }

  // Producción útil real frente al objetivo.
  const prod=productionFromEvents(areaEvents);
  const prodCtx=document.getElementById('productionCompareChart');
  if(prodCtx){
    state.charts.productionCompareChart=new Chart(prodCtx,{type:'bar',data:{labels:['Kg'],datasets:[
      {label:'Objetivo',data:[prod.target],backgroundColor:'#64748b',borderRadius:4},
      {label:'Real útil',data:[prod.actual],backgroundColor:'#22c55e',borderRadius:4}
    ]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10}}}},scales:{x:{beginAtZero:true,ticks:{font:{size:10}}},y:{grid:{display:false}}}}});
  }
  const kpi=document.getElementById('productionKpis');
  if(kpi)kpi.innerHTML=[
    ['Kg objetivo',prod.target.toLocaleString('es-MX',{maximumFractionDigits:0})],
    ['Kg reales',prod.actual.toLocaleString('es-MX',{maximumFractionDigits:0})],
    ['Kg desperdiciados',prod.waste.toLocaleString('es-MX',{maximumFractionDigits:0})]
  ].map(x=>`<div class="card kpi"><div class="label">${x[0]}</div><div class="value">${x[1]}</div></div>`).join('');

  const freq={};areaEvents.forEach(x=>{const k=x.desc||x.type;freq[k]=(freq[k]||0)+1;});
  const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const incidentEl=document.getElementById('topIncidents');
  if(incidentEl)incidentEl.innerHTML=top.length?top.map(([k,n])=>`<div class="item"><div class="flex"><span style="font-size:12px">${esc(k)}</span><span class="badge b-warn">${n}×</span></div></div>`).join(''):'<div class="empty">Sin incidencias en este periodo</div>';

  const alertEl=document.getElementById('activeAlerts');
  if(alertEl)alertEl.innerHTML=state.db.predictive.filter(x=>scopeIds.has(x[1])&&(!state.selectedMachine||x[1]===state.selectedMachine)&&x[6]!=='Normal').map(x=>`<div class="alert"><strong>${esc(x[1])} • ${esc(x[2])}</strong><br>${esc(x[3])} ${esc(x[4])} • ${esc(x[6])}</div>`).join('')||'<div class="success">No hay alertas predictivas fuera de normal.</div>';
  renderEventRankings();
  renderPreventiveChecklist();
}

