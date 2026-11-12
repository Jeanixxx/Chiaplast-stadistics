/** Módulo: bootstrap.js */

import { services } from './core/services.js';
import { render, getDashPeriod, syncPeriodControls, updateDashPeriodLabel } from './views/dashboard.js';
import { syncMaintenanceStorageFromDb } from './features/monthly-import.js';
import { destroyCharts, destroyFinCharts } from './ui/charts.js';
import { invalidateHistoryCache } from './views/history.js';
import { fillFichaMachineSelect } from './views/backlog.js';
import { fillNegligenciaMachineSelect } from './features/purchases.js';

// Registro de servicios de capas superiores (ver src/core/services.js). Debe ir antes de cualquier llamada a save()/render().
Object.assign(services, {
  render, getDashPeriod, syncMaintenanceStorageFromDb, destroyCharts, destroyFinCharts, invalidateHistoryCache,
  fillAreaSelectUI, fillReportMachineSelect, fillFinMachineSelect, fillFichaMachineSelect, fillNegligenciaMachineSelect,
  syncPeriodControls, updateDashPeriodLabel, closeModal, navigateToView, save,
});
// Arranque: sincroniza el almacenamiento de mantenimiento antes de renderizar (antes era una sentencia suelta en monthly-import).
importMaintenanceStorageIntoDb();
save();

import { state } from './core/state.js';

import { closeMobileMenu, loadFinConfig, loadUiState, save, toast, undoLastChange } from './core/ui.js';

import { iso } from './domain/machines.js';

import { fillFinMachineSelect, renderFinanciero } from './features/financial.js';

import { mProximoLunes, renderMealBoard, renderMealEmpleados } from './features/meals.js';

import { fillReportMachineSelect } from './features/report-pdf.js';
import { importMaintenanceStorageIntoDb } from './features/monthly-import.js';

import { closeModal, fillAreaSelectUI, navigateToView, openModal } from './ui/modals.js';


document.getElementById('m_lunes').value=iso(mProximoLunes());

if(document.getElementById('ng_fecha'))document.getElementById('ng_fecha').value=iso(new Date());

document.getElementById('meal-empleados').style.display='none';

document.getElementById('meal-historial').style.display='none';

renderMealEmpleados();

renderMealBoard();

document.getElementById('weeklyDate').value=iso(new Date());

loadUiState();

loadFinConfig();

if(document.getElementById('teamRefDate')) document.getElementById('teamRefDate').value=state.dashRefDate;

window.dashPeriod=window.dashPeriod||'day';

updateDashPeriodLabel();

fillAreaSelectUI();

window.dashPeriod=window.dashPeriod||'day';

syncPeriodControls();

fillReportMachineSelect();

fillFinMachineSelect();

const darkBtn=document.getElementById('darkModeBtn');

if(darkBtn) darkBtn.textContent=document.documentElement.classList.contains('dark')?'☀️ Modo claro':'🌙 Modo oscuro';

navigateToView(state.currentView);

setTimeout(()=>{ const bl=document.getElementById('bootLoader'); if(bl) bl.classList.add('hide'); setTimeout(()=>bl&&bl.remove(),400); }, 350);

window.addEventListener('resize',()=>{
  clearTimeout(state._finResizeTimer);
  state._finResizeTimer=setTimeout(()=>{
    if(document.getElementById('financiero')?.classList.contains('active')) renderFinanciero();
  },280);
});

// Atajos de teclado

document.addEventListener('keydown',e=>{
  const tag=(e.target&&e.target.tagName||'').toLowerCase();
  const typing=tag==='input'||tag==='textarea'||tag==='select';
  if(e.ctrlKey && e.key.toLowerCase()==='z' && !typing){ e.preventDefault(); undoLastChange(); return; }
  if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='s'){ e.preventDefault(); save(); toast('Datos guardados'); return; }
  if(typing) return;
  if(e.ctrlKey && e.key.toLowerCase()==='n'){ e.preventDefault(); openModal('workOrder'); }
  if(e.ctrlKey && e.key.toLowerCase()==='e'){ e.preventDefault(); openModal('event'); }
  if(e.ctrlKey && e.key.toLowerCase()==='f'){
    e.preventDefault();
    const btn=[...document.querySelectorAll('.nav button')].find(b=>b.dataset.view==='historial');
    if(btn) btn.click();
    setTimeout(()=>document.getElementById('historyFilter')?.focus(),50);
  }
  if(e.ctrlKey && e.key>='1' && e.key<='9'){
    e.preventDefault();
    const btns=[...document.querySelectorAll('.nav button')];
    const idx=parseInt(e.key,10)-1;
    if(btns[idx]) btns[idx].click();
  }
  if(e.key==='Escape'){ closeModal(); closeMobileMenu(); document.body.classList.remove('focus-mode'); }
});

// Snapshot inicial para undo

try{ state._prevDbJson=JSON.stringify(state.db); }catch{}

