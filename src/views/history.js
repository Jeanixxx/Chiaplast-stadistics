/** Módulo: views/history.js */
import { services } from '../core/services.js';

import { state } from '../core/state.js';

import { badge, esc, save, toast } from '../core/ui.js';

import { MACHINES, isAllAreas, iso, parseLocalDate } from '../domain/machines.js';

import { eventsInPeriod, periodRange } from '../domain/production.js';


const historySelected=new Set();

state._histFilterCache = {key:'', rows:null};

export function invalidateHistoryCache(){ state._histFilterCache={key:'', rows:null}; }

function historyFilteredRows(){
 const q=(document.getElementById('historyFilter')?.value||'').toLowerCase();
 const scopeIds=new Set(MACHINES());
 const period=services.getDashPeriod();
 const {start,end}=periodRange(period, state.dashRefDate);
 const key=[q,state.selectedMachine||'',state.currentArea||'',period,state.dashRefDate,iso(start),iso(end),state.db.history.length].join('|');
 if(state._histFilterCache.key===key && state._histFilterCache.rows) return state._histFilterCache.rows;
 const rows=state.db.history.map((r,idx)=>({r,idx})).filter(({r})=>{
   if(state.selectedMachine && r[2]!==state.selectedMachine) return false;
   if(r[2] && r[2]!=='SIN ASIGNAR' && !scopeIds.has(r[2])) return false;
   const d=parseLocalDate(r[0]);
   if(d<start || d>end) return false;
   if(!q) return true;
   return r.join(' ').toLowerCase().includes(q);
 });
 state._histFilterCache={key, rows};
 return rows;
}

function updateHistorySelCount(){
  const el=document.getElementById('historySelCount');
  if(el) el.textContent=historySelected.size+' seleccionados';
}

export function historyToggleSel(idx,on){
  if(on) historySelected.add(idx); else historySelected.delete(idx);
  updateHistorySelCount();
}

export function historySelectPage(on){
  const rows=historyFilteredRows();
  const limit=Number(document.getElementById('historyPageSize')?.value)||50;
  const slice=rows.slice(state.historyPage*limit, state.historyPage*limit+limit);
  slice.forEach(({idx})=>{ if(on) historySelected.add(idx); else historySelected.delete(idx); });
  renderHistory();
}

export function historySelectFiltered(on){
  const rows=historyFilteredRows();
  if(on) rows.forEach(({idx})=>historySelected.add(idx));
  else historySelected.clear();
  renderHistory();
}

export function historyDeleteSelected(){
  if(!historySelected.size){ toast('No hay registros seleccionados','err'); return; }
  if(!confirm('¿Eliminar '+historySelected.size+' registros del historial?')) return;
  const idxs=[...historySelected].sort((a,b)=>b-a);
  idxs.forEach(i=>{ if(state.db.history[i]) state.db.history.splice(i,1); });
  historySelected.clear();
  invalidateHistoryCache();
  save(); renderHistory(); toast(idxs.length+' registros eliminados');
}

export function historyExportSelected(){
  const idxs=[...historySelected].sort((a,b)=>a-b);
  const source=idxs.length?idxs.map(i=>state.db.history[i]).filter(Boolean):historyFilteredRows().map(x=>x.r);
  if(!source.length){ toast('Nada que exportar','err'); return; }
  const rows=[['Fecha','Tipo','Máquina','Descripción','Técnico','Resultado']];
  source.forEach(h=>rows.push([h[0],h[1],h[2],String(h[3]||'').replace(/;/g,','),h[4],h[5]]));
  const csv='\uFEFF'+rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='historial_seleccion_'+iso(new Date())+'.csv'; a.click();
  toast('CSV exportado ('+source.length+')');
}

export function renderHistory(){
 const rows=historyFilteredRows();
 const limit=Number(document.getElementById('historyPageSize')?.value)||50;
 const total=rows.length;
 const pages=Math.max(1, Math.ceil(total/limit));
 if(state.historyPage>=pages) state.historyPage=pages-1;
 if(state.historyPage<0) state.historyPage=0;
 const slice=rows.slice(state.historyPage*limit, state.historyPage*limit+limit);
 const period=services.getDashPeriod();
 const {start,end}=periodRange(period, state.dashRefDate);
 const hl=document.getElementById('historyFilterLabel');
 if(hl){
   const areaTxt=isAllAreas()?'Toda la planta':state.currentArea;
   const machTxt=state.selectedMachine||'todas las máquinas';
   hl.textContent=`Filtro: ${areaTxt} · ${machTxt} · ${iso(start)}${period==='day'?'':' → '+iso(end)} · ${total} registros`;
 }
 document.getElementById('historyTable').innerHTML=slice.map(({r,idx})=>`<tr>
   <td><input type="checkbox" ${historySelected.has(idx)?'checked':''} onchange="historyToggleSel(${idx},this.checked)"></td>
   <td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td>
   <td><input value="${esc(r[3])}" style="min-width:220px" onchange="historyEditDesc(${idx},this.value)"></td>
   <td>${esc(r[4])}</td><td>${esc(r[5])}</td>
   <td><button class="btn red" onclick="historyDeleteRow(${idx})">✕</button></td></tr>`).join('')||`<tr><td colspan="8" class="empty">Sin registros en el alcance actual (área / máquina / periodo)</td></tr>`;
 const pager=document.getElementById('historyPager');
 if(pager){
   pager.innerHTML=`<button class="btn" onclick="historyPage=Math.max(0,historyPage-1);renderHistory()" ${state.historyPage<=0?'disabled':''}>← Anterior</button>
     <span class="muted" style="font-size:12px">Página ${state.historyPage+1} de ${pages} · mostrando ${slice.length} de ${total}</span>
     <button class="btn" onclick="historyPage=Math.min(${pages-1},historyPage+1);renderHistory()" ${state.historyPage>=pages-1?'disabled':''}>Siguiente →</button>`;
 }
 updateHistorySelCount();
 const ca=document.getElementById('historyCheckAll');
 if(ca) ca.checked=slice.length>0 && slice.every(({idx})=>historySelected.has(idx));
}

export function historyEditDesc(idx,value){if(!state.db.history[idx])return;state.db.history[idx][3]=value;save();toast('Descripción actualizada');}

export function historyDeleteRow(idx){if(!state.db.history[idx])return;if(!confirm('¿Eliminar este registro del historial?'))return;state.db.history.splice(idx,1);historySelected.delete(idx);invalidateHistoryCache();save();renderHistory();toast('Registro eliminado');}

export function recomendarRefacciones(){
  const period=services.getDashPeriod();
  const evs=eventsInPeriod(null, period, true, state.dashRefDate);
  const comps={};
  evs.forEach(e=>{
    const c=e.componente;
    if(!c || c==='No especificado') return;
    comps[c]=(comps[c]||0)+1;
  });
  return Object.entries(comps).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([comp,freq])=>({
    comp,freq,prioridad:freq>=5?'Alta':freq>=3?'Media':'Baja'
  }));
}

export function renderParts(){
 document.getElementById('partsTable').innerHTML=state.db.parts.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${r[2]}</td><td>${r[3]}</td><td>${esc(r[4])}</td><td>${r[2]<=r[3]?badge('Reponer'):'Disponible'}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">Sin refacciones</td></tr>';
 const reco=document.getElementById('partsRecoList');
 if(reco){
   const top=recomendarRefacciones();
   reco.innerHTML=top.length?top.map((x,i)=>`<div class="item"><div class="flex"><span><strong>${i+1}.</strong> ${esc(x.comp)}</span><span class="badge ${x.prioridad==='Alta'?'b-bad':x.prioridad==='Media'?'b-warn':'b-info'}">${x.freq}× · ${x.prioridad}</span></div>
     <div class="muted" style="font-size:11px;margin-top:4px">Sugerencia: mantener stock mínimo de refacción asociada a «${esc(x.comp)}».</div></div>`).join(''):'<div class="empty">Sin componentes clasificados en el periodo para recomendar stock</div>';
 }
}

