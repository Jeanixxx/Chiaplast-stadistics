/** Módulo: ui/charts.js */

import { state } from '../core/state.js';

import { esc } from '../core/ui.js';

import { MACHINES } from '../domain/machines.js';

import { eventsInPeriod, productionFromEvents } from '../domain/production.js';

import { getDashPeriod } from '../views/dashboard.js';

export function destroyCharts(){
  Object.values(state.charts).forEach(c=>{try{c.destroy()}catch(e){}});
  state.charts={};
  // También limpia gráficos financieros si se pide un refresh global
  Object.values(state.finCharts).forEach(c=>{try{c.destroy()}catch(e){}});
  state.finCharts={};
}

export function destroyFinCharts(){
  Object.values(state.finCharts).forEach(c=>{try{c.destroy()}catch(e){}});
  state.finCharts={};
}

export function safeChartDestroy(bag, key){
  if(bag&&bag[key]){ try{ bag[key].destroy(); }catch(e){} bag[key]=null; }
}

export function renderEventRankings(){
  const period=getDashPeriod();
  const ids=MACHINES(), mapEv={}, mapMin={}, mapWaste={};
  ids.forEach(id=>{mapEv[id]=0;mapMin[id]=0;mapWaste[id]=0;});
  eventsInPeriod(null,period,true,state.dashRefDate).forEach(e=>{
    if(mapEv[e.machine]===undefined)return;
    mapEv[e.machine]++;
    mapMin[e.machine]+=(Number(e.minutes)||0);
  });
  ids.forEach(id=>{mapWaste[id]=Number(productionFromEvents(eventsInPeriod(id,period,false,state.dashRefDate)).waste)||0;});
  const most=Object.entries(mapEv).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const least=[...most].sort((a,b)=>a[1]-b[1]||a[0].localeCompare(b[0]));
  const down=Object.entries(mapMin).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const waste=Object.entries(mapWaste).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const evHtml=a=>a.slice(0,5).map(([m,n],i)=>`<div class="item"><div class="flex"><span style="font-size:12px"><strong>${i+1}.</strong> ${esc(m)}</span><span class="badge ${n?'b-warn':'b-ok'}">${n} evento${n===1?'':'s'}</span></div></div>`).join('')||'<div class="empty">Sin datos en este periodo</div>';
  const downHtml=a=>a.slice(0,5).map(([m,mins],i)=>`<div class="item"><div class="flex"><span style="font-size:12px"><strong>${i+1}.</strong> ${esc(m)}</span><span class="badge ${mins?'b-bad':'b-ok'}">${(mins/60).toFixed(1)} h</span></div></div>`).join('')||'<div class="empty">Sin paros en este periodo</div>';
  const wasteHtml=a=>a.slice(0,5).map(([m,kg],i)=>`<div class="item"><div class="flex"><span style="font-size:12px"><strong>${i+1}.</strong> ${esc(m)}</span><span class="badge ${kg?'b-bad':'b-ok'}">${Math.round(kg).toLocaleString('es-MX')} kg</span></div></div>`).join('')||'<div class="empty">Sin datos de producción</div>';
  const put=(id,html)=>{const el=document.getElementById(id);if(el)el.innerHTML=html;};
  put('rankMost',evHtml(most));put('rankLeast',evHtml(least));put('rankDowntime',downHtml(down));put('rankWaste',wasteHtml(waste));
}

