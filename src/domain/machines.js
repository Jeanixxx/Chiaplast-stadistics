/** Módulo: domain/machines.js */

import { state } from '../core/state.js';

import { esc, save } from '../core/ui.js';

import { seed, seedMealEmployees } from '../data/seed.js';

import { fillFinMachineSelect } from '../features/financial.js';

import { fillNegligenciaMachineSelect } from '../features/purchases.js';

import { fillReportMachineSelect } from '../features/report-pdf.js';

import { fillAreaSelectUI } from '../ui/modals.js';

import { fillFichaMachineSelect } from '../views/backlog.js';

import { render } from '../views/dashboard.js';

// =============================================================================
// BASE DE DATOS EDITABLE DE ÁREAS Y MÁQUINAS
// ---------------------------------------------------------------------------
// Modifica aquí las áreas, códigos de máquina y kg objetivo diario (Cantidad).
// Formato: { area: 'NombreÁrea', code: 'CÓDIGO-MÁQUINA', dailyKg: número }
// Al guardar y recargar la página se usan estos datos para el selector de área
// y la lista de máquinas. Si ya tienes datos en localStorage, los equipos
// nuevos se agregan automáticamente.
// =============================================================================

export const MACHINE_DB = [
  // --- Cam ---
  {area:'Cam', code:'BK-1', dailyKg:2000},
  {area:'Cam', code:'BK-2', dailyKg:2000},
  {area:'Cam', code:'BK-3', dailyKg:2000},
  {area:'Cam', code:'BK-4', dailyKg:1500},
  {area:'Cam', code:'BK-5', dailyKg:2500},
  {area:'Cam', code:'BK-6', dailyKg:2000},
  {area:'Cam', code:'BK-7', dailyKg:2500},
  {area:'Cam', code:'BK-8', dailyKg:2000},
  {area:'Cam', code:'BNG-1', dailyKg:800},
  {area:'Cam', code:'BNG-2', dailyKg:800},
  {area:'Cam', code:'BC-1', dailyKg:500},
  {area:'Cam', code:'IMP-1', dailyKg:0},
  {area:'Cam', code:'IMP-2', dailyKg:0},
  {area:'Cam', code:'IMP-3', dailyKg:0},
  {area:'Cam', code:'FLEJADORA', dailyKg:0},
  // --- Dim ---
  {area:'Dim', code:'BM-1', dailyKg:4000},
  {area:'Dim', code:'BM-2', dailyKg:4000},
  {area:'Dim', code:'BM-3', dailyKg:4000},
  {area:'Dim', code:'BM-4', dailyKg:2000},
  {area:'Dim', code:'BM-5', dailyKg:4000},
  {area:'Dim', code:'BD-1', dailyKg:4000},
  {area:'Dim', code:'BD-2', dailyKg:4000},
  {area:'Dim', code:'BD-3', dailyKg:4000},
  {area:'Dim', code:'SELLADORA M1', dailyKg:0},
  {area:'Dim', code:'SELLADORA M2', dailyKg:0},
  {area:'Dim', code:'SELLADORA M3', dailyKg:0},
  {area:'Dim', code:'SELLADORA M4', dailyKg:0},
  {area:'Dim', code:'SELLADORA M5', dailyKg:0},
  {area:'Dim', code:'SELLADORA M6', dailyKg:0},
  {area:'Dim', code:'HORNO M', dailyKg:0},
  {area:'Dim', code:'FLEJADORA', dailyKg:0},
  // --- Bsl ---
  {area:'Bsl', code:'BW-1', dailyKg:0},
  {area:'Bsl', code:'BN-1', dailyKg:4000},
  {area:'Bsl', code:'BN-2', dailyKg:4000},
  {area:'Bsl', code:'BN-3', dailyKg:4000},
  {area:'Bsl', code:'BN-4', dailyKg:4000},
  {area:'Bsl', code:'B-02', dailyKg:500},
  {area:'Bsl', code:'B-03', dailyKg:800},
  {area:'Bsl', code:'B-06', dailyKg:800},
  {area:'Bsl', code:'BSL-1', dailyKg:1584},
  {area:'Bsl', code:'BSL-2', dailyKg:1320},
  {area:'Bsl', code:'BSL-3', dailyKg:1320},
  {area:'Bsl', code:'BSL-4', dailyKg:1320},
  {area:'Bsl', code:'BSL-5', dailyKg:1584},
  {area:'Bsl', code:'BSL-6', dailyKg:924},
  {area:'Bsl', code:'BD-4', dailyKg:4000},
  {area:'Bsl', code:'FLEJADORA', dailyKg:0},
  {area:'Bsl', code:'ELEVADOR H', dailyKg:0},
  // --- Extrusión 1 ---
  {area:'Extrusión 1', code:'EXT-19', dailyKg:1100},
  {area:'Extrusión 1', code:'ECB-1', dailyKg:1700},
  {area:'Extrusión 1', code:'CRI-3', dailyKg:1200},
  {area:'Extrusión 1', code:'CRI-4', dailyKg:1200},
  {area:'Extrusión 1', code:'CRI-5', dailyKg:1200},
  {area:'Extrusión 1', code:'EXT-6', dailyKg:600},
  {area:'Extrusión 1', code:'EXT-8', dailyKg:1500},
  {area:'Extrusión 1', code:'EXT-9', dailyKg:1500},
  {area:'Extrusión 1', code:'EXT-10', dailyKg:1000},
  {area:'Extrusión 1', code:'EXT-11', dailyKg:1000},
  {area:'Extrusión 1', code:'EXT-12', dailyKg:1100},
  {area:'Extrusión 1', code:'EXT-13', dailyKg:700},
  {area:'Extrusión 1', code:'EXT-14', dailyKg:1000},
  {area:'Extrusión 1', code:'EXT-15', dailyKg:900},
  {area:'Extrusión 1', code:'EXT-16', dailyKg:1300},
  {area:'Extrusión 1', code:'EXT-17', dailyKg:1000},
  // --- Extrusión 2 ---
  {area:'Extrusión 2', code:'EXT-A4', dailyKg:800},
  {area:'Extrusión 2', code:'EXT-A5', dailyKg:700},
  {area:'Extrusión 2', code:'EXT-A6', dailyKg:700},
  {area:'Extrusión 2', code:'EXT-A7', dailyKg:900},
  {area:'Extrusión 2', code:'EXT-A8', dailyKg:600},
  {area:'Extrusión 2', code:'EXT-A9', dailyKg:700},
  {area:'Extrusión 2', code:'EXT-A10', dailyKg:500},
  {area:'Extrusión 2', code:'EXT-A11', dailyKg:800},
  {area:'Extrusión 2', code:'EXT-A12', dailyKg:1000},
  {area:'Extrusión 2', code:'EXT-A13', dailyKg:1200},
  {area:'Extrusión 2', code:'EXT-N3', dailyKg:4300},
  {area:'Extrusión 2', code:'EXT-N4', dailyKg:4000},
  {area:'Extrusión 2', code:'EXT-N5', dailyKg:4000},
  {area:'Extrusión 2', code:'EXT-N6', dailyKg:3500},
  {area:'Extrusión 2', code:'EXT-N7', dailyKg:3500},
  {area:'Extrusión 2', code:'CRI-1', dailyKg:4000},
  {area:'Extrusión 2', code:'CRI-2', dailyKg:4000}
];

// Catálogo editable (overrides en localStorage)

state.LIVE_MACHINE_DB = (()=>{
  try{
    const raw=localStorage.getItem('SL_MACHINE_DB_CUSTOM');
    if(raw){ const arr=JSON.parse(raw); if(Array.isArray(arr)&&arr.length) return arr; }
  }catch{}
  return MACHINE_DB.map(r=>({area:r.area,code:r.code,dailyKg:Number(r.dailyKg)||0}));
})();

export const AREAS = {};

export const MACHINE_TARGETS = {};

state.AREA_ORDER = [];

export function rebuildAreasFromLive(){
  Object.keys(AREAS).forEach(k=>delete AREAS[k]);
  Object.keys(MACHINE_TARGETS).forEach(k=>delete MACHINE_TARGETS[k]);
  state.LIVE_MACHINE_DB.forEach(row=>{
    if(!row||!row.code) return;
    const area=row.area||'Sin área';
    if(!AREAS[area]) AREAS[area]=[];
    if(!AREAS[area].includes(row.code)) AREAS[area].push(row.code);
    MACHINE_TARGETS[row.code]=Number(row.dailyKg)||0;
  });
  state.AREA_ORDER.length=0;
  Object.keys(AREAS).forEach(a=>state.AREA_ORDER.push(a));
}

rebuildAreasFromLive();

/** Centraliza catálogo → AREAS/TARGETS → db.machines → selectores UI */

export function syncMachines(opts){
  rebuildAreasFromLive();
  if(typeof state.db!=='undefined' && state.db && state.db.machines){
    state.LIVE_MACHINE_DB.forEach(row=>{
      let m=state.db.machines.find(x=>x.id===row.code);
      if(!m){
        state.db.machines.push({id:row.code,name:row.code,status:'Operando',runtime:0,cycles:0,availability:100,powerKwh:0,lastPowerOutage:'—',dailyTarget:Number(row.dailyKg)||0});
      } else {
        m.dailyTarget=Number(row.dailyKg)||0;
        m.name=row.code;
      }
    });
    const ids=new Set(state.LIVE_MACHINE_DB.map(r=>r.code));
    state.db.machines=state.db.machines.filter(m=>ids.has(m.id));
  }
  try{ fillAreaSelectUI(); }catch{}
  try{ fillReportMachineSelect(); }catch{}
  try{ fillFinMachineSelect(); }catch{}
  try{ fillFichaMachineSelect(); }catch{}
  try{ fillNegligenciaMachineSelect(); }catch{}
  const af=document.getElementById('mdbAreaFilter');
  if(af){
    const cur=af.value;
    af.innerHTML='<option value="">Todas las áreas</option>'+state.AREA_ORDER.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
    af.dataset.filled='1';
    if(cur) af.value=cur;
  }
  if(opts&&opts.render){ try{ render(); }catch{} }
}

export function persistMachineDB(){
  localStorage.setItem('SL_MACHINE_DB_CUSTOM', JSON.stringify(state.LIVE_MACHINE_DB));
  syncMachines();
  if(typeof state.db!=='undefined' && state.db) try{ save(); }catch{}
}

state.currentArea = state.AREA_ORDER[0] || 'Cam';

// '' = toda la planta

export const isAllAreas = ()=> !state.currentArea || state.currentArea==='__ALL__';

export const allMachineIds = ()=> [...new Set(Object.values(AREAS).flat())];

export const MACHINES = ()=> isAllAreas() ? allMachineIds() : (AREAS[state.currentArea] || []);

export const now=new Date();

export function iso(d){
  const x=d?new Date(d):new Date();
  if(typeof d==='string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const y=x.getFullYear(), m=String(x.getMonth()+1).padStart(2,'0'), day=String(x.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}

export function parseLocalDate(s){
  const str=String(s||'').trim();
  let m=str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m) return new Date(+m[1], +m[2]-1, +m[3], 12, 0, 0);
  m=str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(m) return new Date(+m[3], +m[2]-1, +m[1], 12, 0, 0);
  const d=new Date(str);
  return isNaN(d)?new Date():d;
}

export function parseKg(v){
  if(v==null||v==='') return 0;
  const n=parseFloat(String(v).replace(/[^0-9.,-]/g,'').replace(/,/g,''));
  return isNaN(n)?0:n;
}

Object.values(AREAS).flat().forEach(id=>{
  if(!seed.machines.find(m=>m.id===id))
    seed.machines.push({id,name:id,status:'Operando',runtime:0,cycles:0,availability:100,powerKwh:0,lastPowerOutage:'—',dailyTarget:MACHINE_TARGETS[id]||0});
});


if(!state.db.meal) state.db.meal={employees:seedMealEmployees(),historial:[],config:{numSemana:1,nextId:20},semanaActual:[]};

if(!state.db.keywords) state.db.keywords=['Estática','Resistencia de la selladora','Sello de fondo','Rodillo','Balero','Pirómetro','Cuchilla','Cabezal'];

if(!state.db.negligencia) state.db.negligencia=[];

if(!Array.isArray(state.db.kanban)) state.db.kanban=[];

if(!Array.isArray(state.db.reminders)) state.db.reminders=[];

if(!Array.isArray(state.db.technicalNotes)) state.db.technicalNotes=[];

if(!Array.isArray(state.db.dailyChecks)) state.db.dailyChecks=[];

if(!Array.isArray(state.db.pmChecks)) state.db.pmChecks=[];

if(!state.db.crew) state.db.crew={personasTotal:0,horasTurno:8,indirectoPct:15,reservaEmergenciaPct:10};

if(state.db.team){
 const drop=new Set(['Reporte diario','Carlos Méndez','Ana Torres','Luis Pérez','Sofía Ramírez']);
 state.db.team.forEach(t=>{
  const nombre=t[0];
  if(drop.has(nombre)||state.db.meal.employees.some(e=>e.nombre===nombre))return;
  const id=state.db.meal.config.nextId||(Math.max(0,...state.db.meal.employees.map(e=>e.id))+1);
  state.db.meal.employees.push({id,nombre,grupo:'A',turnoNoche:false,enCapacitacion:false,ausencias:'',ultimaFecha:'',vecesAsignado:0,activo:true,rol:t[1]||'Técnico',especialidad:t[2]||'General',estado:t[4]||'Disponible'});
  state.db.meal.config.nextId=id+1;
 });
 delete state.db.team;
}

// Asegura que existan todas las máquinas de MACHINE_DB y actualiza dailyTarget

Object.values(AREAS).flat().forEach(id=>{
  let m=state.db.machines.find(x=>x.id===id);
  if(!m){
    state.db.machines.push({id,name:id,status:'Operando',runtime:0,cycles:0,availability:100,powerKwh:0,lastPowerOutage:'—',dailyTarget:MACHINE_TARGETS[id]||0});
  } else {
    m.dailyTarget = MACHINE_TARGETS[id]||0;
  }
});

state.selectedMachine = '';
state.machinePeriod = 'day';
state.charts = {};

state.currentView = 'dashboard';

state.finCharts = {};

