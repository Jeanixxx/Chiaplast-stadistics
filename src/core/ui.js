/** Módulo: core/ui.js */

import { state } from './state.js';

import { AREAS, syncMachines } from '../domain/machines.js';
import { iso } from '../domain/dates.js';
import { esc } from './format.js';



import { services, VIEW_CONFIG } from './services.js';



export function hardRefreshApp(){
  try{ services.destroyCharts?.(); }catch{}
  try{ services.destroyFinCharts?.(); }catch{}
  try{ services.invalidateHistoryCache?.(); }catch{}
  try{ syncMachines?.(); }catch{}
  try{
    services.render();
    toast('Interfaz refrescada');
  }catch(e){
    console.error(e);
    if(confirm('No se pudo refrescar en caliente. ¿Recargar la página completa?')) location.reload();
  }
}

export function toggleNavGroup(btn){
  const g=btn.closest('.nav-group');
  if(!g) return;
  g.classList.toggle('open');
  const sp=btn.querySelector('span');
  if(sp) sp.textContent=g.classList.contains('open')?'▾':'▸';
}

const UNDO_STACK=[];

const UNDO_MAX=15;

state.historyPage = 0;

state._prevDbJson = null;

export function undoLastChange(){
  if(!UNDO_STACK.length){ toast('No hay cambios para deshacer','err'); return; }
  const last=UNDO_STACK.pop();
  try{
    state.db=JSON.parse(last.data);
    state._prevDbJson=last.data;
    localStorage.setItem('SL_CMMS_DB_v2', last.data);
    services.render();
    toast('Cambio deshecho');
  }catch{ toast('No se pudo deshacer','err'); }
}

export function toggleFocusMode(){
  document.body.classList.toggle('focus-mode');
  const on=document.body.classList.contains('focus-mode');
  toast(on?'Modo enfoque activado':'Modo enfoque desactivado');
}

/** Hooks de guardado: el sincronizador se registra aquí (antes se reemplazaba save() globalmente). */
export const saveHooks = { before: [], after: [] };

export function save(){
  // Igual que el wrapper original: un error en "antes" impide guardar; un error en "después" se propaga tras guardar.
  saveHooks.before.forEach(fn=>fn());
  const result = persistDb();
  saveHooks.after.forEach(fn=>fn());
  return result;
}

function persistDb(){
  try{
    if(state._prevDbJson){
      UNDO_STACK.push({data:state._prevDbJson,t:Date.now()});
      if(UNDO_STACK.length>UNDO_MAX) UNDO_STACK.shift();
    }
  }catch{}
  state._prevDbJson=JSON.stringify(state.db);
  localStorage.setItem('SL_CMMS_DB_v2',state._prevDbJson);
  try{ services.syncMaintenanceStorageFromDb(); }catch{}
  try{ services.invalidateHistoryCache(); }catch{}
  saveFinConfig();
}

export function saveFinConfig(){
  try{
    const finConfig={
      costoRefaccion:document.getElementById('finCostoRefaccion')?.value||'25000',
      horasHombre:document.getElementById('finHorasHombre')?.value||'8',
      costoHora:document.getElementById('finCostoHora')?.value||'350',
      perdidaProd:document.getElementById('finPerdidaProd')?.value||'5000',
      multas:document.getElementById('finMultas')?.value||'15000',
      machine:document.getElementById('finMachine')?.value||''
    };
    localStorage.setItem('SL_FIN_CONFIG',JSON.stringify(finConfig));
  }catch{}
}

export function loadFinConfig(){
  try{
    const raw=localStorage.getItem('SL_FIN_CONFIG');
    if(!raw) return;
    const c=JSON.parse(raw);
    const map={
      costoRefaccion:'finCostoRefaccion',
      horasHombre:'finHorasHombre',
      costoHora:'finCostoHora',
      perdidaProd:'finPerdidaProd',
      multas:'finMultas'
    };
    Object.entries(map).forEach(([k,id])=>{
      if(c[k]!=null){ const el=document.getElementById(id); if(el) el.value=c[k]; }
    });
    if(c.machine){
      const sel=document.getElementById('finMachine');
      if(sel){ /* se aplica tras fillFinMachineSelect */ window._finMachinePref=c.machine; }
    }
  }catch{}
}

export function toast(msg, type){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg;
  t.className='toast show'+(type==='err'?' err':' ok');
  clearTimeout(window._toastTimer);
  window._toastTimer=setTimeout(()=>{
    t.classList.remove('show');
    setTimeout(()=>{ t.style.display='none'; t.className='toast'; }, 280);
  }, 2600);
  t.style.display='block';
}

export function emptyState(title, subtitle, actionHtml){
  return `<div class="empty"><strong>${esc(title)}</strong><div class="muted" style="margin:6px 0 10px">${esc(subtitle||'')}</div>${actionHtml||''}</div>`;
}

export function flashLastTableRow(tableId){
  const tb=document.getElementById(tableId);
  if(!tb) return;
  const row=tb.querySelector('tr');
  if(!row || row.querySelector('.empty')) return;
  row.classList.remove('row-flash');
  void row.offsetWidth;
  row.classList.add('row-flash');
}

export function saveUiState(){
  try{
    localStorage.setItem('SL_CMMS_STATE', JSON.stringify({
      area: state.currentArea,
      machine: state.selectedMachine||'',
      period: services.getDashPeriod(),
      date: state.dashRefDate,
      dark: document.documentElement.classList.contains('dark'),
      view: state.currentView
    }));
  }catch{}
}

export function loadUiState(){
  try{
    const raw=localStorage.getItem('SL_CMMS_STATE');
    if(!raw) return;
    const s=JSON.parse(raw);
    if(s.area==='__ALL__' || AREAS[s.area]) state.currentArea=s.area;
    if(s.machine!=null) state.selectedMachine=s.machine;
    if(['day','week','month'].includes(s.period)) window.dashPeriod=s.period;
    if(s.date) state.dashRefDate=s.date;
    if(s.dark) document.documentElement.classList.add('dark');
    if(s.view && Object.prototype.hasOwnProperty.call(VIEW_CONFIG,s.view)) state.currentView=s.view;
  }catch{}
}

export function toggleDarkMode(){
  document.documentElement.classList.toggle('dark');
  const on=document.documentElement.classList.contains('dark');
  const btn=document.getElementById('darkModeBtn');
  if(btn) btn.textContent=on?'☀️ Modo claro':'🌙 Modo oscuro';
  saveUiState();
  services.render();
}

export function toggleMobileMenu(){
  const sb=document.getElementById('sidebar');
  const bd=document.getElementById('sidebarBackdrop');
  if(!sb) return;
  const open=sb.classList.toggle('open');
  if(bd) bd.style.display=open?'block':'none';
}

export function closeMobileMenu(){
  const sb=document.getElementById('sidebar');
  const bd=document.getElementById('sidebarBackdrop');
  if(sb) sb.classList.remove('open');
  if(bd) bd.style.display='none';
}

export function exportCSV(){
  const rows=[['Fecha','Tipo','Máquina','Descripción','Técnico','Resultado']];
  (state.db.history||[]).forEach(h=>rows.push([h[0],h[1],h[2],String(h[3]||'').replace(/;/g,','),h[4],h[5]]));
  const csv='\uFEFF'+rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='historial_chiaplast_'+iso(new Date())+'.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV exportado');
}

export { esc, escAttr, badge } from './format.js';

