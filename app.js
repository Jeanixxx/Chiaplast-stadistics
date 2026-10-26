// =============================================================================
// BASE DE DATOS EDITABLE DE ÁREAS Y MÁQUINAS
// ---------------------------------------------------------------------------
// Modifica aquí las áreas, códigos de máquina y kg objetivo diario (Cantidad).
// Formato: { area: 'NombreÁrea', code: 'CÓDIGO-MÁQUINA', dailyKg: número }
// Al guardar y recargar la página se usan estos datos para el selector de área
// y la lista de máquinas. Si ya tienes datos en localStorage, los equipos
// nuevos se agregan automáticamente.
// =============================================================================
const MACHINE_DB = [
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
let LIVE_MACHINE_DB = (()=>{
  try{
    const raw=localStorage.getItem('SL_MACHINE_DB_CUSTOM');
    if(raw){ const arr=JSON.parse(raw); if(Array.isArray(arr)&&arr.length) return arr; }
  }catch(e){}
  return MACHINE_DB.map(r=>({area:r.area,code:r.code,dailyKg:Number(r.dailyKg)||0}));
})();
const AREAS = {};
const MACHINE_TARGETS = {};
let AREA_ORDER = [];
function rebuildAreasFromLive(){
  Object.keys(AREAS).forEach(k=>delete AREAS[k]);
  Object.keys(MACHINE_TARGETS).forEach(k=>delete MACHINE_TARGETS[k]);
  LIVE_MACHINE_DB.forEach(row=>{
    if(!row||!row.code) return;
    const area=row.area||'Sin área';
    if(!AREAS[area]) AREAS[area]=[];
    if(!AREAS[area].includes(row.code)) AREAS[area].push(row.code);
    MACHINE_TARGETS[row.code]=Number(row.dailyKg)||0;
  });
  AREA_ORDER.length=0;
  Object.keys(AREAS).forEach(a=>AREA_ORDER.push(a));
}
rebuildAreasFromLive();
/** Centraliza catálogo → AREAS/TARGETS → db.machines → selectores UI */
function syncMachines(opts){
  rebuildAreasFromLive();
  if(typeof db!=='undefined' && db && db.machines){
    LIVE_MACHINE_DB.forEach(row=>{
      let m=db.machines.find(x=>x.id===row.code);
      if(!m){
        db.machines.push({id:row.code,name:row.code,status:'Operando',runtime:0,cycles:0,availability:100,powerKwh:0,lastPowerOutage:'—',dailyTarget:Number(row.dailyKg)||0});
      } else {
        m.dailyTarget=Number(row.dailyKg)||0;
        m.name=row.code;
      }
    });
    const ids=new Set(LIVE_MACHINE_DB.map(r=>r.code));
    db.machines=db.machines.filter(m=>ids.has(m.id));
  }
  try{ fillAreaSelectUI(); }catch(e){}
  try{ fillReportMachineSelect(); }catch(e){}
  try{ fillFinMachineSelect(); }catch(e){}
  try{ fillFichaMachineSelect(); }catch(e){}
  try{ fillNegligenciaMachineSelect(); }catch(e){}
  const af=document.getElementById('mdbAreaFilter');
  if(af){
    const cur=af.value;
    af.innerHTML='<option value="">Todas las áreas</option>'+AREA_ORDER.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
    af.dataset.filled='1';
    if(cur) af.value=cur;
  }
  if(opts&&opts.render){ try{ render(); }catch(e){} }
}
function persistMachineDB(){
  localStorage.setItem('SL_MACHINE_DB_CUSTOM', JSON.stringify(LIVE_MACHINE_DB));
  syncMachines();
  if(typeof db!=='undefined' && db) try{ save(); }catch(e){}
}

let currentArea = AREA_ORDER[0] || 'Cam'; // '' = toda la planta
const isAllAreas = ()=> !currentArea || currentArea==='__ALL__';
const allMachineIds = ()=> [...new Set(Object.values(AREAS).flat())];
const MACHINES = ()=> isAllAreas() ? allMachineIds() : (AREAS[currentArea] || []);
const now=new Date();
function iso(d){
  const x=d?new Date(d):new Date();
  if(typeof d==='string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const y=x.getFullYear(), m=String(x.getMonth()+1).padStart(2,'0'), day=String(x.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}
function parseLocalDate(s){
  const str=String(s||'').trim();
  let m=str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m) return new Date(+m[1], +m[2]-1, +m[3], 12, 0, 0);
  m=str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(m) return new Date(+m[3], +m[2]-1, +m[1], 12, 0, 0);
  const d=new Date(str);
  return isNaN(d)?new Date():d;
}
function parseKg(v){
  if(v==null||v==='') return 0;
  const n=parseFloat(String(v).replace(/[^0-9.,-]/g,'').replace(/,/g,''));
  return isNaN(n)?0:n;
}

const seed={
 machines:[],
 pm:[],
 workOrders:[],
 events:[],
 cards:[],
 chassis:[],
 predictive:[],
 parts:[],
 keywords:['Estática','Resistencia de la selladora','Sello de fondo','Rodillo','Balero','Pirómetro','Cuchilla','Cabezal'],
 negligencia:[],
 history:[],
 meal:{employees:seedMealEmployees(),historial:[],config:{numSemana:1,nextId:20},semanaActual:[]}
};
function seedMealEmployees(){
 const base=[
  ["MARTIN MORENO RUIZ","B","NO"],["AGUSTIN BASILIO PEREZ","B","SI"],["ALEXIS ABRAHAM GONZALEZ CORZO","B","NO"],
  ["ANGEL ALBERTO TOLEDO ARDENO","B","NO"],["ARNALDO COBO HERNANDEZ","B","NO"],["ERICK HERNAN MANCILLA HERNANDEZ","B","NO"],
  ["EVERARDO HERNANDEZ NAFATE","B","NO"],["HUGO JEAN ROSAS GOMEZ","A","NO"],["JHOVANY SANCHEZ DOMINGUEZ","A","NO"],
  ["JORGE JONATHAN ALVAREZ ARIAS","B","NO"],["JOSE GABRIEL HERNANDEZ RUIZ","A","SI"],["LEONARDO CASTELLANOS GORDILLO","A","NO"],
  ["MIGUEL ANGEL PEREZ HERNANDEZ","A","NO"],["OSMAR DE JESUS HERNANDEZ FONSECA","A","NO"],["ULICES ADRIAN MORALES OVANDO","B","NO"],
  ["VICTOR HUMBERTO ALVAREZ CABRERA","A","NO"],["GUADALUPE DE JESUS DE LA CRUZ ZENTENO","A","NO"],["VICTOR MANUEL LOPEZ SILVA","A","NO"],
  ["HECTOR AVEDAÑO ORTEGA","A","NO"]
 ];
 return base.map((r,i)=>({id:i+1,nombre:r[0],grupo:r[1],turnoNoche:r[2]==="SI",enCapacitacion:false,ausencias:"",ultimaFecha:"",vecesAsignado:0,activo:true}));
}
Object.values(AREAS).flat().forEach(id=>{
  if(!seed.machines.find(m=>m.id===id))
    seed.machines.push({id,name:id,status:'Operando',runtime:0,cycles:0,availability:100,powerKwh:0,lastPowerOutage:'—',dailyTarget:MACHINE_TARGETS[id]||0});
});
let db=JSON.parse(localStorage.getItem('SL_CMMS_DB_v2')||'null')||seed;
if(!db.meal) db.meal={employees:seedMealEmployees(),historial:[],config:{numSemana:1,nextId:20},semanaActual:[]};
if(!db.keywords) db.keywords=['Estática','Resistencia de la selladora','Sello de fondo','Rodillo','Balero','Pirómetro','Cuchilla','Cabezal'];
if(!db.negligencia) db.negligencia=[];
if(!db.crew) db.crew={personasTotal:0,horasTurno:8,indirectoPct:15,reservaEmergenciaPct:10};
if(db.team){
 const drop=new Set(['Reporte diario','Carlos Méndez','Ana Torres','Luis Pérez','Sofía Ramírez']);
 db.team.forEach(t=>{
  const nombre=t[0];
  if(drop.has(nombre)||db.meal.employees.some(e=>e.nombre===nombre))return;
  const id=db.meal.config.nextId||(Math.max(0,...db.meal.employees.map(e=>e.id))+1);
  db.meal.employees.push({id,nombre,grupo:'A',turnoNoche:false,enCapacitacion:false,ausencias:'',ultimaFecha:'',vecesAsignado:0,activo:true,rol:t[1]||'Técnico',especialidad:t[2]||'General',estado:t[4]||'Disponible'});
  db.meal.config.nextId=id+1;
 });
 delete db.team;
}
// Asegura que existan todas las máquinas de MACHINE_DB y actualiza dailyTarget
Object.values(AREAS).flat().forEach(id=>{
  let m=db.machines.find(x=>x.id===id);
  if(!m){
    db.machines.push({id,name:id,status:'Operando',runtime:0,cycles:0,availability:100,powerKwh:0,lastPowerOutage:'—',dailyTarget:MACHINE_TARGETS[id]||0});
  } else {
    m.dailyTarget = MACHINE_TARGETS[id]||0;
  }
});
let selectedMachine='', machinePeriod='day', charts={};
let currentView='dashboard';
let finCharts={};

// ================= CLASIFICACIÓN INTELIGENTE DE FALLAS =================
const CLASIFICACION_FALLAS = {
  'Fuga': {
    palabras: ['fuga','fugas','fugando','fugaba','perdida','pérdida','escape','escapando'],
    contexto: {
      'neumatica': ['aire','manguera','mangera','presion','presión','pistola','neumatico','neumática'],
      'aceite': ['aceite','lubricante'],
      'plasta': ['plasta','material']
    },
    nivel: 1
  },
  'Falla eléctrica': {
    palabras: ['corto','cortocircuito','corto circuito','cable','cables','quemado','quemada','quemados','electrico','eléctrico','electricidad','contactores','contactor','estado solido','estado sólido','caja de control'],
    contexto: {
      'control': ['caja de control','estado solido','estado sólido','potenciometro','potenciómetro','electrovalvula','electroválvula'],
      'motor': ['motor','motores']
    },
    nivel: 1
  },
  'Inversor / Variador': {
    palabras: ['inversor','variador','drive','proteccion del inversor','protección del inversor','se protegio','se protegió'],
    nivel: 1
  },
  'Rodillo jalador': {
    palabras: ['rodillo jalador','rodillo','jalador','jaladora'],
    contexto: {
      'neumatico': ['fuga','aire','presion','presión'],
      'mecanico': ['desgaste','caucho','apretado','flojo','ajuste','reparacion','reparación','engrane','reductor']
    },
    nivel: 1
  },
  'Porta malla': {
    palabras: ['portamalla','porta malla','porta-malla','portamaya','porta maya'],
    contexto: {
      'rosca': ['cuerda','cuerdas','rosca','roscado','barrido','barrida','barridos','barridas','torno','rectificacion','rectificación','rehacer']
    },
    nivel: 1
  },
  'Tornillería / Roscas': {
    palabras: ['tornillo','tornillos','tuerca','cuerda','cuerdas','rosca','roscado','barrido','barrida','barridos','barridas','quebrado','quebrada','quebrados','flojo','flojos','se salieron'],
    nivel: 1
  },
  'Desgaste': {
    palabras: ['desgaste','desgastado','desgastada','desgastados','desgastadas','gastado','gastada','deteriorado','deteriorada','erosionado','ya no sirve','muy gastado'],
    nivel: 1
  },
  'Bandas / Transmisión': {
    palabras: ['banda','bandas','kit de bandas','correa','correas'],
    nivel: 1
  },
  'Calentamiento / Temperatura': {
    palabras: ['calentamiento','calentado','calentar','calienta','no calentaba','temperatura','pirometro','pirómetro','resistencia','resitencia','zona','cabezal'],
    nivel: 1
  },
  'Falla neumática': {
    palabras: ['aire','manguera','mangera','piston','pistón','electrovalvula','electroválvula','valvula','válvula','presion','presión','pistola de aire'],
    contexto: {
      'fuga': ['fuga','rota','roto','quebrada','dañada','alrevez','al revés','invertida','sin presion','sin presión']
    },
    nivel: 1
  },
  'Cortocircuito': {
    palabras: ['corto','corto circuito','cortocircuito','en corto','cable en corto'],
    nivel: 1
  },
  'Apagón / Energía externa': {
    palabras: ['apagon','apagón','sin luz','se fue la luz','corte de energia','corte de energía','falla electrica general','falla eléctrica general'],
    nivel: 1
  },
  'Ajuste / Desalineación': {
    palabras: ['ajuste','ajustar','ajusto','ajustó','ajustado','desajuste','alineacion','alineación','calibracion','calibración','apretado','apretar','flojo','floja'],
    nivel: 1
  },
  'Rotura / Fractura': {
    palabras: ['roto','rota','rotos','rotas','quebrado','quebrada','quebrados','quebradas','fractura','fisura','dañado','dañada','dañados','dañadas'],
    nivel: 1
  },
  'Limpieza / Dados': {
    palabras: ['limpieza','limpieeza','limpiar','limpio','sucio','suciedad','dado','dados','limpieza de dado','limpiar dado'],
    nivel: 1
  },
  'Mandril': {
    palabras: ['mandril','mandrill','fisura','fisurado','fractura','fracturado'],
    nivel: 1
  },
  'Engranes / Reductores': {
    palabras: ['engrane','engranes','reductor','reductores'],
    nivel: 1
  },
  'Motor / Embobinador': {
    palabras: ['motor','motores','embobinador','embobinadora','bobinador'],
    nivel: 1
  },
  'Mantenimiento programado': {
    palabras: ['mantenimiento','preventivo','correctivo programado','reparacion programada','reparación programada'],
    nivel: 2
  }
};

const REGISTRO_SEMANTICO = {
  sintomas: {
    'alarma':{categoria:'Alarma',peso:0.8},'alarmas':{categoria:'Alarma',peso:0.8},
    'sobrecalentamiento':{categoria:'Sobrecalentamiento',peso:0.9},'recalentamiento':{categoria:'Sobrecalentamiento',peso:0.8},
    'calentado deficiente':{categoria:'Calentamiento insuficiente',peso:0.9},'no calienta':{categoria:'Calentamiento insuficiente',peso:0.9},
    'baja temperatura':{categoria:'Temperatura baja',peso:0.8},'temperatura deficiente':{categoria:'Temperatura baja',peso:0.8},
    'corte deficiente':{categoria:'Corte deficiente',peso:0.9},'no corta':{categoria:'Corte deficiente',peso:0.8},'sin filo':{categoria:'Pérdida de filo',peso:0.8},
    'atoramiento':{categoria:'Atoramiento',peso:0.9},'atorado':{categoria:'Atoramiento',peso:0.8},'trabado':{categoria:'Atoramiento',peso:0.7},
    'apagado intermitente':{categoria:'Intermitencia',peso:0.9},'intermitente':{categoria:'Intermitencia',peso:0.8},
    'falso contacto':{categoria:'Falso contacto',peso:0.9},'falseo':{categoria:'Falso contacto',peso:0.8},'falseaba':{categoria:'Falso contacto',peso:0.8},
    'variando la medida':{categoria:'Variación dimensional',peso:0.9},'fuera de medida':{categoria:'Variación dimensional',peso:0.8},
    'fuga':{categoria:'Fuga',peso:0.9},'perdida':{categoria:'Fuga',peso:0.8},'pérdida':{categoria:'Fuga',peso:0.8},'escape':{categoria:'Fuga',peso:0.7},
    'no abre':{categoria:'Falta de apertura',peso:0.8},'no cierra':{categoria:'Falta de cierre',peso:0.8},
    'rotura':{categoria:'Rotura',peso:0.8},'quebrado':{categoria:'Rotura',peso:0.8},'quebrada':{categoria:'Rotura',peso:0.8},
    'desgaste':{categoria:'Desgaste',peso:0.8},'gastado':{categoria:'Desgaste',peso:0.7},'deteriorado':{categoria:'Desgaste',peso:0.7},
    'se protegio':{categoria:'Protección disparada',peso:0.85},'se protegió':{categoria:'Protección disparada',peso:0.85},
    'apagon':{categoria:'Apagón',peso:0.9},'apagón':{categoria:'Apagón',peso:0.9},'sin luz':{categoria:'Apagón',peso:0.85}
  },
  componentes: {
    'resistencia':{categoria:'Resistencia',peso:0.9},'recistencia':{categoria:'Resistencia',peso:0.6},'resitencia':{categoria:'Resistencia',peso:0.6},
    'termopar':{categoria:'Termopar',peso:0.9},'termopares':{categoria:'Termopar',peso:0.9},
    'sensor':{categoria:'Sensor',peso:0.9},'sensores':{categoria:'Sensor',peso:0.9},'censor':{categoria:'Sensor',peso:0.7},
    'fotocelda':{categoria:'Fotocelda',peso:0.9},'fotoceldas':{categoria:'Fotocelda',peso:0.9},
    'cuchilla':{categoria:'Cuchilla',peso:0.9},'cuchillas':{categoria:'Cuchilla',peso:0.9},
    'rodillo jalador':{categoria:'Rodillo jalador',peso:0.95},'rodillo':{categoria:'Rodillo',peso:0.85},'rodillos':{categoria:'Rodillo',peso:0.85},
    'balero':{categoria:'Balero',peso:0.9},'baleros':{categoria:'Balero',peso:0.9},'rodamiento':{categoria:'Balero',peso:0.8},
    'cabezal':{categoria:'Cabezal',peso:0.9},'cabezales':{categoria:'Cabezal',peso:0.9},
    'manguera':{categoria:'Manguera',peso:0.9},'mangera':{categoria:'Manguera',peso:0.7},
    'piston':{categoria:'Pistón',peso:0.9},'pistón':{categoria:'Pistón',peso:0.9},
    'pisador':{categoria:'Pisador',peso:0.9},'pizador':{categoria:'Pisador',peso:0.7},
    'esparrago':{categoria:'Espárrago',peso:0.8},'espárrago':{categoria:'Espárrago',peso:0.9},
    'tornillo':{categoria:'Tornillo',peso:0.9},'tornillos':{categoria:'Tornillo',peso:0.9},'tuerca':{categoria:'Tuerca',peso:0.8},
    'banda':{categoria:'Banda',peso:0.9},'bandas':{categoria:'Banda',peso:0.9},
    'cadena':{categoria:'Cadena',peso:0.9},'cadenas':{categoria:'Cadena',peso:0.9},
    'polea':{categoria:'Polea',peso:0.9},'poleas':{categoria:'Polea',peso:0.9},
    'fleje':{categoria:'Fleje',peso:0.9},'flejadora':{categoria:'Flejadora',peso:0.9},'portafleje':{categoria:'Portafleje',peso:0.9},
    'relay':{categoria:'Relay',peso:0.9},'rele':{categoria:'Relay',peso:0.8},'relevador':{categoria:'Relay',peso:0.85},
    'servomotor':{categoria:'Servomotor',peso:0.9},'servo':{categoria:'Servomotor',peso:0.8},
    'varilla':{categoria:'Varilla',peso:0.9},'varillas':{categoria:'Varilla',peso:0.9},
    'soporte':{categoria:'Soporte',peso:0.8},'soportes':{categoria:'Soporte',peso:0.8},
    'resorte':{categoria:'Resorte',peso:0.9},'resortes':{categoria:'Resorte',peso:0.9},
    'tenaza':{categoria:'Tenaza',peso:0.9},'tenazas':{categoria:'Tenaza',peso:0.9},
    'chiller':{categoria:'Chiller',peso:0.9},'tuberia':{categoria:'Tubería',peso:0.8},'tubería':{categoria:'Tubería',peso:0.8},
    'portamalla':{categoria:'Porta malla',peso:0.9},'porta malla':{categoria:'Porta malla',peso:0.9},
    'inversor':{categoria:'Inversor',peso:0.9},'variador':{categoria:'Inversor',peso:0.8},
    'motor':{categoria:'Motor',peso:0.8},'embobinador':{categoria:'Embobinador',peso:0.9},
    'electrovalvula':{categoria:'Electroválvula',peso:0.9},'electroválvula':{categoria:'Electroválvula',peso:0.9},
    'cable':{categoria:'Cable',peso:0.75},'cables':{categoria:'Cable',peso:0.75},
    'engrane':{categoria:'Engrane',peso:0.85},'reductor':{categoria:'Reductor',peso:0.85},
    'mandril':{categoria:'Mandril',peso:0.9},'dado':{categoria:'Dado',peso:0.8}
  },
  modos: {
    'fuga':{categoria:'Fuga',peso:0.9},'rotura':{categoria:'Rotura',peso:0.9},'quebrado':{categoria:'Rotura',peso:0.8},'rota':{categoria:'Rotura',peso:0.75},'roto':{categoria:'Rotura',peso:0.75},
    'desgaste':{categoria:'Desgaste',peso:0.9},'desgastado':{categoria:'Desgaste',peso:0.8},'gastado':{categoria:'Desgaste',peso:0.7},'deteriorado':{categoria:'Desgaste',peso:0.7},
    'falso contacto':{categoria:'Falso contacto',peso:0.9},'falseo':{categoria:'Falso contacto',peso:0.8},
    'intermitencia':{categoria:'Intermitencia',peso:0.9},'intermitente':{categoria:'Intermitencia',peso:0.8},
    'corto':{categoria:'Cortocircuito',peso:0.85},'cortocircuito':{categoria:'Cortocircuito',peso:0.9},'corto circuito':{categoria:'Cortocircuito',peso:0.9},
    'sobrecalentamiento':{categoria:'Sobrecalentamiento',peso:0.9},'recalentamiento':{categoria:'Sobrecalentamiento',peso:0.8},
    'calentado deficiente':{categoria:'Calentamiento insuficiente',peso:0.9},
    'desalineacion':{categoria:'Desalineación',peso:0.9},'desalineación':{categoria:'Desalineación',peso:0.9},'desajuste':{categoria:'Desajuste',peso:0.9},
    'atoramiento':{categoria:'Atoramiento',peso:0.9},'trabado':{categoria:'Atoramiento',peso:0.8},
    'variando la medida':{categoria:'Variación dimensional',peso:0.9},'sin filo':{categoria:'Pérdida de filo',peso:0.8},
    'barrido':{categoria:'Rosca barrida',peso:0.9},'barrida':{categoria:'Rosca barrida',peso:0.8},
    'falta de sellado':{categoria:'Sellado deficiente',peso:0.9},'mal sellado':{categoria:'Sellado deficiente',peso:0.8},
    'apagado':{categoria:'Apagón',peso:0.7},'quemado':{categoria:'Quemado',peso:0.85},'quemada':{categoria:'Quemado',peso:0.85}
  },
  acciones: {
    'cambio':{categoria:'Cambio',peso:0.9},'cambio de':{categoria:'Cambio',peso:0.85},'cambiaron':{categoria:'Cambio',peso:0.8},'reemplazo':{categoria:'Cambio',peso:0.8},'se cambio':{categoria:'Cambio',peso:0.85},'se cambió':{categoria:'Cambio',peso:0.85},
    'ajuste':{categoria:'Ajuste',peso:0.9},'ajustar':{categoria:'Ajuste',peso:0.8},'apretar':{categoria:'Ajuste',peso:0.7},'apriete':{categoria:'Ajuste',peso:0.7},
    'limpieza':{categoria:'Limpieza',peso:0.9},'limpiar':{categoria:'Limpieza',peso:0.8},'se limpio':{categoria:'Limpieza',peso:0.8},'se limpió':{categoria:'Limpieza',peso:0.8},
    'reparacion':{categoria:'Reparación',peso:0.8},'reparación':{categoria:'Reparación',peso:0.9},'se arreglo':{categoria:'Reparación',peso:0.85},'se arregló':{categoria:'Reparación',peso:0.85},
    'calibracion':{categoria:'Calibración',peso:0.9},'calibración':{categoria:'Calibración',peso:0.9},
    'revisar':{categoria:'Revisión',peso:0.7},'revision':{categoria:'Revisión',peso:0.7},'revisión':{categoria:'Revisión',peso:0.8},'revicion':{categoria:'Revisión',peso:0.65},
    'soldar':{categoria:'Soldadura',peso:0.8},'afilado':{categoria:'Afilado',peso:0.9},'sacar filo':{categoria:'Afilado',peso:0.8},
    'purga':{categoria:'Purga',peso:0.8},'purgar':{categoria:'Purga',peso:0.7},
    'colocacion':{categoria:'Instalación',peso:0.8},'colocación':{categoria:'Instalación',peso:0.9},'retiro':{categoria:'Retiro',peso:0.8}
  }
};

function normTxt(s){
  return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function _mejorMatchNivel(mapa, textoLower){
  let mejor={categoria:'No especificado',confianza:0,palabras:[]};
  // Ordenar claves por longitud desc para preferir frases largas (rodillo jalador > rodillo)
  const keys=Object.keys(mapa).sort((a,b)=>b.length-a.length);
  for(const palabra of keys){
    const pNorm=normTxt(palabra);
    if(pNorm && textoLower.includes(pNorm)){
      const conf=Math.round((mapa[palabra].peso||0.5)*100);
      if(conf>mejor.confianza){
        mejor={categoria:mapa[palabra].categoria,confianza:conf,palabras:[palabra]};
      } else if(conf===mejor.confianza && !mejor.palabras.includes(palabra)){
        mejor.palabras.push(palabra);
      }
    }
  }
  return mejor;
}
function clasificarFalla(texto){
  const textoLower=normTxt(texto);
  const vacio={categoria:'No especificado',confianza:0,palabras:[]};
  if(!textoLower.trim()){
    return {
      sintoma:vacio,componente:vacio,modo_falla:vacio,accion:vacio,
      categorias:[],principal:'No clasificada',confianza_principal:0,
      detalle:[],palabras_clave:[],contexto:{},todas_categorias:[]
    };
  }
  const sintoma=_mejorMatchNivel(REGISTRO_SEMANTICO.sintomas, textoLower);
  const componente=_mejorMatchNivel(REGISTRO_SEMANTICO.componentes, textoLower);
  const modo=_mejorMatchNivel(REGISTRO_SEMANTICO.modos, textoLower);
  const accion=_mejorMatchNivel(REGISTRO_SEMANTICO.acciones, textoLower);

  // Categorías amplias (diccionario anterior) para compatibilidad de gráficos
  const resultados=[];
  let maxConfianza=0;
  for(const [categoria,reglas] of Object.entries(CLASIFICACION_FALLAS)){
    let confianza=0;
    const palabrasEncontradas=[];
    const contextoDetectado={};
    for(const palabra of (reglas.palabras||[])){
      if(textoLower.includes(normTxt(palabra))){ confianza+=0.4; palabrasEncontradas.push(palabra); }
    }
    if(reglas.contexto){
      for(const [ctx,palabrasContexto] of Object.entries(reglas.contexto)){
        for(const p of palabrasContexto){
          if(textoLower.includes(normTxt(p))){
            confianza+=0.3; palabrasEncontradas.push(p);
            if(!contextoDetectado[ctx]) contextoDetectado[ctx]=[];
            contextoDetectado[ctx].push(p);
          }
        }
      }
    }
    if(confianza>0){
      if(Object.keys(contextoDetectado).length>0) confianza+=0.2;
      if(palabrasEncontradas.length>2) confianza+=0.1;
      confianza=Math.min(confianza,1);
      resultados.push({categoria,confianza:Math.round(confianza*100),palabras:[...new Set(palabrasEncontradas)],contexto:contextoDetectado,nivel:reglas.nivel||1});
      maxConfianza=Math.max(maxConfianza,confianza);
    }
  }
  resultados.sort((a,b)=>b.confianza-a.confianza);
  const umbral=Math.max(0.3, maxConfianza*0.7);
  const filtrados=resultados.filter(r=>r.confianza/100>=umbral);

  // Principal: preferir componente > modo > síntoma > categoría amplia
  let principal='No clasificada', confP=0;
  if(componente.categoria!=='No especificado'){ principal=componente.categoria; confP=componente.confianza; }
  else if(modo.categoria!=='No especificado'){ principal=modo.categoria; confP=modo.confianza; }
  else if(sintoma.categoria!=='No especificado'){ principal=sintoma.categoria; confP=sintoma.confianza; }
  else if(filtrados.length){ principal=filtrados[0].categoria; confP=filtrados[0].confianza; }

  const todas=[];
  if(sintoma.categoria!=='No especificado') todas.push({nivel:'sintoma',...sintoma});
  if(componente.categoria!=='No especificado') todas.push({nivel:'componente',...componente});
  if(modo.categoria!=='No especificado') todas.push({nivel:'modo_falla',...modo});
  if(accion.categoria!=='No especificado') todas.push({nivel:'accion',...accion});

  const palabras=[...new Set([
    ...sintoma.palabras,...componente.palabras,...modo.palabras,...accion.palabras,
    ...filtrados.flatMap(r=>r.palabras)
  ])];

  return {
    sintoma, componente, modo_falla:modo, accion,
    categorias:filtrados.map(r=>r.categoria),
    principal,
    confianza_principal:confP,
    detalle:filtrados,
    palabras_clave:palabras,
    contexto:filtrados.reduce((acc,r)=>Object.assign(acc,r.contexto||{}),{}),
    todas_categorias:todas
  };
}
function camposClasificacion(desc){
  const c=clasificarFalla(desc);
  return {
    clasificacion:c.principal,
    confianza:c.confianza_principal,
    sintoma:c.sintoma.categoria,
    componente:c.componente.categoria,
    modo_falla:c.modo_falla.categoria,
    accion:c.accion.categoria,
    confianza_sintoma:c.sintoma.confianza,
    confianza_componente:c.componente.confianza,
    confianza_modo:c.modo_falla.confianza,
    confianza_accion:c.accion.confianza,
    palabras_clave:c.palabras_clave,
    contexto:c.contexto,
    detalle_clasificacion:c.todas_categorias
  };
}
function reclassifyificarEventosExistentes(force){
  let n=0;
  (db.events||[]).forEach(ev=>{
    if(!ev.desc) return;
    if(!force && ev.sintoma && ev.componente && ev.confianza!=null) return;
    Object.assign(ev, camposClasificacion(ev.desc));
    n++;
  });
  if(n){ save(); toast(n+' eventos clasificados (4 niveles)'); }
  else toast('Todos los eventos ya tienen clasificación');
  return n;
}
let finData={
  machine:'',
  costoRefaccion:25000,
  horasHombre:8,
  costoHora:350,
  perdidaProdHora:5000,
  multas:15000,
  costoTotal:0,
  ahorro:0,
  porcentajeAhorro:0
};

let dashRefDate=iso(new Date()); // fecha de referencia del dashboard

function periodRange(period, refDate){
  const ref=parseLocalDate(refDate||dashRefDate);
  let start=new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 0, 0, 0, 0);
  let end=new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 23, 59, 59, 999);
  if(period==='week'){
    // semana completa (lun-dom) que contiene refDate
    const day=(ref.getDay()+6)%7; // 0=lunes
    start=new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()-day, 0, 0, 0, 0);
    end=new Date(start.getFullYear(), start.getMonth(), start.getDate()+6, 23, 59, 59, 999);
  } else if(period==='month'){
    start=new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
    end=new Date(ref.getFullYear(), ref.getMonth()+1, 0, 23, 59, 59, 999);
  }
  return {start, end};
}
function periodMinutes(period, refDate){
  const {start,end}=periodRange(period, refDate);
  return Math.max(1, Math.round((end-start)/60000)+1);
}
function eventDate(ev){
  return parseLocalDate(ev.date);
}
function eventsInPeriod(machineId, period, areaOnly, refDate){
  const {start,end}=periodRange(period, refDate||dashRefDate);
  const scopeIds = new Set(MACHINES());
  return db.events.filter(x=>{
    if(machineId && x.machine!==machineId) return false;
    if(!machineId && selectedMachine && x.machine!==selectedMachine) return false;
    if(areaOnly && !scopeIds.has(x.machine)) return false;
    const d=eventDate(x);
    return d>=start && d<=end;
  });
}
function downtimeMinutes(evs){ return evs.reduce((a,x)=>a+(Number(x.minutes)||0),0); }
function productionFromEvents(evs){
  // Método A (reporte diario): Dato1=objetivo, Dato2=muerto reportado.
  // Por máquina+día se toma el máximo reportado para evitar duplicar el dato diario.
  const map={};
  evs.forEach(x=>{
    const day=iso(eventDate(x));
    const key=x.machine+'|'+day;
    if(!map[key]) map[key]={machine:x.machine,day,target:0,dead:0};
    const t=parseKg(x.kgTarget), d=parseKg(x.kgActual);
    if(t>map[key].target) map[key].target=t;
    if(d>map[key].dead) map[key].dead=d;
  });
  const rows=Object.values(map).map(v=>({
    ...v,
    dead:Math.max(0,v.dead),
    actual:Math.max(0,v.target-v.dead)
  }));
  let target=0, actual=0, waste=0;
  rows.forEach(v=>{ target+=v.target; actual+=v.actual; waste+=v.dead; });
  const byDay={};
  rows.forEach(v=>{
    if(!byDay[v.day]) byDay[v.day]={day:v.day,target:0,actual:0,waste:0,dead:0};
    byDay[v.day].target+=v.target;
    byDay[v.day].actual+=v.actual;
    byDay[v.day].waste+=v.dead;
    byDay[v.day].dead+=v.dead;
  });
  const days=Object.values(byDay).sort((a,b)=>a.day.localeCompare(b.day));
  return {target, actual, waste, dead:waste, days, rows, source:'reported'};
}

/** Método B: kg estimados a partir de capacidad diaria (base de máquinas) × fracción de paro.
 *  Fórmula por evento: dailyKg * (minutes / 1440). Suma por máquina/día.
 *  Puede diferir del Método A (reporte diario) — es esperado. */
function productionFromCapacityAndDowntime(evs){
  const MINUTES_PER_DAY=24*60;
  const map={};
  (evs||[]).forEach(x=>{
    const machine=x.machine;
    if(!machine || machine==='SIN ASIGNAR') return;
    const day=iso(eventDate(x));
    const key=machine+'|'+day;
    if(!map[key]){
      const cap=Number(MACHINE_TARGETS[machine]);
      const fromDb=db.machines?.find(m=>m.id===machine);
      const dailyKg=(fromDb&&fromDb.dailyTarget!=null)?Number(fromDb.dailyTarget):(isNaN(cap)?0:cap);
      map[key]={machine,day,dailyKg:Math.max(0,dailyKg||0),minutes:0};
    }
    map[key].minutes+=Number(x.minutes)||0;
  });
  let estWaste=0, estTarget=0, estActual=0;
  const rows=Object.values(map).map(v=>{
    const frac=Math.min(1, Math.max(0, v.minutes/MINUTES_PER_DAY));
    const waste=v.dailyKg*frac;
    const target=v.dailyKg; // capacidad del día
    const actual=Math.max(0, target-waste);
    estWaste+=waste; estTarget+=target; estActual+=actual;
    return {...v, waste, target, actual, dead:waste};
  });
  const byDay={};
  rows.forEach(v=>{
    if(!byDay[v.day]) byDay[v.day]={day:v.day,target:0,actual:0,waste:0};
    byDay[v.day].target+=v.target;
    byDay[v.day].actual+=v.actual;
    byDay[v.day].waste+=v.waste;
  });
  return {
    target:estTarget, actual:estActual, waste:estWaste, dead:estWaste,
    days:Object.values(byDay).sort((a,b)=>a.day.localeCompare(b.day)),
    rows, source:'estimated'
  };
}

function productionHybrid(evs){
  const reported=productionFromEvents(evs);
  const estimated=productionFromCapacityAndDowntime(evs);
  // Si hay kg reportados en el periodo, prioriza reporte; si no, usa estimación por capacidad×paro
  const useReported=reported.target>0 || reported.waste>0;
  return {
    ... (useReported?reported:estimated),
    reported, estimated, useReported
  };
}

function hardRefreshApp(){
  try{ destroyCharts?.(); }catch(e){}
  try{ destroyFinCharts?.(); }catch(e){}
  try{ invalidateHistoryCache?.(); }catch(e){}
  try{ syncMachines?.(); }catch(e){}
  try{
    render();
    toast('Interfaz refrescada');
  }catch(e){
    console.error(e);
    if(confirm('No se pudo refrescar en caliente. ¿Recargar la página completa?')) location.reload();
  }
}
function toggleNavGroup(btn){
  const g=btn.closest('.nav-group');
  if(!g) return;
  g.classList.toggle('open');
  const sp=btn.querySelector('span');
  if(sp) sp.textContent=g.classList.contains('open')?'▾':'▸';
}


const UNDO_STACK=[];
const UNDO_MAX=15;
let historyPage=0;
let _prevDbJson=null;
function undoLastChange(){
  if(!UNDO_STACK.length){ toast('No hay cambios para deshacer','err'); return; }
  const last=UNDO_STACK.pop();
  try{
    db=JSON.parse(last.data);
    _prevDbJson=last.data;
    localStorage.setItem('SL_CMMS_DB_v2', last.data);
    render();
    toast('Cambio deshecho');
  }catch(e){ toast('No se pudo deshacer','err'); }
}
function toggleFocusMode(){
  document.body.classList.toggle('focus-mode');
  const on=document.body.classList.contains('focus-mode');
  toast(on?'Modo enfoque activado':'Modo enfoque desactivado');
}
function save(){
  try{
    if(_prevDbJson){
      UNDO_STACK.push({data:_prevDbJson,t:Date.now()});
      if(UNDO_STACK.length>UNDO_MAX) UNDO_STACK.shift();
    }
  }catch(e){}
  _prevDbJson=JSON.stringify(db);
  localStorage.setItem('SL_CMMS_DB_v2',_prevDbJson);
  try{ invalidateHistoryCache(); }catch(e){}
  saveFinConfig();
}
function saveFinConfig(){
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
  }catch(e){}
}
function loadFinConfig(){
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
  }catch(e){}
}
function toast(msg, type){
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
function emptyState(title, subtitle, actionHtml){
  return `<div class="empty"><strong>${esc(title)}</strong><div class="muted" style="margin:6px 0 10px">${esc(subtitle||'')}</div>${actionHtml||''}</div>`;
}
function flashLastTableRow(tableId){
  const tb=document.getElementById(tableId);
  if(!tb) return;
  const row=tb.querySelector('tr');
  if(!row || row.querySelector('.empty')) return;
  row.classList.remove('row-flash');
  void row.offsetWidth;
  row.classList.add('row-flash');
}
function saveUiState(){
  try{
    localStorage.setItem('SL_CMMS_STATE', JSON.stringify({
      area: currentArea,
      machine: selectedMachine||'',
      period: getDashPeriod(),
      date: dashRefDate,
      dark: document.documentElement.classList.contains('dark'),
      view: currentView
    }));
  }catch(e){}
}
function loadUiState(){
  try{
    const raw=localStorage.getItem('SL_CMMS_STATE');
    if(!raw) return;
    const s=JSON.parse(raw);
    if(s.area==='__ALL__' || AREAS[s.area]) currentArea=s.area;
    if(s.machine!=null) selectedMachine=s.machine;
    if(['day','week','month'].includes(s.period)) window.dashPeriod=s.period;
    if(s.date) dashRefDate=s.date;
    if(s.dark) document.documentElement.classList.add('dark');
    if(s.view && Object.prototype.hasOwnProperty.call(VIEW_CONFIG,s.view)) currentView=s.view;
  }catch(e){}
}
function toggleDarkMode(){
  document.documentElement.classList.toggle('dark');
  const on=document.documentElement.classList.contains('dark');
  const btn=document.getElementById('darkModeBtn');
  if(btn) btn.textContent=on?'☀️ Modo claro':'🌙 Modo oscuro';
  saveUiState();
  render();
}
function toggleMobileMenu(){
  const sb=document.getElementById('sidebar');
  const bd=document.getElementById('sidebarBackdrop');
  if(!sb) return;
  const open=sb.classList.toggle('open');
  if(bd) bd.style.display=open?'block':'none';
}
function closeMobileMenu(){
  const sb=document.getElementById('sidebar');
  const bd=document.getElementById('sidebarBackdrop');
  if(sb) sb.classList.remove('open');
  if(bd) bd.style.display='none';
}
function exportCSV(){
  const rows=[['Fecha','Tipo','Máquina','Descripción','Técnico','Resultado']];
  (db.history||[]).forEach(h=>rows.push([h[0],h[1],h[2],String(h[3]||'').replace(/;/g,','),h[4],h[5]]));
  const csv='\uFEFF'+rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='historial_chiaplast_'+iso(new Date())+'.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV exportado');
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function escAttr(s){return esc(s).replace(/`/g,'&#96;')}
function badge(v){
  const x=String(v??'').toLowerCase();
  let c=x.includes('crít')||x.includes('falla')?'b-bad':x.includes('advert')||x.includes('alta')||x.includes('revis')?'b-warn':x.includes('normal')||x.includes('operativa')||x.includes('cerr')||x.includes('dispon')?'b-ok':'b-info';
  return `<span class="badge ${c}">${esc(v)}</span>`;
}
function machineFilter(){
  const ids=new Set(MACHINES());
  let list=db.machines.filter(m=>ids.has(m.id));
  if(selectedMachine) list=list.filter(m=>m.id===selectedMachine);
  return list;
}


function normalizeMachine(raw){
  let s=String(raw||'').trim().toUpperCase().replace(/\s+/g,' ').replace(/_/g,'-');
  // Compact spaces around hyphen already handled; normalize common aliases
  const aliases={
    'SL1':'BSL-1','SL-1':'BSL-1','BSL1':'BSL-1',
    'SL2':'BSL-2','SL-2':'BSL-2','BSL2':'BSL-2',
    'SL3':'BSL-3','SL-3':'BSL-3','BSL3':'BSL-3',
    'SL4':'BSL-4','SL-4':'BSL-4','BSL4':'BSL-4',
    'SL5':'BSL-5','SL-5':'BSL-5','BSL5':'BSL-5',
    'SL6':'BSL-6','SL-6':'BSL-6','BSL6':'BSL-6',
    'BW1':'BW-1','BW-1':'BW-1',
    'BN1':'BN-1','BN-1':'BN-1','BN2':'BN-2','BN-2':'BN-2','BN3':'BN-3','BN-3':'BN-3','BN4':'BN-4','BN-4':'BN-4',
    'B02':'B-02','B-02':'B-02','B2':'B-02','B03':'B-03','B-03':'B-03','B3':'B-03','B06':'B-06','B-06':'B-06','B6':'B-06',
    'BD4':'BD-4','BD-4':'BD-4','D4':'BD-4',
    'BM1':'BM-1','BM-1':'BM-1','BM2':'BM-2','BM-2':'BM-2','BM3':'BM-3','BM-3':'BM-3','BM4':'BM-4','BM-4':'BM-4','BM5':'BM-5','BM-5':'BM-5',
    'BD1':'BD-1','BD-1':'BD-1','BD2':'BD-2','BD-2':'BD-2','BD3':'BD-3','BD-3':'BD-3',
    'SELLADORAM1':'SELLADORA M1','SELLADORA M1':'SELLADORA M1','SELLADORA1':'SELLADORA M1',
    'SELLADORAM2':'SELLADORA M2','SELLADORA M2':'SELLADORA M2','SELLADORA2':'SELLADORA M2',
    'SELLADORAM3':'SELLADORA M3','SELLADORA M3':'SELLADORA M3','SELLADORA3':'SELLADORA M3',
    'SELLADORAM4':'SELLADORA M4','SELLADORA M4':'SELLADORA M4','SELLADORA4':'SELLADORA M4',
    'SELLADORAM5':'SELLADORA M5','SELLADORA M5':'SELLADORA M5','SELLADORA5':'SELLADORA M5',
    'SELLADORAM6':'SELLADORA M6','SELLADORA M6':'SELLADORA M6','SELLADORA6':'SELLADORA M6',
    'HORNOM':'HORNO M','HORNO M':'HORNO M','HORNO':'HORNO M',
    'FLEJADORA':'FLEJADORA','FLEJADORA1':'FLEJADORA',
    'ELEVADORH':'ELEVADOR H','ELEVADOR H':'ELEVADOR H','ELEVADOR':'ELEVADOR H',
    'BK1':'BK-1','BK2':'BK-2','BK3':'BK-3','BK4':'BK-4','BK5':'BK-5','BK6':'BK-6','BK7':'BK-7','BK8':'BK-8',
    'BNG1':'BNG-1','BNG2':'BNG-2','BC1':'BC-1',
    'IMP1':'IMP-1','IMP2':'IMP-2','IMP3':'IMP-3',
    'EXT19':'EXT-19','ECB1':'ECB-1',
    'CRI1':'CRI-1','CRI2':'CRI-2','CRI3':'CRI-3','CRI4':'CRI-4','CRI5':'CRI-5',
    'EXT6':'EXT-6','EXT8':'EXT-8','EXT9':'EXT-9','EXT10':'EXT-10','EXT11':'EXT-11',
    'EXT12':'EXT-12','EXT13':'EXT-13','EXT14':'EXT-14','EXT15':'EXT-15','EXT16':'EXT-16','EXT17':'EXT-17',
    'EXTA4':'EXT-A4','EXTA5':'EXT-A5','EXTA6':'EXT-A6','EXTA7':'EXT-A7','EXTA8':'EXT-A8',
    'EXTA9':'EXT-A9','EXTA10':'EXT-A10','EXTA11':'EXT-A11','EXTA12':'EXT-A12','EXTA13':'EXT-A13',
    'EXTN3':'EXT-N3','EXTN4':'EXT-N4','EXTN5':'EXT-N5','EXTN6':'EXT-N6','EXTN7':'EXT-N7'
  };
  // Try exact compact key (no spaces)
  const compact=s.replace(/\s+/g,'');
  if(aliases[compact]) return aliases[compact];
  if(aliases[s]) return aliases[s];
  // Pattern matches
  let m;
  if((m=s.match(/^BSL[- ]?(\d+)$/))) return 'BSL-'+m[1];
  if((m=s.match(/^SL[- ]?(\d+)$/))) return 'BSL-'+m[1];
  if((m=s.match(/^BW[- ]?(\d+)$/))) return 'BW-'+m[1];
  if((m=s.match(/^BN[- ]?(\d+)$/))) return 'BN-'+m[1];
  if((m=s.match(/^B[- ]?0*(\d+)$/))) return 'B-'+String(m[1]).padStart(2,'0');
  if((m=s.match(/^BD[- ]?(\d+)$/))) return 'BD-'+m[1];
  if((m=s.match(/^BM[- ]?(\d+)$/))) return 'BM-'+m[1];
  if((m=s.match(/^BK[- ]?(\d+)$/))) return 'BK-'+m[1];
  if((m=s.match(/^BNG[- ]?(\d+)$/))) return 'BNG-'+m[1];
  if((m=s.match(/^BC[- ]?(\d+)$/))) return 'BC-'+m[1];
  if((m=s.match(/^IMP[- ]?(\d+)$/))) return 'IMP-'+m[1];
  if((m=s.match(/^ECB[- ]?(\d+)$/))) return 'ECB-'+m[1];
  if((m=s.match(/^CRI[- ]?(\d+)$/))) return 'CRI-'+m[1];
  if((m=s.match(/^EXT[- ]?A(\d+)$/))) return 'EXT-A'+m[1];
  if((m=s.match(/^EXT[- ]?N(\d+)$/))) return 'EXT-N'+m[1];
  if((m=s.match(/^EXT[- ]?(\d+)$/))) return 'EXT-'+m[1];
  if((m=s.match(/^SELLADORA\s*M?\s*(\d+)$/))) return 'SELLADORA M'+m[1];
  if(/HORNO/.test(s)) return 'HORNO M';
  if(/FLEJADORA/.test(s)) return 'FLEJADORA';
  if(/ELEVADOR/.test(s)) return 'ELEVADOR H';
  return s;
}

function parseExcelRows(text){
  return String(text||'')
    .split(/\r?\n/)
    .map(x=>x.trimEnd())
    .filter(x=>x.trim())
    .map((line,index)=>{
      const cols=line.includes('\t') ? line.split('\t') : line.split(/\s{2,}/);
      const c=cols.map(x=>String(x||'').trim());
      return {
        row:c[0]||String(index+1),
        type:c[1]||'CORRECTIVO',
        rawMachine:c[2]||'',
        machine:normalizeMachine(c[2]||''),
        description:c[3]||'',
        start:c[4]||'',
        end:c[5]||'',
        duration:c[6]||'',
        value1:c[7]||'',
        value2:c[8]||'',
        extra:c.slice(9).join(' | ')
      };
    });
}

function previewWeeklyImport(){
  const rows=parseExcelRows(document.getElementById('weeklyPaste').value);
  const box=document.getElementById('weeklyPreview');
  if(!rows.length){
    box.innerHTML='<div class="notice">No se encontraron filas para analizar.</div>';
    return;
  }
  let ok=0, warn=0;
  const issues=[];
  const rowStatus=rows.map((r,i)=>{
    const miss=[];
    if(!r.machine || r.machine==='SIN ASIGNAR') miss.push('máquina');
    if(!r.description) miss.push('descripción');
    if(!r.duration) miss.push('duración');
    else {
      const pd=parseDuration(r.duration);
      if(!pd.ok) miss.push('duración ilegible ("'+r.duration+'")');
    }
    if(miss.length){ warn++; issues.push('Fila '+(r.row||i+1)+': '+miss.join(', ')); }
    else ok++;
    return miss;
  });
  const head=warn
    ? `<div class="notice"><strong>Indicador:</strong> ${ok} correctas · ${warn} con observaciones · ${rows.length} filas detectadas</div>`
    : `<div class="success"><strong>✓ Indicador:</strong> ${ok}/${rows.length} filas correctas — listo para importar</div>`;
  box.innerHTML=`
    ${head}
    <div style="overflow:auto;margin-top:10px">
      <table>
        <thead><tr><th>#</th><th>Tipo</th><th>Equipo original</th><th>Máquina</th><th>Descripción</th><th>Inicio</th><th>Fin</th><th>Duración</th><th>Kg objetivo</th><th>Producción muerta</th><th>Estado</th></tr></thead>
        <tbody>
          ${rows.map((r,i)=>{
            const miss=rowStatus[i];
            const st=miss.length?`<span class="badge b-warn">Incompleto</span>`:`<span class="badge b-ok">OK</span>`;
            return `<tr>
            <td>${esc(r.row)}</td>
            <td>${badge(r.type)}</td>
            <td>${esc(r.rawMachine)}</td>
            <td><strong>${esc(r.machine)}</strong></td>
            <td>${esc(r.description)}</td>
            <td>${esc(r.start)}</td>
            <td>${esc(r.end)}</td>
            <td>${esc(r.duration)}</td>
            <td>${esc(r.value1)}</td>
            <td>${esc(r.value2)}</td>
            <td>${st}</td>
          </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="muted" style="font-size:11px;margin-top:10px">
      <strong>Cómo se interpreta:</strong> OK = máquina, descripción y duración legible presentes.
      Incompleto = falta algún campo o la duración no se pudo leer (aún así puedes importar).
      ${issues.length?`<br><br><strong>Detalle:</strong><br>${issues.slice(0,15).map(esc).join('<br>')}${issues.length>15?'<br>…':''}`:''}
    </div>`;
}

function setImportProgress(wrapId, barId, labelId, pct, text){
  const wrap=document.getElementById(wrapId);
  const bar=document.getElementById(barId);
  const lab=document.getElementById(labelId);
  if(wrap) wrap.style.display='block';
  if(bar) bar.style.width=Math.min(100,Math.max(0,pct))+'%';
  if(lab) lab.textContent=text||('Importando… '+Math.round(pct)+'%');
}
function importWeeklyReport(){
  const rows=parseExcelRows(document.getElementById('weeklyPaste').value);
  if(!rows.length){toast('No hay filas para importar','err');return;}

  setImportProgress('importProgressWrap','importProgressBar','importProgressLabel',5,'Preparando '+rows.length+' filas…');

  const date=document.getElementById('weeklyDate').value || iso(new Date());
  const week=document.getElementById('weeklyWeek').value.trim() || ('Día '+date);
  const tech=document.getElementById('weeklyTech').value.trim();
  if(tech) ensurePerson(tech);
  const area=document.getElementById('weeklyArea').value.trim() || '';

  let imported=0;
  const techLabel=tech||'Sin asignar';
  const total=rows.length;
  rows.forEach((r,idx)=>{
    if(idx%5===0) setImportProgress('importProgressWrap','importProgressBar','importProgressLabel',5+(idx/total)*90, 'Importando '+ (idx+1) +' / '+total);
    const machine=r.machine || 'SIN ASIGNAR';

    // Cada fila se agrega SIEMPRE. No se comparan ni eliminan duplicados.
    db.history.unshift([
      date,
      r.type.toUpperCase(),
      machine,
      r.description,
      techLabel,
      `Importado • ${week}${area?' • '+area:''} • ${r.rawMachine} • ${r.start} - ${r.end} • ${r.duration} • D1:${r.value1} • D2:${r.value2}`
    ]);

    // Si es correctivo, también queda como OT histórica.
    if(String(r.type).toUpperCase().includes('CORRECTIVO')){
      db.workOrders.unshift({
        id:'OT-IMP-'+Date.now().toString().slice(-7)+'-'+imported,
        date:date,
        machine:machine,
        fault:r.description,
        priority:'Media',
        status:'Cerrada',
        downtime:durationToHours(r.duration),
        technician:techLabel
      });
    }

    // Todo evento importado se conserva como evento de máquina.
    const clas=camposClasificacion(r.description);
    db.events.unshift({
      date:date,
      machine:machine,
      type:r.type,
      severity:'Media',
      desc:r.description,
      minutes:durationToMinutes(r.duration),
      kgTarget:parseKg(r.value1),
      kgActual:parseKg(r.value2),
      start:r.start,
      end:r.end,
      duration:r.duration,
      ...clas
    });

    imported++;
  });

  save();
  setImportProgress('importProgressWrap','importProgressBar','importProgressLabel',100, imported+' filas importadas');
  document.getElementById('weeklyImportSummary').innerHTML=
    `<div class="success"><strong>${imported} intervenciones agregadas.</strong><br>
    Fecha: ${esc(date)} • ${esc(week)} • Responsable: ${esc(tech)}${area?' • Área: '+esc(area):''}<br>
    No se eliminaron ni omitieron registros.</div>`;

  document.getElementById('weeklyPreview').innerHTML='';
  document.getElementById('weeklyPaste').value='';
  render();
  toast(imported+' filas agregadas al historial');
  setTimeout(()=>{ const w=document.getElementById('importProgressWrap'); if(w) w.style.display='none'; }, 1800);
}

function parseDuration(v){
  const s=String(v||'').trim();
  if(!s) return {minutes:0, ok:false, empty:true, raw:s};
  let m=s.match(/^(\d{1,3}):([0-5]?\d)$/);
  if(m) return {minutes:Number(m[1])*60+Number(m[2]), ok:true, raw:s};
  if(/^\d+(\.\d+)?$/.test(s)) return {minutes:Math.round(Number(s)), ok:true, raw:s};
  m=s.match(/(\d+)\s*h(?:oras?)?/i);
  const h=m?Number(m[1]):0;
  m=s.match(/(\d+)\s*m(?:in(?:utos?)?)?/i);
  const min=m?Number(m[1]):0;
  if(h||min) return {minutes:h*60+min, ok:true, raw:s};
  return {minutes:0, ok:false, empty:false, raw:s};
}
function durationToMinutes(v){
  const p=parseDuration(v);
  return p.minutes;
}
function durationToHours(v){return durationToMinutes(v)/60}
function getISOWeek(date){
  const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
  const day=d.getUTCDay()||7;
  d.setUTCDate(d.getUTCDate()+4-day);
  const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d-yearStart)/86400000)+1)/7);
}
function clearWeeklyImport(){
  document.getElementById('weeklyPaste').value='';
  document.getElementById('weeklyPreview').innerHTML='';
}

// ================= REPORTE MENSUAL =================
const MESES_ES = {
  'enero':1,'febrero':2,'marzo':3,'abril':4,'mayo':5,'junio':6,
  'julio':7,'agosto':8,'septiembre':9,'setiembre':9,'octubre':10,'noviembre':11,'diciembre':12
};
function parseSpanishDate(str){
  const s=String(str||'').trim().toLowerCase()
    .replace(/\s+/g,' ')
    .replace(/[ºª]/g,'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,''); // quita acentos
  // "1 de agosto de 2026" / "01 de agosto 2026" / "1 agosto 2026"
  let m=s.match(/^(\d{1,2})\s*(?:de\s+)?([a-z]+)\s*(?:de\s+)?(\d{4})$/);
  if(m){
    const day=+m[1];
    const mon=MESES_ES[m[2]];
    const year=+m[3];
    if(mon && day>=1 && day<=31) return iso(new Date(year, mon-1, day, 12, 0, 0));
  }
  // fallback YYYY-MM-DD o DD/MM/YYYY
  if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m) return iso(new Date(+m[3], +m[2]-1, +m[1], 12, 0, 0));
  return null;
}
function parseMonthlyRows(text){
  return String(text||'')
    .split(/\r?\n/)
    .map(x=>x.trimEnd())
    .filter(x=>x.trim())
    .map((line,index)=>{
      // Prefer tab, else 2+ spaces
      let cols = line.includes('\t') ? line.split('\t') : line.split(/\s{2,}/);
      // Si se pegó con un solo espacio entre campos, intentar separar por patrones conocidos
      if(cols.length < 4){
        // Heurística: fecha al inicio, luego tipo (MAYÚSCULAS), máquina (código), resto descripción + horas
        const alt = line.match(/^(.+?)\s+(CORRECTIVO|PREVENTIVO|EVENTO|FALLA|APAG[OÓ]N|E-STOP|ALARMA)?\s*([A-Z0-9][\w\- ]*?[A-Z0-9\d])?\s+(.+?)(?:\s+(\d{1,2}:\d{2}\s*(?:a\.?\s*m\.?|p\.?\s*m\.?)?)\s+(\d{1,2}:\d{2}\s*(?:a\.?\s*m\.?|p\.?\s*m\.?)?)?\s+(\d{1,2}:\d{2}))?$/i);
        if(alt){
          cols = [alt[1]||'', alt[2]||'', alt[3]||'', alt[4]||'', alt[5]||'', alt[6]||'', alt[7]||''];
        }
      }
      const c = cols.map(x=>String(x||'').trim());
      const dateRaw = c[0]||'';
      const dateIso = parseSpanishDate(dateRaw) || '';
      const type = (c[1]||'').toUpperCase() || (c[3] ? 'EVENTO' : 'NOTA');
      const rawMachine = c[2]||'';
      const machine = rawMachine ? normalizeMachine(rawMachine) : 'SIN ASIGNAR';
      // Si la descripción quedó vacía pero hay texto en columnas posteriores, juntar
      let description = c[3]||'';
      let start = c[4]||'', end = c[5]||'', duration = c[6]||'';
      // Casos donde tipo/máquina vacíos y la descripción está en col 1 o 2
      if(!c[1] && !c[2] && c[3]===''){
        // "2 de agosto de 2026			maquinas en reposo			00:00"
        // tras split por tabs: [fecha, '', '', 'maquinas...', '', '', '00:00'] o similar
        description = c.find((v,i)=>i>0 && v && !/^\d{1,2}:\d{2}/.test(v) && !/a\.?\s*m\.?|p\.?\s*m\.?/i.test(v)) || description;
        duration = c.find(v=>/^\d{1,2}:\d{2}$/.test(v)) || duration;
      }
      // Ajuste: a veces la descripción arrastra horas si no había tabs
      if(!duration){
        const dm = description.match(/(\d{1,2}:\d{2})\s*$/);
        if(dm){ duration=dm[1]; description=description.replace(/\s*\d{1,2}:\d{2}\s*$/,'').trim(); }
      }
      return {
        row: String(index+1),
        dateRaw,
        date: dateIso,
        type,
        rawMachine,
        machine,
        description: description || (type==='NOTA' ? 'Sin descripción' : ''),
        start,
        end,
        duration
      };
    });
}
function previewMonthlyImport(){
  const rows=parseMonthlyRows(document.getElementById('monthlyPaste').value);
  const box=document.getElementById('monthlyPreview');
  if(!rows.length){
    box.innerHTML='<div class="notice">No se encontraron filas para analizar.</div>';
    return;
  }
  let ok=0, warn=0;
  const issues=[];
  const rowStatus=rows.map((r,i)=>{
    const miss=[];
    if(!r.date) miss.push('fecha');
    if(!r.machine || r.machine==='SIN ASIGNAR') miss.push('máquina');
    if(!r.description) miss.push('descripción');
    if(!r.duration) miss.push('duración');
    else {
      const pd=parseDuration(r.duration);
      if(!pd.ok) miss.push('duración ilegible ("'+r.duration+'")');
    }
    if(miss.length){ warn++; issues.push('Fila '+(r.row||i+1)+': '+miss.join(', ')); }
    else ok++;
    return miss;
  });
  const head=warn
    ? `<div class="notice"><strong>Indicador:</strong> ${ok} correctas · ${warn} con observaciones · ${rows.length} filas detectadas</div>`
    : `<div class="success"><strong>✓ Indicador:</strong> ${ok}/${rows.length} filas correctas — listo para importar</div>`;
  box.innerHTML=`
    ${head}
    <div style="overflow:auto;margin-top:10px">
      <table>
        <thead><tr><th>#</th><th>Fecha</th><th>Tipo</th><th>Equipo original</th><th>Máquina</th><th>Descripción</th><th>Inicio</th><th>Fin</th><th>Duración</th><th>Estado</th></tr></thead>
        <tbody>
          ${rows.map((r,i)=>{
            const miss=rowStatus[i];
            const st=miss.length?`<span class="badge b-warn">Incompleto</span>`:`<span class="badge b-ok">OK</span>`;
            return `<tr>
            <td>${esc(r.row)}</td>
            <td>${r.date?esc(r.date):'<span class="badge b-bad">'+esc(r.dateRaw)+'</span>'}</td>
            <td>${badge(r.type)}</td>
            <td>${esc(r.rawMachine||'—')}</td>
            <td><strong>${esc(r.machine)}</strong></td>
            <td>${esc(r.description)}</td>
            <td>${esc(r.start)}</td>
            <td>${esc(r.end)}</td>
            <td>${esc(r.duration)}</td>
            <td>${st}</td>
          </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="muted" style="font-size:11px;margin-top:10px">
      <strong>Cómo se interpreta:</strong> OK = fecha, máquina, descripción y duración legibles.
      Incompleto = falta campo o duración no legible (puedes importar igual; las filas sin fecha se omiten al importar).
      Los kg desperdiciados del periodo se estiman con <em>capacidad diaria de la máquina × (minutos de paro / 1440)</em> cuando no hay Dato1/Dato2 del reporte diario.
      ${issues.length?`<br><br><strong>Detalle:</strong><br>${issues.slice(0,15).map(esc).join('<br>')}${issues.length>15?'<br>…':''}`:''}
    </div>`;
}
function importMonthlyReport(){
  const rows=parseMonthlyRows(document.getElementById('monthlyPaste').value);
  if(!rows.length){toast('No hay filas para importar');return;}

  const ref=document.getElementById('monthlyRef').value.trim() || 'Reporte mensual';
  const tech=document.getElementById('monthlyTech').value.trim();
  if(tech) ensurePerson(tech);
  const area=document.getElementById('monthlyArea').value.trim() || '';
  const techLabel=tech||'Sin asignar';

  let imported=0, skipped=0;
  rows.forEach(r=>{
    if(!r.date){ skipped++; return; }
    const machine=r.machine || 'SIN ASIGNAR';

    // Asegura que la máquina exista en db (aunque no esté en el área actual)
    if(machine!=='SIN ASIGNAR' && !db.machines.find(m=>m.id===machine)){
      db.machines.push({id:machine,name:machine,status:'Operando',runtime:0,cycles:0,availability:100,powerKwh:0,lastPowerOutage:'—',dailyTarget:MACHINE_TARGETS[machine]||0});
    }

    db.history.unshift([
      r.date,
      r.type,
      machine,
      r.description,
      techLabel,
      `Mensual • ${ref}${area?' • '+area:''} • ${r.rawMachine||'—'} • ${r.start} - ${r.end} • ${r.duration}`
    ]);

    if(String(r.type).toUpperCase().includes('CORRECTIVO')){
      db.workOrders.unshift({
        id:'OT-MEN-'+Date.now().toString().slice(-7)+'-'+imported,
        date:r.date,
        machine:machine,
        fault:r.description,
        priority:'Media',
        status:'Cerrada',
        downtime:durationToHours(r.duration),
        technician:techLabel
      });
    }

    const clas=camposClasificacion(r.description);
    db.events.unshift({
      date:r.date,
      machine:machine,
      type:r.type,
      severity:'Media',
      desc:r.description,
      minutes:durationToMinutes(r.duration),
      kgTarget:0,
      kgActual:0,
      start:r.start,
      end:r.end,
      duration:r.duration,
      ...clas
    });

    imported++;
  });

  save();
  document.getElementById('monthlyImportSummary').innerHTML=
    `<div class="success"><strong>${imported} intervenciones agregadas</strong>${skipped?` · ${skipped} omitidas (sin fecha válida)`:''}.<br>
    Referencia: ${esc(ref)} • Responsable: ${esc(techLabel)}${area?' • Área: '+esc(area):''}<br>
    No se eliminaron ni omitieron registros con fecha válida.</div>`;

  document.getElementById('monthlyPreview').innerHTML='';
  document.getElementById('monthlyPaste').value='';
  render();
  toast(imported+' filas del reporte mensual agregadas');
}
function clearMonthlyImport(){
  document.getElementById('monthlyPaste').value='';
  document.getElementById('monthlyPreview').innerHTML='';
}

const VIEW_CONFIG={
  dashboard:{title:'Dashboard',render:renderDashboard},
  semanaPlanta:{title:'Semana de la planta',render:renderSemanaPlanta},
  fichaMaquina:{title:'Ficha de máquina',render:renderFichaMaquina},
  preventivo:{title:'Preventivos',render:()=>{renderPm();renderPmRecommendations();}},
  predictivo:{title:'Predictivo',render:renderPredictive},
  correctivo:{title:'Correctivos / OT',render:renderWO},
  eventos:{title:'Fallas y eventos',render:renderEvents},
  tarjetas:{title:'Base de máquinas',render:()=>{renderCards();renderChassis();}},
  historial:{title:'Historial',render:renderHistory},
  importar:{title:'Reporte diario'},
  mensual:{title:'Reporte mensual'},
  refacciones:{title:'Refacciones',render:renderParts},
  equipo:{title:'Equipo de mantenimiento',render:()=>{
    const date=document.getElementById('teamRefDate');
    if(date&&!date.value) date.value=dashRefDate;
    renderTeam();
  }},
  comidas:{title:'Rol de comidas',render:()=>{
    renderMealBoard();
    renderMealEmpleados();
    renderMealHistorial();
  }},
  informes:{title:'Informes PDF',render:fillReportMachineSelect},
  negligencia:{title:'Gestión financiera',render:()=>{
    fillNegligenciaMachineSelect();
    renderNegligencia();
  }},
  backlog:{title:'Backlog (SMRP 5.4.9)',render:renderBacklog},
  tableroCompra:{title:'Tablero de compra',render:renderTableroCompra},
  financiero:{title:'Justificación de compras',render:renderFinanciero}
};

function renderDashboard(){
  const allPanel=document.getElementById('dashAllPanel');
  const machinePanel=document.getElementById('dashActivePanel');
  if(selectedMachine){
    if(allPanel) allPanel.style.display='none';
    if(machinePanel) machinePanel.style.display='block';
    machinePeriod=getDashPeriod();
    const tabs=[...document.querySelectorAll('#dashActivePanel .tab')];
    const activeIndex=machinePeriod==='week'?1:machinePeriod==='month'?2:0;
    tabs.forEach((tab,index)=>tab.classList.toggle('active',index===activeIndex));
    renderMachineDetail();
  }else{
    if(allPanel) allPanel.style.display='block';
    if(machinePanel) machinePanel.style.display='none';
  }
  if(!selectedMachine){
    renderMachineTiles();
    renderCharts();
  }
}

function updatePageContext(){
  const config=VIEW_CONFIG[currentView]||VIEW_CONFIG.dashboard;
  const title=document.getElementById('pageTitle');
  const subtitle=document.getElementById('pageSubtitle');
  const area=isAllAreas()?'Toda la planta':currentArea;
  const machine=selectedMachine||'Todas las máquinas';
  const period=getDashPeriod();
  const {start,end}=periodRange(period,dashRefDate);
  const range=period==='day'?iso(start):`${iso(start)} → ${iso(end)}`;
  if(title) title.textContent=config.title;
  if(subtitle) subtitle.textContent=`${area} · ${machine} · ${range}`;
}

function render(){
  const machines=MACHINES();
  if(selectedMachine&&!machines.includes(selectedMachine)) selectedMachine='';
  const machineSelect=document.getElementById('machineSelect');
  if(machineSelect){
    machineSelect.innerHTML='<option value="">(Todas)</option>'+
      machines.map(machine=>`<option value="${escAttr(machine)}">${esc(machine)}</option>`).join('');
    machineSelect.value=selectedMachine;
  }
  const predictiveMachine=document.getElementById('predMachine');
  if(predictiveMachine) predictiveMachine.textContent=selectedMachine||(machines[0]||'—');
  syncPeriodControls();
  updateDashPeriodLabel();

  const financialMachine=document.getElementById('finMachine');
  if(financialMachine){
    fillFinMachineSelect();
    if(selectedMachine&&[...financialMachine.options].some(option=>option.value===selectedMachine)){
      financialMachine.value=selectedMachine;
    }
  }

  const activeView=document.querySelector('.view.active')?.id;
  currentView=activeView&&VIEW_CONFIG[activeView]?activeView:'dashboard';
  if(activeView!==currentView){
    document.querySelectorAll('.view').forEach(section=>section.classList.toggle('active',section.id===currentView));
  }
  updatePageContext();
  const view=VIEW_CONFIG[currentView];
  if(view.render){
    try{
      view.render();
    }catch(error){
      console.error(`No se pudo actualizar la pantalla "${view.title}"`,error);
      toast(`No se pudo actualizar ${view.title}`,'err');
    }
  }
}

function syncPeriodControls(){
  const sideP=document.getElementById('sidePeriodSelect');
  const sideD=document.getElementById('sideRefDateInput');
  if(sideP) sideP.value=getDashPeriod();
  if(sideD) sideD.value=dashRefDate;
}
function onSidePeriodChange(){
  const sideP=document.getElementById('sidePeriodSelect');
  const sideD=document.getElementById('sideRefDateInput');
  if(sideP) window.dashPeriod=sideP.value||'day';
  if(sideD && sideD.value) dashRefDate=sideD.value;
  updateDashPeriodLabel();
  render();
}
function onDashDateChange(){ onSidePeriodChange(); }
function shiftDashDate(dir){
  const p=getDashPeriod();
  const d=parseLocalDate(dashRefDate);
  if(p==='day') d.setDate(d.getDate()+dir);
  else if(p==='week') d.setDate(d.getDate()+dir*7);
  else d.setMonth(d.getMonth()+dir);
  dashRefDate=iso(d);
  syncPeriodControls();
  updateDashPeriodLabel();
  render();
}
function setDashToday(){
  dashRefDate=iso(new Date());
  syncPeriodControls();
  updateDashPeriodLabel();
  render();
}
function updateDashPeriodLabel(){
  const p=getDashPeriod();
  const {start,end}=periodRange(p, dashRefDate);
  const fmt=d=>iso(d);
  const dayNames=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  let txt='', pillClass='ctx-day', pillLabel='Día';
  if(p==='day'){
    txt=dayNames[start.getDay()]+' '+fmt(start);
    pillClass='ctx-day'; pillLabel='Día';
  } else if(p==='week'){
    txt=fmt(start)+' → '+fmt(end);
    pillClass='ctx-week'; pillLabel='Semana';
  } else {
    txt=fmt(start)+' → '+fmt(end);
    pillClass='ctx-month'; pillLabel='Mes';
  }
  const areaTxt=isAllAreas()?'Toda la planta':currentArea;
  const machTxt=selectedMachine||'Todas las máquinas';
  const ctx=document.getElementById('dashContextLabel');
  if(ctx) ctx.innerHTML=`<span class="ctx-pill ${pillClass}">📅 ${pillLabel}</span> <strong>${esc(areaTxt)}</strong> · ${esc(machTxt)} · ${esc(txt)}`;
  const btn=document.getElementById('btnClearMachine');
  if(btn) btn.style.display=selectedMachine?'inline-block':'none';
  saveUiState();
}
function getDashPeriod(){ return window.dashPeriod || (document.getElementById('sidePeriodSelect')?.value) || 'day'; }
function clearMachineSelection(){
  selectedMachine='';
  const sel=document.getElementById('machineSelect');
  if(sel) sel.value='';
  render();
}

function renderMachineTiles(){
  const root=document.getElementById('machineTiles');
  if(!root)return;
  const period=getDashPeriod();
  const totalMin=Math.max(1,periodMinutes(period,dashRefDate));
  const machines=machineFilter();
  root.innerHTML=machines.map(machine=>{
    const events=eventsInPeriod(machine.id,period,false,dashRefDate);
    const minutes=downtimeMinutes(events);
    const stopPct=Math.min(100,minutes/totalMin*100);
    const production=productionFromEvents(events);
    const target=Number(machine.dailyTarget??MACHINE_TARGETS[machine.id])||0;
    return `<button type="button" class="machine-tile" data-machine="${escAttr(machine.id)}" aria-label="Abrir detalle de ${escAttr(machine.id)}">
      <span class="machine-title"><strong>${esc(machine.id)}</strong>${badge(machine.status)}</span>
      <span class="machine-metric">${events.length} eventos · ${(minutes/60).toFixed(1)} h de paro</span>
      <span class="machine-metric">Real ${Math.round(production.actual).toLocaleString('es-MX')} / ${Math.round(production.target).toLocaleString('es-MX')} kg</span>
      <span class="machine-metric">Desperdicio ${Math.round(production.waste).toLocaleString('es-MX')} kg · Objetivo diario ${target.toLocaleString('es-MX')} kg</span>
      <span class="machine-progress"><span class="flex" style="font-size:10px"><span>Tiempo de paro</span><strong>${stopPct.toFixed(1)}%</strong></span>
        <span class="progress"><span style="width:${stopPct}%;background:${stopPct>15?'var(--red)':stopPct>5?'var(--yellow)':'var(--green)'}"></span></span>
      </span>
    </button>`;
  }).join('')||'<div class="empty">No hay máquinas para el área seleccionada.</div>';
  root.onclick=event=>{
    const tile=event.target.closest('button[data-machine]');
    if(!tile||!root.contains(tile))return;
    const select=document.getElementById('machineSelect');
    if(!select)return;
    select.value=tile.dataset.machine;
    select.dispatchEvent(new Event('change',{bubbles:true}));
  };
}

function renderPm(){
 const scopeIds=new Set(MACHINES());
 const rows=db.pm.map((r,i)=>({r,i})).filter(({r})=>{
   if(selectedMachine && r[0]!==selectedMachine) return false;
   if(!scopeIds.has(r[0])) return false;
   return true;
 });
 document.getElementById('pmTable').innerHTML=rows.map(({r,i})=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td>${esc(r[4])}</td><td>${badge(r[5])}</td><td><button class="btn" onclick="completePm(${i})">Ejecutar</button></td></tr>`).join('')||'<tr><td colspan="7" class="empty">Sin planes preventivos en el alcance actual</td></tr>';
}
function completePm(i){
 db.pm[i][3]=iso(new Date()); const d=new Date(); d.setDate(d.getDate()+({'Semanal':7,'Quincenal':15,'Mensual':30,'Trimestral':90,'Diaria':1}[db.pm[i][2]]||30));db.pm[i][4]=iso(d);
 db.history.unshift([iso(new Date()),'Preventivo',db.pm[i][0],`Ejecutado: ${db.pm[i][1]}`,'Usuario','Cerrado']);save();render();toast('Preventivo ejecutado y reprogramado');
}
function renderWO(){
 const scopeIds=new Set(MACHINES());
 const period=getDashPeriod();
 const {start,end}=periodRange(period, dashRefDate);
 const rows=db.workOrders.filter(x=>{
   if(selectedMachine && x.machine!==selectedMachine) return false;
   if(!scopeIds.has(x.machine) && x.machine!=='SIN ASIGNAR') return false;
   const d=parseLocalDate(x.date);
   if(d<start || d>end) return false;
   return true;
 });
 const lbl=document.getElementById('woFilterLabel');
 if(lbl){
   const areaTxt=isAllAreas()?'Toda la planta':currentArea;
   const machTxt=selectedMachine||'todas las máquinas';
   lbl.textContent=`Filtro: ${areaTxt} · ${machTxt} · ${iso(start)}${period==='day'?'':' → '+iso(end)} · ${rows.length} OT`;
 }
 document.getElementById('woTable').innerHTML=rows.map(x=>`<tr><td>${esc(x.id)}</td><td>${esc(x.date)}</td><td>${esc(x.machine)}</td><td>${esc(x.fault)}</td><td>${badge(x.priority)}</td><td>${badge(x.status)}</td><td>${esc(x.downtime)}</td><td><button class="btn" onclick='closeWO(${JSON.stringify(String(x.id||''))})'>${x.status==='Cerrada'?'Ver':'Cerrar'}</button></td></tr>`).join('')||`<tr><td colspan="8">${emptyState('No hay OT en este filtro','Cambia área/periodo o crea una nueva orden.','<button class="btn primary" onclick="openModal(\'workOrder\')">+ Nueva OT</button>')}</td></tr>`;
}
function closeWO(id){
  const x=db.workOrders.find(o=>o.id===id);
  if(!x) return;
  if(x.status==='Cerrada'){ toast('Esta OT ya está cerrada'); return; }
  if(!confirm('¿Cerrar la OT '+id+' de '+x.machine+'?')) return;
  x.status='Cerrada';
  db.history.unshift([iso(new Date()),'Correctivo',x.machine,x.fault,x.technician,'Cerrado']);
  save();render();toast('OT cerrada');
  flashLastTableRow('woTable');
}
function renderEvents(){
 const scopeIds=new Set(MACHINES());
 const period=getDashPeriod();
 const {start,end}=periodRange(period, dashRefDate);
 const list=db.events.filter(x=>{
   if(selectedMachine && x.machine!==selectedMachine) return false;
   if(!scopeIds.has(x.machine) && x.machine!=='SIN ASIGNAR') return false;
   const d=eventDate(x);
   return d>=start && d<=end;
 });
 // Auto-clasificar en memoria si faltan los 4 niveles
 list.forEach(x=>{
   if(x.desc && (!x.sintoma || !x.componente || x.clasificacion==null)) Object.assign(x, camposClasificacion(x.desc));
 });
 document.getElementById('eventList').innerHTML=list.map(x=>{
   const conf=Number(x.confianza)||0;
   const niveles=[
     x.sintoma && x.sintoma!=='No especificado'?'🔴 '+x.sintoma:'',
     x.componente && x.componente!=='No especificado'?'🔧 '+x.componente:'',
     x.modo_falla && x.modo_falla!=='No especificado'?'⚠️ '+x.modo_falla:'',
     x.accion && x.accion!=='No especificado'?'✅ '+x.accion:''
   ].filter(Boolean).join(' · ');
   const catBadge=x.clasificacion && x.clasificacion!=='No clasificada'
     ? `<span class="badge ${conf>80?'b-ok':conf>50?'b-warn':'b-info'}" title="Principal ${conf}%">${esc(x.clasificacion)} · ${conf}%</span>`
     : `<span class="badge b-info">Sin clasificar</span>`;
   const keys=(x.palabras_clave||[]).slice(0,6).join(', ');
   return `<div class="item">
     <div class="flex"><strong>${esc(x.machine)} • ${esc(x.type)}</strong><span style="display:flex;gap:6px;flex-wrap:wrap">${catBadge}${badge(x.severity)}</span></div>
     <div style="font-size:11px;margin:4px 0;color:var(--muted)">${esc(niveles||'Sin desglose semántico')}</div>
     <div style="font-size:12px;margin:4px 0">${esc(x.desc)}</div>
     <div class="muted" style="font-size:10px">${esc(x.date)} • Paro: ${x.minutes} min${x.kgTarget||x.kgActual?` • Kg ${parseKg(x.kgActual)}/${parseKg(x.kgTarget)}`:''}${keys?' · 🔑 '+esc(keys):''}</div>
   </div>`;
 }).join('')||'<div class="empty">Sin eventos en el filtro actual (área / máquina / periodo)</div>';

 // Tops 4 niveles
 const countField=(field)=>{
   const c={};
   list.forEach(ev=>{
     const v=ev[field];
     if(!v || v==='No especificado' || v==='No clasificada') return;
     c[v]=(c[v]||0)+1;
   });
   return Object.entries(c).sort((a,b)=>b[1]-a[1]);
 };
 const renderTopList=(arr,elId)=>{
   const el=document.getElementById(elId);
   if(!el) return;
   el.innerHTML=arr.length?arr.slice(0,6).map(([k,v],i)=>
     `<div class="item"><div class="flex"><span style="font-size:12px"><strong>${i+1}.</strong> ${esc(k)}</span><span class="badge b-warn">${v}×</span></div></div>`
   ).join(''):'<div class="empty">Sin datos</div>';
 };
 renderTopList(countField('sintoma'),'topSintomas');
 renderTopList(countField('componente'),'topComponentes');
 renderTopList(countField('modo_falla'),'topModos');

 // Donut por tipo de evento
 if(charts.event){try{charts.event.destroy()}catch(e){}}
 const evTypes={};
 list.forEach(x=>evTypes[x.type]=(evTypes[x.type]||0)+(Number(x.minutes)||0)/60);
 const evCtx=document.getElementById('eventChart');
 if(evCtx){
   charts.event=new Chart(evCtx,{type:'doughnut',data:{labels:Object.keys(evTypes).length?Object.keys(evTypes):['Sin paros'],datasets:[{data:Object.keys(evTypes).length?Object.values(evTypes):[1]}]},options:{responsive:true,maintainAspectRatio:false}});
 }

 // Barras por componente (o clasificación principal)
 if(charts.categorias){try{charts.categorias.destroy()}catch(e){}}
 const conteo={};
 list.forEach(ev=>{
   const cat=(ev.componente && ev.componente!=='No especificado')?ev.componente:(ev.clasificacion||'No clasificada');
   conteo[cat]=(conteo[cat]||0)+1;
 });
 const labels=Object.keys(conteo).sort((a,b)=>conteo[b]-conteo[a]);
 const data=labels.map(l=>conteo[l]);
 const catCtx=document.getElementById('categoriasFallasChart');
 if(catCtx){
   charts.categorias=new Chart(catCtx,{
     type:'bar',
     data:{labels:labels.slice(0,12),datasets:[{label:'Frecuencia',data:data.slice(0,12),backgroundColor:['#3b82f6','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316','#8b5cf6','#64748b']}]},
     options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
   });
 }
 const topEl=document.getElementById('topFallasCats');
 if(topEl){
   topEl.innerHTML=labels.length?labels.slice(0,8).map((cat,i)=>
     `<div class="item"><div class="flex"><span style="font-size:12px"><strong>${i+1}.</strong> ${esc(cat)}</span><span class="badge b-warn">${conteo[cat]}×</span></div></div>`
   ).join(''):'<div class="empty">Sin categorías detectadas en el filtro</div>';
 }
 renderKeywordChart(list);
}
function editKeywords(){
 const cur=(db.keywords||[]).join(', ');
 const val=prompt('Palabras clave a buscar en las descripciones de fallas (separadas por coma):', cur);
 if(val===null)return;
 db.keywords=val.split(',').map(s=>s.trim()).filter(Boolean);
 save();renderKeywordChart();
}
function renderKeywordChart(scopedEvents){
 const list=db.keywords||[];
 const pool=Array.isArray(scopedEvents)?scopedEvents:db.events;
 document.getElementById('keywordListLabel').textContent='Buscando en el filtro actual: '+list.join(' · ');
 const counts=list.map(k=>({k,matches:pool.filter(x=>(x.desc||'').toLowerCase().includes(k.toLowerCase()))}));
 counts.sort((a,b)=>b.matches.length-a.matches.length);
 if(charts.keyword){try{charts.keyword.destroy()}catch(e){}}
 const cv=document.getElementById('keywordChart');
 if(cv){
   charts.keyword=new Chart(cv,{type:'bar',data:{labels:counts.map(c=>c.k),datasets:[{label:'Menciones en fallas',data:counts.map(c=>c.matches.length),backgroundColor:'#f59e0b'}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}});
 }
 document.getElementById('keywordDetail').innerHTML=counts.filter(c=>c.matches.length>0).map(c=>{
   const porMaquina={};
   c.matches.forEach(x=>{porMaquina[x.machine]=(porMaquina[x.machine]||0)+1;});
   const top=Object.entries(porMaquina).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([m,n])=>`${m} (${n})`).join(', ');
   return `<div class="item"><div class="flex"><strong>${esc(c.k)}</strong><span class="badge b-warn">${c.matches.length}×</span></div><div class="muted" style="font-size:11px">Máquinas: ${esc(top)}</div></div>`;
 }).join('')||'<div class="empty">Sin coincidencias en el filtro actual. Cambia área/periodo o registra más fallas.</div>';
}
function renderMachineDB(){
  const af=document.getElementById('mdbAreaFilter');
  if(af && !af.dataset.filled){
    af.innerHTML='<option value="">Todas las áreas</option>'+AREA_ORDER.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
    af.dataset.filled='1';
  }
  const areaF=af?.value||'';
  const q=(document.getElementById('mdbSearch')?.value||'').toLowerCase();
  const rows=LIVE_MACHINE_DB.map((r,i)=>({r,i})).filter(({r})=>{
    if(areaF && r.area!==areaF) return false;
    if(q && !String(r.code).toLowerCase().includes(q) && !String(r.area).toLowerCase().includes(q)) return false;
    return true;
  });
  const tb=document.getElementById('machineDbTable');
  if(!tb) return;
  tb.innerHTML=rows.map(({r,i})=>`<tr>
    <td><input value="${esc(r.area)}" style="width:120px" onchange="updateMaquinaDB(${i},'area',this.value)"></td>
    <td><input value="${esc(r.code)}" style="width:140px" onchange="updateMaquinaDB(${i},'code',this.value)"></td>
    <td><input type="number" value="${Number(r.dailyKg)||0}" style="width:110px" onchange="updateMaquinaDB(${i},'dailyKg',this.value)"></td>
    <td><button class="btn red" onclick="eliminarMaquinaDB(${i})">✕</button></td>
  </tr>`).join('')||'<tr><td colspan="4" class="empty">Sin máquinas en el catálogo</td></tr>';
}
function updateMaquinaDB(i,field,val){
  if(!LIVE_MACHINE_DB[i]) return;
  if(field==='dailyKg') LIVE_MACHINE_DB[i].dailyKg=Number(val)||0;
  else LIVE_MACHINE_DB[i][field]=String(val||'').trim();
  persistMachineDB();
  toast('Máquina actualizada');
  renderMachineDB();
  render();
}
function eliminarMaquinaDB(i){
  if(!LIVE_MACHINE_DB[i]) return;
  if(!confirm('¿Quitar '+LIVE_MACHINE_DB[i].code+' del catálogo?')) return;
  LIVE_MACHINE_DB.splice(i,1);
  persistMachineDB();
  renderMachineDB();
  render();
  toast('Máquina eliminada del catálogo');
}
function agregarMaquinaDB(){
  const area=prompt('Área (ej. Cam, Bsl, Dim):', currentArea==='__ALL__'?(AREA_ORDER[0]||'Cam'):currentArea);
  if(area===null) return;
  const code=prompt('Código de máquina (ej. BK-9):','');
  if(!code||!code.trim()) return;
  const kg=prompt('Capacidad kg/día:','0');
  LIVE_MACHINE_DB.push({area:area.trim()||'Sin área', code:code.trim(), dailyKg:Number(kg)||0});
  persistMachineDB();
  const af=document.getElementById('mdbAreaFilter');
  if(af){ af.dataset.filled=''; }
  renderMachineDB();
  render();
  toast('Máquina agregada');
}
function resetMachineDB(){
  if(!confirm('¿Restaurar el catálogo original de máquinas? Se perderán altas/bajas locales.')) return;
  LIVE_MACHINE_DB=MACHINE_DB.map(r=>({area:r.area,code:r.code,dailyKg:Number(r.dailyKg)||0}));
  localStorage.removeItem('SL_MACHINE_DB_CUSTOM');
  rebuildAreasFromLive();
  persistMachineDB();
  const af=document.getElementById('mdbAreaFilter');
  if(af){ af.dataset.filled=''; }
  renderMachineDB();
  render();
  toast('Catálogo restaurado');
}
function renderCards(){ renderMachineDB(); }
function renderChassis(){}
function toggleCard(){}
function predecirProximaFalla(machineId){
  const eventos=(db.events||[]).filter(e=>e.machine===machineId && e.date).map(e=>({d:parseLocalDate(e.date),e})).filter(x=>!isNaN(x.d)).sort((a,b)=>a.d-b.d);
  if(eventos.length<3) return null;
  let sum=0,count=0;
  for(let i=1;i<eventos.length;i++){
    const diff=(eventos[i].d-eventos[i-1].d)/(1000*60*60*24);
    if(diff>0 && diff<365){ sum+=diff; count++; }
  }
  if(!count) return null;
  const promedio=sum/count;
  const ultima=eventos[eventos.length-1].d;
  const proxima=new Date(ultima.getTime()+promedio*24*60*60*1000);
  return {promedio:+promedio.toFixed(1), ultima:iso(ultima), proxima:iso(proxima), n:eventos.length};
}

const EARLY_SIGNAL_WORDS=['ruido','vibracion','vibración','calentando','calienta','falseaba','falseo','intermitente','chispa','humo','olor','extraño','anomal','prealarm','pre-alarm','sobrecorriente','sobretemperatura'];

function _predEventPool(histDays, onlyCorrectivo){
  const scopeIds=new Set(MACHINES());
  const cutoff=new Date();
  cutoff.setDate(cutoff.getDate()-(Number(histDays)||60));
  cutoff.setHours(0,0,0,0);
  return (db.events||[]).filter(e=>{
    if(!e.date) return false;
    if(selectedMachine && e.machine!==selectedMachine) return false;
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

function renderPrediccionesAvanzadas(){
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
  if(charts.predWeek){ try{charts.predWeek.destroy()}catch(e){} }
  const days=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const counts=new Array(7).fill(0);
  pool.forEach(e=>{
    const d=parseLocalDate(e.date);
    if(!isNaN(d)) counts[d.getDay()]++;
  });
  const wctx=document.getElementById('predWeekdayChart');
  if(wctx){
    charts.predWeek=new Chart(wctx,{
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

function renderPredictive(){
 document.getElementById('predictiveTable').innerHTML=db.predictive.filter(x=>!selectedMachine||x[1]===selectedMachine).map(x=>`<tr>${x.map((v,i)=>`<td>${i===6?badge(v):esc(v)}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="7" class="empty">Sin mediciones</td></tr>';
 const p=db.predictive.filter(x=>x[1]===(selectedMachine||MACHINES()[0]));
 document.getElementById('conditionCards').innerHTML=p.slice(0,3).map(x=>`<div class="card"><div class="muted" style="font-size:10px">${esc(x[2])}</div><div style="font-size:23px;font-weight:800;margin:5px 0">${esc(x[3])} ${esc(x[4])}</div>${badge(x[6])}<div class="muted mt" style="font-size:10px">Umbral: ${esc(x[5])}</div></div>`).join('')||'<div class="empty">Sin datos de condición</div>';
 const listEl=document.getElementById('predNextFailList');
 if(listEl){
   const ids=selectedMachine?[selectedMachine]:MACHINES().slice(0,12);
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
const historySelected=new Set();
let _histFilterCache={key:'', rows:null};
function invalidateHistoryCache(){ _histFilterCache={key:'', rows:null}; }
function historyFilteredRows(){
 const q=(document.getElementById('historyFilter')?.value||'').toLowerCase();
 const scopeIds=new Set(MACHINES());
 const period=getDashPeriod();
 const {start,end}=periodRange(period, dashRefDate);
 const key=[q,selectedMachine||'',currentArea||'',period,dashRefDate,iso(start),iso(end),db.history.length].join('|');
 if(_histFilterCache.key===key && _histFilterCache.rows) return _histFilterCache.rows;
 const rows=db.history.map((r,idx)=>({r,idx})).filter(({r})=>{
   if(selectedMachine && r[2]!==selectedMachine) return false;
   if(r[2] && r[2]!=='SIN ASIGNAR' && !scopeIds.has(r[2])) return false;
   const d=parseLocalDate(r[0]);
   if(d<start || d>end) return false;
   if(!q) return true;
   return r.join(' ').toLowerCase().includes(q);
 });
 _histFilterCache={key, rows};
 return rows;
}
function updateHistorySelCount(){
  const el=document.getElementById('historySelCount');
  if(el) el.textContent=historySelected.size+' seleccionados';
}
function historyToggleSel(idx,on){
  if(on) historySelected.add(idx); else historySelected.delete(idx);
  updateHistorySelCount();
}
function historySelectPage(on){
  const rows=historyFilteredRows();
  const limit=Number(document.getElementById('historyPageSize')?.value)||50;
  const slice=rows.slice(historyPage*limit, historyPage*limit+limit);
  slice.forEach(({idx})=>{ if(on) historySelected.add(idx); else historySelected.delete(idx); });
  renderHistory();
}
function historySelectFiltered(on){
  const rows=historyFilteredRows();
  if(on) rows.forEach(({idx})=>historySelected.add(idx));
  else historySelected.clear();
  renderHistory();
}
function historyDeleteSelected(){
  if(!historySelected.size){ toast('No hay registros seleccionados','err'); return; }
  if(!confirm('¿Eliminar '+historySelected.size+' registros del historial?')) return;
  const idxs=[...historySelected].sort((a,b)=>b-a);
  idxs.forEach(i=>{ if(db.history[i]) db.history.splice(i,1); });
  historySelected.clear();
  invalidateHistoryCache();
  save(); renderHistory(); toast(idxs.length+' registros eliminados');
}
function historyExportSelected(){
  const idxs=[...historySelected].sort((a,b)=>a-b);
  const source=idxs.length?idxs.map(i=>db.history[i]).filter(Boolean):historyFilteredRows().map(x=>x.r);
  if(!source.length){ toast('Nada que exportar','err'); return; }
  const rows=[['Fecha','Tipo','Máquina','Descripción','Técnico','Resultado']];
  source.forEach(h=>rows.push([h[0],h[1],h[2],String(h[3]||'').replace(/;/g,','),h[4],h[5]]));
  const csv='\uFEFF'+rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='historial_seleccion_'+iso(new Date())+'.csv'; a.click();
  toast('CSV exportado ('+source.length+')');
}
function renderHistory(){
 const rows=historyFilteredRows();
 const limit=Number(document.getElementById('historyPageSize')?.value)||50;
 const total=rows.length;
 const pages=Math.max(1, Math.ceil(total/limit));
 if(historyPage>=pages) historyPage=pages-1;
 if(historyPage<0) historyPage=0;
 const slice=rows.slice(historyPage*limit, historyPage*limit+limit);
 const period=getDashPeriod();
 const {start,end}=periodRange(period, dashRefDate);
 const hl=document.getElementById('historyFilterLabel');
 if(hl){
   const areaTxt=isAllAreas()?'Toda la planta':currentArea;
   const machTxt=selectedMachine||'todas las máquinas';
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
   pager.innerHTML=`<button class="btn" onclick="historyPage=Math.max(0,historyPage-1);renderHistory()" ${historyPage<=0?'disabled':''}>← Anterior</button>
     <span class="muted" style="font-size:12px">Página ${historyPage+1} de ${pages} · mostrando ${slice.length} de ${total}</span>
     <button class="btn" onclick="historyPage=Math.min(${pages-1},historyPage+1);renderHistory()" ${historyPage>=pages-1?'disabled':''}>Siguiente →</button>`;
 }
 updateHistorySelCount();
 const ca=document.getElementById('historyCheckAll');
 if(ca) ca.checked=slice.length>0 && slice.every(({idx})=>historySelected.has(idx));
}
function historyEditDesc(idx,value){if(!db.history[idx])return;db.history[idx][3]=value;save();toast('Descripción actualizada');}
function historyDeleteRow(idx){if(!db.history[idx])return;if(!confirm('¿Eliminar este registro del historial?'))return;db.history.splice(idx,1);historySelected.delete(idx);invalidateHistoryCache();save();renderHistory();toast('Registro eliminado');}
function recomendarRefacciones(){
  const period=getDashPeriod();
  const evs=eventsInPeriod(null, period, true, dashRefDate);
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
function renderParts(){
 document.getElementById('partsTable').innerHTML=db.parts.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${r[2]}</td><td>${r[3]}</td><td>${esc(r[4])}</td><td>${r[2]<=r[3]?badge('Reponer'):'Disponible'}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">Sin refacciones</td></tr>';
 const reco=document.getElementById('partsRecoList');
 if(reco){
   const top=recomendarRefacciones();
   reco.innerHTML=top.length?top.map((x,i)=>`<div class="item"><div class="flex"><span><strong>${i+1}.</strong> ${esc(x.comp)}</span><span class="badge ${x.prioridad==='Alta'?'b-bad':x.prioridad==='Media'?'b-warn':'b-info'}">${x.freq}× · ${x.prioridad}</span></div>
     <div class="muted" style="font-size:11px;margin-top:4px">Sugerencia: mantener stock mínimo de refacción asociada a «${esc(x.comp)}».</div></div>`).join(''):'<div class="empty">Sin componentes clasificados en el periodo para recomendar stock</div>';
 }
}
function exportPowerBI(){
  const rows=[['fecha','maquina','tipo','sintoma','componente','modo_falla','accion','minutos_paro','descripcion','confianza']];
  (db.events||[]).forEach(e=>{
    rows.push([
      e.date||'', e.machine||'', e.type||'',
      e.sintoma||'', e.componente||'', e.modo_falla||'', e.accion||'',
      e.minutes||0, String(e.desc||'').replace(/;/g,','), e.confianza||''
    ]);
  });
  const csv='\uFEFF'+rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='eventos_powerbi_'+iso(new Date())+'.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV BI exportado ('+((db.events||[]).length)+' filas)');
}

function difficultyScore(p){
  const s=String(p||'').toLowerCase();
  if(s.includes('crít')) return 4;
  if(s.includes('alta')) return 3;
  if(s.includes('media')) return 2;
  if(s.includes('baja')) return 1;
  return 2;
}
function difficultyLabel(n){
  return ({1:'Baja',2:'Media',3:'Alta',4:'Crítica'})[n]||'Media';
}
function getTeamPeriod(){
  return document.getElementById('teamPeriod')?.value || 'week';
}
function getTeamRefDate(){
  const el=document.getElementById('teamRefDate');
  return (el && el.value) ? el.value : dashRefDate;
}
function collectPersonJobs(personName, period, refDate){
  const {start,end}=periodRange(period, refDate);
  const jobs=[];
  (db.history||[]).forEach(h=>{
    const tech=String(h[4]||'');
    if(personName && tech!==personName) return;
    if(!tech) return;
    const d=parseLocalDate(h[0]);
    if(d<start||d>end) return;
    const wo=(db.workOrders||[]).find(w=>w.technician===tech && w.machine===h[2] && String(w.fault||'').slice(0,40)===String(h[3]||'').slice(0,40));
    const mins=wo ? (Number(wo.downtime)||0)*60 : 0;
    const pri=wo ? wo.priority : (String(h[1]||'').toUpperCase().includes('CORRECT')?'Media':'Baja');
    jobs.push({
      date:iso(d), type:h[1]||'Trabajo', machine:h[2]||'', desc:h[3]||'',
      tech:tech, result:h[5]||'', minutes:mins, difficulty:difficultyScore(pri),
      priority:pri, source:'historial'
    });
  });
  (db.workOrders||[]).forEach(w=>{
    if(personName && w.technician!==personName) return;
    if(!w.technician) return;
    const d=parseLocalDate(w.date);
    if(d<start||d>end) return;
    const already=jobs.some(j=>j.tech===w.technician && j.machine===w.machine && j.desc===w.fault && j.date===iso(d));
    if(already) return;
    jobs.push({
      date:iso(d), type:'Correctivo', machine:w.machine||'', desc:w.fault||'',
      tech:w.technician, result:w.status||'', minutes:(Number(w.downtime)||0)*60,
      difficulty:difficultyScore(w.priority), priority:w.priority||'Media', source:'OT'
    });
  });
  return jobs.sort((a,b)=>b.date.localeCompare(a.date));
}
function personStats(jobs){
  const n=jobs.length;
  const mins=jobs.reduce((a,j)=>a+(Number(j.minutes)||0),0);
  const diffSum=jobs.reduce((a,j)=>a+(Number(j.difficulty)||0),0);
  const byType={}, byDiff={1:0,2:0,3:0,4:0};
  jobs.forEach(j=>{ byType[j.type]=(byType[j.type]||0)+1; byDiff[j.difficulty]=(byDiff[j.difficulty]||0)+1; });
  return {count:n, minutes:mins, hours:mins/60, avgDiff:n?diffSum/n:0, diffSum, byType, byDiff};
}
function renderTeam(){
  const period=getTeamPeriod();
  const ref=getTeamRefDate();
  const {start,end}=periodRange(period, ref);
  const elLab=document.getElementById('teamPeriodLabel');
  if(elLab) elLab.textContent='Analizando: '+iso(start)+(period==='day'?'':' → '+iso(end));
  const refInp=document.getElementById('teamRefDate');
  if(refInp && !refInp.value) refInp.value=ref;

  const openBy={};
  (db.workOrders||[]).forEach(w=>{
    if(w.status==='Cerrada') return;
    openBy[w.technician]=(openBy[w.technician]||0)+1;
  });

  const teamTableEl=document.getElementById('teamTable');
  if(teamTableEl) teamTableEl.innerHTML=(TEAM()).map((r,i)=>{
    const name=r[0];
    const open=openBy[name]||0;
    const safeN=esc(name).replace(/'/g,"\\'");
    return `<tr><td><strong>${esc(name)}</strong></td>
      <td><input value="${esc(r[1])}" style="width:120px" onchange="teamSetField('${safeN}','rol',this.value)"></td>
      <td><input value="${esc(r[2])}" style="width:160px" placeholder="PLC, soldadura..." onchange="teamSetField('${safeN}','especialidad',this.value)"></td>
      <td>${open}</td>
      <td><select onchange="teamSetField('${safeN}','estado',this.value)">${['Disponible','En OT','Descanso','Inactivo'].map(s=>`<option ${r[4]===s?'selected':''}>${s}</option>`).join('')}</select></td>
      <td><button class="btn" data-name="${encodeURIComponent(name)}" onclick="selectTeamPerson(decodeURIComponent(this.dataset.name))">Analizar</button> <button class="btn" onclick="removePerson(${i})">✕</button></td></tr>`;
  }).join('')||'<tr><td colspan="6" class="empty">Sin personal registrado</td></tr>';

  const ranking=(TEAM()).map(r=>{
    const jobs=collectPersonJobs(r[0], period, ref);
    const st=personStats(jobs);
    return Object.assign({name:r[0], role:r[1]}, st);
  }).sort((a,b)=> b.count-a.count || b.diffSum-a.diffSum || b.minutes-a.minutes);

  const teamRankEl=document.getElementById('teamRanking');
  if(teamRankEl) teamRankEl.innerHTML=ranking.length?ranking.map((p,i)=>{
    return `<div class="item" style="cursor:pointer" data-name="${encodeURIComponent(p.name)}" onclick="selectTeamPerson(decodeURIComponent(this.dataset.name))"><div class="flex"><span style="font-size:13px"><strong>${i+1}.</strong> ${esc(p.name)}</span><span class="badge ${p.count>0?'b-ok':'b-info'}">${p.count} trabajo${p.count===1?'':'s'}</span></div><div class="muted" style="font-size:11px;margin-top:4px">${p.hours.toFixed(1)} h · dificultad acum. ${p.diffSum} · media ${p.avgDiff?p.avgDiff.toFixed(1):'—'}</div><div class="progress mt"><span style="width:${Math.min(100,p.count*12)}%;background:var(--blue)"></span></div></div>`;
  }).join(''):'<div class="empty">Sin datos de personal</div>';

  const seen=new Set();
  const allJobs2=[];
  ranking.forEach(p=>{
    collectPersonJobs(p.name, period, ref).forEach(j=>{
      const k=j.date+'|'+j.tech+'|'+j.machine+'|'+j.desc;
      if(seen.has(k)) return; seen.add(k); allJobs2.push(j);
    });
  });
  const gst=personStats(allJobs2);
  const k1=document.getElementById('teamKpiJobs');
  const k2=document.getElementById('teamKpiHours');
  const k3=document.getElementById('teamKpiDiff');
  if(k1) k1.textContent=gst.count;
  if(k2) k2.textContent=gst.hours.toFixed(1)+' h';
  if(k3) k3.textContent=gst.count?gst.avgDiff.toFixed(1):'—';

  if(charts.teamHours){try{charts.teamHours.destroy()}catch(e){}}
  const hctx=document.getElementById('teamHoursChart');
  if(hctx){
    const rk=ranking.slice().sort((a,b)=>a.hours-b.hours);
    charts.teamHours=new Chart(hctx,{type:'bar',data:{labels:rk.length?rk.map(p=>p.name):['Sin personal'],datasets:[{label:'Horas',data:rk.length?rk.map(p=>+p.hours.toFixed(2)):[0],backgroundColor:rk.map(p=>p.hours<=0?'#ef4444':p.hours<3?'#f59e0b':'#22c55e')}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,title:{display:true,text:'Horas en el periodo'}}}}});
  }

  const sel=document.getElementById('teamPersonSelect');
  if(sel){
    const cur=sel.value;
    sel.innerHTML=(TEAM()).map(r=>'<option value="'+esc(r[0])+'">'+esc(r[0])+'</option>').join('')||'<option value="">—</option>';
    if(cur && [...sel.options].some(o=>o.value===cur)) sel.value=cur;
  }
  renderPersonAnalysis();
}
function selectTeamPerson(name){
  const sel=document.getElementById('teamPersonSelect');
  if(sel) sel.value=name;
  const btn=[...document.querySelectorAll('.nav button')].find(b=>b.dataset.view==='equipo');
  if(btn && !document.getElementById('equipo').classList.contains('active')) btn.click();
  renderPersonAnalysis();
}
function renderPersonAnalysis(){
  const name=document.getElementById('teamPersonSelect')?.value;
  const period=getTeamPeriod();
  const ref=getTeamRefDate();
  const box=document.getElementById('personKpis');
  const list=document.getElementById('personJobsList');
  const diffBox=document.getElementById('personDiffBars');
  if(!name){
    if(box) box.innerHTML='';
    if(list) list.innerHTML='<div class="empty">Selecciona una persona</div>';
    return;
  }
  const jobs=collectPersonJobs(name, period, ref);
  const st=personStats(jobs);
  const {start,end}=periodRange(period, ref);
  const rangeTxt=iso(start)+(period==='day'?'':' → '+iso(end));

  if(box) box.innerHTML=[
    ['Trabajos realizados', st.count, rangeTxt],
    ['Tiempo total', st.hours.toFixed(2)+' h', st.minutes+' min'],
    ['Dificultad media', st.avgDiff?st.avgDiff.toFixed(2):'—', 'Escala 1–4'],
    ['Dificultad acumulada', st.diffSum, 'Suma de scores']
  ].map(x=>'<div class="card kpi"><div class="label">'+x[0]+'</div><div class="value" style="font-size:22px">'+x[1]+'</div><div class="sub">'+x[2]+'</div></div>').join('');

  if(list) list.innerHTML=jobs.length?jobs.map(j=>
    '<div class="item"><div class="flex"><strong style="font-size:12px">'+esc(j.type)+' · '+esc(j.machine)+'</strong>'+badge(difficultyLabel(j.difficulty))+'</div><div style="font-size:12px;margin:4px 0">'+esc(j.desc)+'</div><div class="muted" style="font-size:10px">'+esc(j.date)+' · '+(j.minutes/60).toFixed(2)+' h · '+esc(j.result)+' · '+esc(j.source)+'</div></div>'
  ).join(''):'<div class="empty">Sin trabajos de esta persona en el periodo</div>';

  if(diffBox){
    const max=Math.max(1,...Object.values(st.byDiff));
    const colors=['','#22c55e','#3b82f6','#f59e0b','#ef4444'];
    diffBox.innerHTML=[1,2,3,4].map(n=>{
      const c=st.byDiff[n]||0;
      return '<div class="mt" style="font-size:11px"><div class="flex"><span>'+difficultyLabel(n)+'</span><strong>'+c+'</strong></div><div class="progress"><span style="width:'+(c/max*100)+'%;background:'+colors[n]+'"></span></div></div>';
    }).join('');
  }

  if(charts.personType){try{charts.personType.destroy()}catch(e){}}
  const ctx=document.getElementById('personTypeChart');
  if(ctx){
    const labels=Object.keys(st.byType);
    charts.personType=new Chart(ctx,{
      type:'doughnut',
      data:{labels:labels.length?labels:['Sin datos'],datasets:[{data:labels.length?Object.values(st.byType):[1],backgroundColor:['#3b82f6','#22c55e','#f59e0b','#a855f7','#ef4444','#06b6d4']}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}
    });
  }
}
function TEAM(){return db.meal.employees.filter(e=>e.activo).map(e=>[e.nombre,e.rol||'Técnico',e.especialidad||'General',0,e.estado||'Disponible']);}
function teamSetField(name,field,value){const e=db.meal.employees.find(x=>x.nombre===name);if(!e)return;e[field]=value;save();renderTeam();}
function removePerson(i){
  const name=TEAM()[i][0];
  if(!confirm('¿Eliminar a '+name+' de la plantilla? (Esto también lo quita del rol de comidas)')) return;
  db.meal.employees=db.meal.employees.filter(e=>e.nombre!==name);
  save(); renderTeam(); renderMealEmpleados(); toast('Persona eliminada');
}
function ensurePerson(name){
  const n=String(name||'').trim();
  if(!n) return;
  if(!db.meal.employees.some(e=>e.nombre===n)){
    const id=db.meal.config.nextId||(Math.max(0,...db.meal.employees.map(e=>e.id))+1);
    db.meal.employees.push({id,nombre:n,grupo:'A',turnoNoche:false,enCapacitacion:false,ausencias:'',ultimaFecha:'',vecesAsignado:0,activo:true,rol:'Técnico',especialidad:'General',estado:'Disponible'});
    db.meal.config.nextId=id+1;
  }
}
function savePerson(){
  const n=document.getElementById('per_n').value.trim();
  const r=document.getElementById('per_r').value.trim()||'Técnico';
  const e=document.getElementById('per_e').value.trim()||'General';
  const s=document.getElementById('per_s').value||'Disponible';
  const g=document.getElementById('per_g').value||'A';
  if(!n){toast('Nombre requerido');return;}
  if(db.meal.employees.some(x=>x.nombre===n)){toast('Ya existe esa persona');return;}
  const id=db.meal.config.nextId||(Math.max(0,...db.meal.employees.map(x=>x.id))+1);
  db.meal.employees.push({id,nombre:n,grupo:g,turnoNoche:false,enCapacitacion:false,ausencias:'',ultimaFecha:'',vecesAsignado:0,activo:true,rol:r,especialidad:e,estado:s});
  db.meal.config.nextId=id+1;
  save(); closeModal(); renderTeam(); renderMealEmpleados(); toast(n+' agregado');
}

function destroyCharts(){
  Object.values(charts).forEach(c=>{try{c.destroy()}catch(e){}});
  charts={};
  // También limpia gráficos financieros si se pide un refresh global
  Object.values(finCharts).forEach(c=>{try{c.destroy()}catch(e){}});
  finCharts={};
}
function destroyFinCharts(){
  Object.values(finCharts).forEach(c=>{try{c.destroy()}catch(e){}});
  finCharts={};
}
function safeChartDestroy(bag, key){
  if(bag&&bag[key]){ try{ bag[key].destroy(); }catch(e){} bag[key]=null; }
}

function renderEventRankings(){
  const period=getDashPeriod();
  const ids=MACHINES(), mapEv={}, mapMin={}, mapWaste={};
  ids.forEach(id=>{mapEv[id]=0;mapMin[id]=0;mapWaste[id]=0;});
  eventsInPeriod(null,period,true,dashRefDate).forEach(e=>{
    if(mapEv[e.machine]===undefined)return;
    mapEv[e.machine]++;
    mapMin[e.machine]+=(Number(e.minutes)||0);
  });
  ids.forEach(id=>{mapWaste[id]=Number(productionFromEvents(eventsInPeriod(id,period,false,dashRefDate)).waste)||0;});
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

function preventiveChecklistKey(date){return 'chiaplast-preventive-checklist-v1:'+date;}
function readPreventiveChecklist(date){try{return JSON.parse(localStorage.getItem(preventiveChecklistKey(date))||'{}')||{};}catch(e){return {};}}
function togglePreventiveMachine(machineId,checked){
  const date=document.getElementById('preventiveChecklistDate')?.value||dashRefDate;
  const state=readPreventiveChecklist(date);state[machineId]=!!checked;
  try{localStorage.setItem(preventiveChecklistKey(date),JSON.stringify(state));}catch(e){}
  const label=[...document.querySelectorAll('.preventive-machine-item')].find(el=>el.querySelector('input')?.dataset.machine===machineId);
  if(label)label.classList.toggle('is-done',!!checked);
  renderPreventiveChecklistSummary(date);
}
function renderPreventiveChecklistSummary(date){
  const state=readPreventiveChecklist(date),total=Object.values(state).filter(Boolean).length;
  const summary=document.getElementById('preventiveChecklistSummary');
  if(summary)summary.textContent=total+' equipo(s) marcados como atendidos · '+date;
}
function renderPreventiveChecklist(){
  const dateInput=document.getElementById('preventiveChecklistDate');if(!dateInput)return;
  if(!dateInput.value)dateInput.value=dashRefDate||iso(new Date());
  dateInput.onchange=()=>renderPreventiveChecklist();
  const date=dateInput.value,state=readPreventiveChecklist(date),root=document.getElementById('preventiveAreaChecklist');
  if(!root)return;
  const grouped={};
  (LIVE_MACHINE_DB||MACHINE_DB).forEach(row=>{if(!row||!row.code)return;const area=row.area||'Otras';(grouped[area]||(grouped[area]=[])).push(row.code);});
  root.innerHTML=Object.entries(grouped).map(([area,machines])=>{
    const done=machines.filter(m=>state[m]).length;
    return `<section class="preventive-area-card"><div class="preventive-area-head"><span>${esc(area)}</span><span class="badge ${done===machines.length?'b-ok':'b-warn'}">${done}/${machines.length}</span></div><div class="preventive-machine-list">${machines.map(m=>`<label class="preventive-machine-item ${state[m]?'is-done':''}"><input type="checkbox" data-machine="${escAttr(m)}" ${state[m]?'checked':''} onchange="togglePreventiveMachine(this.dataset.machine,this.checked)"><span>${esc(m)}</span></label>`).join('')}</div></section>`;
  }).join('')||'<div class="empty">No hay máquinas en el área seleccionada.</div>';
  renderPreventiveChecklistSummary(date);
}


function setMachinePeriod(p,btn){
  machinePeriod=p;
  window.dashPeriod=p; // mantiene coherencia con el periodo global del sidebar
  document.querySelectorAll('#dashActivePanel .tab').forEach(x=>x.classList.remove('active'));
  if(btn) btn.classList.add('active');
  syncPeriodControls();
  updateDashPeriodLabel();
  renderMachineDetail();
  // También refresca pestañas que dependen del periodo
  renderWO(); renderEvents(); renderHistory();
}

function renderMachineDetail(){
  const mid=selectedMachine;
  document.getElementById('activeMachineLabel').textContent=mid;
  const periods=['day','week','month'];
  const labels={day:'Día',week:'Semana',month:'Mes'};
  const period=machinePeriod||'day';
  const {start,end}=periodRange(period, dashRefDate);
  const rangeTxt=iso(start)+(period==='day'?'':' → '+iso(end));

  // Filtrar SOLO eventos de esta máquina en el rango del periodo
  const evs=db.events.filter(x=>{
    if(x.machine!==mid) return false;
    const d=eventDate(x);
    return d>=start && d<=end;
  }).sort((a,b)=>String(b.date).localeCompare(String(a.date)));

  const mins=downtimeMinutes(evs);
  const totalMin=periodMinutes(period, dashRefDate);
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
    const rg=periodRange(p, dashRefDate);
    const e=db.events.filter(x=>x.machine===mid && eventDate(x)>=rg.start && eventDate(x)<=rg.end);
    const mi=downtimeMinutes(e);
    const pr=productionFromEvents(e);
    return {p, label:labels[p], stops:e.length, pct:(mi/periodMinutes(p,dashRefDate)*100).toFixed(1), hours:(mi/60).toFixed(1), waste:pr.waste, range:iso(rg.start)+(p==='day'?'':' → '+iso(rg.end))};
  });

  const listHtml=evs.length?evs.slice(0,30).map(x=>`<div class="item"><div class="flex"><strong>${esc(x.type)}</strong>${badge(x.severity)}</div><div style="font-size:12px;margin:4px 0">${esc(x.desc)}</div><div class="muted" style="font-size:10px">${esc(x.date)} • ${x.minutes||0} min${(x.kgTarget||x.kgActual)?` • Kg real ${parseKg(x.kgActual)} / obj ${parseKg(x.kgTarget)}`:''}</div></div>`).join(''):'<div class="empty">Sin eventos de <strong>'+esc(mid)+'</strong> en '+esc(rangeTxt)+'</div>';
  const compHtml='<div class="muted mt" style="font-size:11px">Comparativa (fecha ref. '+esc(dashRefDate)+'):<br>'+comp.map(c=>`<strong>${c.label}</strong> [${esc(c.range)}]: ${c.stops} eventos, ${c.pct}% parado, ${c.hours}h, desperdicio ${c.waste.toLocaleString('es-MX')} kg`).join('<br>')+'</div>';
  document.getElementById('machinePeriodEvents').innerHTML=listHtml+compHtml;

  if(charts.machinePie){try{charts.machinePie.destroy()}catch(e){}}
  if(charts.machineCause){try{charts.machineCause.destroy()}catch(e){}}
  if(charts.machineDay){try{charts.machineDay.destroy()}catch(e){}}
  const pieCtx=document.getElementById('machineDowntimePie');
  if(pieCtx){
    charts.machinePie=new Chart(pieCtx,{type:'doughnut',data:{labels:['Parado %','Operativo %'],datasets:[{data:[+pctOff.toFixed(2),+pctOn.toFixed(2)],backgroundColor:['#ef4444','#22c55e']}]},options:{responsive:true,maintainAspectRatio:false}});
  }
  const types={};evs.forEach(x=>types[x.type]=(types[x.type]||0)+(Number(x.minutes)||0)/60);
  const causeCtx=document.getElementById('machineCauseChart');
  if(causeCtx){
    charts.machineCause=new Chart(causeCtx,{type:'bar',data:{labels:Object.keys(types).length?Object.keys(types):['Sin datos'],datasets:[{label:'Horas',data:Object.keys(types).length?Object.values(types):[0],backgroundColor:'#f59e0b'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
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
    charts.machineDay=new Chart(dayCtx,{type:'bar',data:{labels:days.length?days:['—'],datasets:[{label:'Horas paradas',data:days.length?days.map(d=>+(byDay[d]||0).toFixed(2)):[0],backgroundColor:'#ef4444'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
  }
}

function renderCharts(){
  destroyCharts();
  updateDashPeriodLabel();
  syncPeriodControls();
  const period=getDashPeriod();
  const areaEvents=eventsInPeriod(null,period,true,dashRefDate);
  const scopeIds=new Set(MACHINES());

  // Paros por causa: solo el periodo seleccionado.
  const types={};areaEvents.forEach(x=>types[x.type]=(types[x.type]||0)+(Number(x.minutes)||0)/60);
  const causeCtx=document.getElementById('downtimeChart');
  if(causeCtx){
    charts.downtime=new Chart(causeCtx,{type:'doughnut',data:{labels:Object.keys(types).length?Object.keys(types):['Sin paros'],datasets:[{data:Object.keys(types).length?Object.values(types):[1]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10}}}}}});
  }

  // Producción útil real frente al objetivo.
  const prod=productionFromEvents(areaEvents);
  const prodCtx=document.getElementById('productionCompareChart');
  if(prodCtx){
    charts.productionCompareChart=new Chart(prodCtx,{type:'bar',data:{labels:['Kg'],datasets:[
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
  if(alertEl)alertEl.innerHTML=db.predictive.filter(x=>scopeIds.has(x[1])&&(!selectedMachine||x[1]===selectedMachine)&&x[6]!=='Normal').map(x=>`<div class="alert"><strong>${esc(x[1])} • ${esc(x[2])}</strong><br>${esc(x[3])} ${esc(x[4])} • ${esc(x[6])}</div>`).join('')||'<div class="success">No hay alertas predictivas fuera de normal.</div>';
  renderEventRankings();
  renderPreventiveChecklist();
}

function fillAreaSelectUI(){
  const sel=document.getElementById('areaSelect');
  if(!sel) return;
  const cur=isAllAreas()?'__ALL__':currentArea;
  sel.innerHTML='<option value="__ALL__">★ Toda la planta</option>'+
    AREA_ORDER.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
  sel.value=cur;
}
function onAreaSelectChange(){
  const e=document.getElementById('areaSelect');
  currentArea=e && e.value==='__ALL__'?'__ALL__':(e?.value||currentArea);
  selectedMachine='';
  fillReportMachineSelect();
  fillFinMachineSelect();
  render();
}
document.getElementById('areaSelect')?.addEventListener('change',onAreaSelectChange);
document.getElementById('machineSelect')?.addEventListener('change',e=>{
  selectedMachine=e.target.value||'';
  const finSel=document.getElementById('finMachine');
  if(finSel && selectedMachine && [...finSel.options].some(o=>o.value===selectedMachine)) finSel.value=selectedMachine;
  render();
});
function navigateToView(viewId){
  const config=VIEW_CONFIG[viewId];
  const view=document.getElementById(viewId);
  const button=[...document.querySelectorAll('.nav button[data-view]')].find(item=>item.dataset.view===viewId);
  if(!config||!view||!button){
    console.error(`No se encontró la pantalla "${viewId}"`);
    toast('La pantalla solicitada no está disponible','err');
    return false;
  }

  currentView=viewId;
  document.querySelectorAll('.nav button[data-view]').forEach(item=>item.classList.toggle('active',item===button));
  document.querySelectorAll('.view').forEach(section=>section.classList.toggle('active',section===view));
  const group=button.closest('.nav-group');
  if(group){
    group.classList.add('open');
    const indicator=group.querySelector('.nav-group-toggle span');
    if(indicator) indicator.textContent='▾';
  }
  saveUiState();
  closeMobileMenu();
  render();
  return true;
}
document.querySelectorAll('.nav button[data-view]').forEach(button=>{
  button.addEventListener('click',()=>navigateToView(button.dataset.view));
});

function bindModalEnter(){
  const box=document.querySelector('#modal .modal-box');
  if(!box) return;
  box.onkeydown=function(e){
    if(e.key!=='Enter') return;
    if((e.target.tagName||'').toLowerCase()==='textarea') return;
    e.preventDefault();
    const btn=box.querySelector('.btn.primary');
    if(btn) btn.click();
  };
}
function openModal(type){
 const modal=document.getElementById('modal'), body=document.getElementById('modalBody'); modal.classList.add('open');
 if(type==='workOrder'){document.getElementById('modalTitle').textContent='Nueva orden de trabajo';body.innerHTML=`<div class="formgrid">
 <div class="field"><label>Fecha</label><input id="f_d" type="date" value="${dashRefDate}"></div>
 <div class="field"><label>Máquina</label><select id="f_m">${MACHINES().map(x=>`<option>${x}</option>`).join('')}</select></div>
 <div class="field"><label>Prioridad</label><select id="f_p"><option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option></select></div>
 <div class="field"><label>Técnico</label><select id="f_t">${TEAM().map(x=>`<option>${x[0]}</option>`).join('')}</select></div>
 <div class="field"><label>Horas de paro</label><input id="f_h" type="number" step=".1" value="0"></div>
 <div class="field full"><label>Falla / trabajo solicitado</label><textarea id="f_f" placeholder="Ej. pérdida de señal de fotocelda, cuchilla no corta, alarma VFD..."></textarea></div>
 </div><div class="actions mt"><button class="btn primary" onclick="saveWO()">Crear OT</button></div>`; bindModalEnter();}
 if(type==='event'){document.getElementById('modalTitle').textContent='Registrar falla / evento';body.innerHTML=`<div class="formgrid">
 <div class="field"><label>Fecha</label><input id="e_date" type="date" value="${dashRefDate}"></div>
 <div class="field"><label>Máquina</label><select id="e_m">${MACHINES().map(x=>`<option>${x}</option>`).join('')}</select></div>
 <div class="field"><label>Tipo</label><select id="e_t"><option>Falla</option><option>Apagón</option><option>E-stop</option><option>Alarma VFD</option><option>Sensor</option><option>Neumática</option><option>Sobretemperatura</option></select></div>
 <div class="field"><label>Severidad</label><select id="e_s"><option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option></select></div>
 <div class="field"><label>Minutos de paro</label><input id="e_min" type="number" value="0"></div>
 <div class="field full"><label>Descripción</label><textarea id="e_d"></textarea></div>
 </div><div class="actions mt"><button class="btn primary" onclick="saveEvent()">Guardar evento</button></div>`}
 if(type==='pm'){document.getElementById('modalTitle').textContent='Nuevo plan preventivo';body.innerHTML=`<div class="formgrid">
 <div class="field"><label>Máquina</label><select id="p_m">${MACHINES().map(x=>`<option>${x}</option>`).join('')}</select></div>
 <div class="field"><label>Frecuencia</label><select id="p_fr"><option>Diaria</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option><option>Trimestral</option></select></div>
 <div class="field"><label>Prioridad</label><select id="p_pr"><option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option></select></div>
 <div class="field full"><label>Activo / actividad</label><input id="p_a" placeholder="Ej. revisión de termopar y resistencia de sellado"></div>
 </div><div class="actions mt"><button class="btn primary" onclick="savePm()">Guardar plan</button></div>`}
 if(type==='part'){document.getElementById('modalTitle').textContent='Nueva refacción';body.innerHTML=`<div class="formgrid">
 <div class="field"><label>Refacción</label><input id="r_n"></div><div class="field"><label>Categoría</label><input id="r_c"></div>
 <div class="field"><label>Stock</label><input id="r_s" type="number" value="0"></div><div class="field"><label>Mínimo</label><input id="r_m" type="number" value="1"></div>
 <div class="field full"><label>Máquina / equipo</label><input id="r_e" value="BSL-1–BSL-5"></div></div>
 <div class="actions mt"><button class="btn primary" onclick="savePart()">Guardar refacción</button></div>`}
 if(type==='person'){document.getElementById('modalTitle').textContent='Agregar persona a la plantilla';body.innerHTML=`<div class="formgrid">
 <div class="field"><label>Nombre</label><input id="per_n" placeholder="Nombre completo"></div>
 <div class="field"><label>Rol</label><input id="per_r" placeholder="Técnico / Jefe / Supervisor" value="Técnico"></div>
 <div class="field"><label>Habilidades</label><input id="per_e" placeholder="Eléctrico, Mecánico..."></div>
 <div class="field"><label>Estado</label><select id="per_s"><option>Disponible</option><option>En OT</option><option>Descanso</option><option>Inactivo</option></select></div>
 <div class="field"><label>Grupo (rol de comidas)</label><select id="per_g"><option value="A">A</option><option value="B">B</option></select></div>
 </div><div class="actions mt"><button class="btn primary" onclick="savePerson()">Guardar persona</button></div>`}
 bindModalEnter();
}
function closeModal(){document.getElementById('modal').classList.remove('open')}
function saveWO(){
  const machine=document.getElementById('f_m')?.value;
  const fault=(document.getElementById('f_f')?.value||'').trim();
  const tech=document.getElementById('f_t')?.value;
  if(!machine || !fault || !tech){ toast('Completa máquina, falla y técnico','err'); return; }
  const id='OT-'+String(Date.now()).slice(-6);
  const d=iso(document.getElementById('f_d')?.value||new Date());
  const priority=document.getElementById('f_p')?.value||'Media';
  const downtime=Number(document.getElementById('f_h')?.value)||0;
  db.workOrders.unshift({id,date:d,machine,fault,priority,status:'Abierta',downtime,technician:tech});
  db.history.unshift([d,'Correctivo',machine,fault,tech,'Abierta']);
  ensurePerson(tech);save();closeModal();render();toast(id+' creada');
  flashLastTableRow('woTable'); flashLastTableRow('historyTable');
}
function saveEvent(){
  const machine=document.getElementById('e_m')?.value;
  const desc=(document.getElementById('e_d')?.value||'').trim();
  if(!machine || !desc){ toast('Completa máquina y descripción','err'); return; }
  const d=iso(document.getElementById('e_date')?.value||new Date());
  const type=document.getElementById('e_t')?.value||'Falla';
  const severity=document.getElementById('e_s')?.value||'Media';
  const minutes=Number(document.getElementById('e_min')?.value)||0;
  const clas=camposClasificacion(desc);
  db.events.unshift({date:d,machine,type,severity:severity,desc,minutes,kgTarget:0,kgActual:0,...clas});
  db.history.unshift([d,'Evento',machine,desc,'Usuario','Registrado']);
  save();closeModal();render();
  toast('Evento registrado'+(clas.clasificacion!=='No clasificada'?' · '+clas.clasificacion+' ('+clas.confianza+'%)':''));
  flashLastTableRow('historyTable');
}
function savePm(){
  const machine=document.getElementById('p_m')?.value;
  const activity=(document.getElementById('p_a')?.value||'').trim();
  if(!machine || !activity){ toast('Completa máquina y actividad','err'); return; }
  const f=document.getElementById('p_fr')?.value||'Mensual';
  const pr=document.getElementById('p_pr')?.value||'Media';
  const d=new Date();
  d.setDate(d.getDate()+({'Diaria':1,'Semanal':7,'Quincenal':15,'Mensual':30,'Trimestral':90}[f]||30));
  db.pm.push([machine,activity,f,iso(new Date()),iso(d),pr]);
  save();closeModal();render();toast('Plan preventivo agregado');
  flashLastTableRow('pmTable');
}
function savePart(){
  const name=(document.getElementById('r_n')?.value||'').trim();
  if(!name){ toast('Escribe el nombre de la refacción','err'); return; }
  const cat=(document.getElementById('r_c')?.value||'').trim()||'General';
  const stock=Number(document.getElementById('r_s')?.value)||0;
  const min=Number(document.getElementById('r_m')?.value)||1;
  const equip=(document.getElementById('r_e')?.value||'').trim()||'—';
  db.parts.push([name,cat,stock,min,equip]);
  save();closeModal();render();toast('Refacción agregada');
  flashLastTableRow('partsTable');
}
function exportData(){const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='SL_CMMS_backup.json';a.click();URL.revokeObjectURL(a.href);toast('JSON exportado')}
function importData(e){const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);save();render();toast('Datos importados')}catch(err){toast('Archivo inválido','err')}};r.readAsText(file)}
// ================= ROL DE COMIDAS (rotación de tienda) =================
const MEAL_DIAS=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const MEAL_ABBR=['LUN','MAR','MIE','JUE','VIE','SAB','DOM'];
function mPad(n){return n<10?'0'+n:''+n}
function mParseISO(s){const p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2])}
function mAddDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n)}
function mNumDia(d){const g=d.getDay();return g===0?7:g}
function mProximoLunes(){const hoy=new Date();const n=mNumDia(hoy);const diff=n===1?0:(8-n);return mAddDays(new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate()),diff)}
function mToDisplay(s){if(!s)return'—';const p=s.split('-');return p[2]+'/'+p[1]+'/'+p[0]}

function showMealTab(name,btn){
 document.querySelectorAll('#mealTabs .tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
 ['generar','empleados','historial'].forEach(v=>{document.getElementById('meal-'+v).style.display=v===name?'block':'none'});
 if(name==='historial')renderMealHistorial();
 if(name==='empleados')renderMealEmpleados();
 if(name==='generar')renderMealBoard();
}
function mDisponible(e,nDia,abbr,numSemana){
 if(e.turnoNoche)return false;
 if(e.ausencias&&e.ausencias.toUpperCase().indexOf(abbr)!==-1)return false;
 if(e.enCapacitacion)return nDia!==7;
 if(numSemana===1){if(e.grupo==='A'&&nDia===6)return false;if(e.grupo==='B'&&nDia===7)return false;}
 else{if(e.grupo==='A'&&nDia===7)return false;if(e.grupo==='B'&&nDia===6)return false;}
 return true;
}
function mElegir(pool){
 if(pool.length===0)return null;
 const key=e=>e.ultimaFecha||'2000-01-01';
 let minFecha=pool.reduce((m,e)=>key(e)<m?key(e):m,key(pool[0]));
 let emp1=pool.filter(e=>key(e)===minFecha);
 let minVeces=Math.min(...emp1.map(e=>e.vecesAsignado||0));
 let emp2=emp1.filter(e=>(e.vecesAsignado||0)===minVeces);
 return emp2[Math.floor(Math.random()*emp2.length)];
}
function generarSemanaComidas(){
 const lunesStr=document.getElementById('m_lunes').value;
 if(!lunesStr){toast('Elige la fecha del lunes');return;}
 const numSemana=Number(document.getElementById('m_semana').value);
 const lunes=mParseISO(lunesStr);
 const activos=db.meal.employees.filter(e=>e.activo);
 const usados=new Set(); // una sola bolsa para AM y PM: nadie repite en la semana salvo que no quede opción
 let relajado=false;
 const semana=[];
 for(let i=0;i<7;i++){
  const fecha=mAddDays(lunes,i);const nDia=i+1;const abbr=MEAL_ABBR[i];
  const disp=activos.filter(e=>mDisponible(e,nDia,abbr,numSemana));

  const poolM=disp.filter(e=>!usados.has(e.id));
  let eM=mElegir(poolM);
  if(!eM){eM=mElegir(disp);if(eM)relajado=true;}
  if(eM){usados.add(eM.id);eM.vecesAsignado=(eM.vecesAsignado||0)+1;eM.ultimaFecha=iso(fecha);}

  const poolT=disp.filter(e=>!usados.has(e.id)&&(!eM||e.id!==eM.id));
  let eT=mElegir(poolT);
  if(!eT){eT=mElegir(disp.filter(e=>!eM||e.id!==eM.id));if(eT)relajado=true;}
  if(eT){usados.add(eT.id);eT.vecesAsignado=(eT.vecesAsignado||0)+1;eT.ultimaFecha=iso(fecha);}

  semana.push({dia:MEAL_DIAS[i],fecha:iso(fecha),manana:eM?eM.nombre:'SIN DISPONIBLE',tarde:eT?eT.nombre:'SIN DISPONIBLE'});
 }
 db.meal.semanaActual=semana;save();renderMealBoard();renderMealEmpleados();
 toast(relajado?'Semana generada (hubo que repetir a alguien: no alcanzó personal disponible)':'Semana generada, nadie se repite');
}
function renderMealBoard(){
 const card=document.getElementById('mealBoardCard');const board=document.getElementById('mealBoard');
 if(!db.meal.semanaActual||!db.meal.semanaActual.length){card.style.display='none';return}
 card.style.display='block';
 board.innerHTML=db.meal.semanaActual.map(d=>`<div class="machine-tile"><strong>${esc(d.dia)}</strong><small>${mToDisplay(d.fecha)}</small>
  <div class="mt" style="font-size:12px"><span class="muted">AM:</span> ${esc(d.manana)}</div>
  <div style="font-size:12px"><span class="muted">PM:</span> ${esc(d.tarde)}</div></div>`).join('');
}
function archivarSemanaComidas(){
 if(!db.meal.semanaActual||!db.meal.semanaActual.length){toast('No hay semana generada');return}
 db.meal.semanaActual.forEach(d=>{
  if(d.manana!=='SIN DISPONIBLE')db.meal.historial.push({fecha:d.fecha,dia:d.dia,turno:'Mañana',empleado:d.manana});
  if(d.tarde!=='SIN DISPONIBLE')db.meal.historial.push({fecha:d.fecha,dia:d.dia,turno:'Tarde',empleado:d.tarde});
 });
 db.meal.semanaActual=[];save();renderMealBoard();renderMealHistorial();toast('Semana guardada en historial');
}
function limpiarSemanalComidas(){
 if(!confirm('¿Poner en No el turno de noche y vaciar las ausencias de todos?'))return;
 db.meal.employees.forEach(e=>{e.turnoNoche=false;e.ausencias='';});save();renderMealEmpleados();toast('Datos semanales limpiados');
}
function agregarEmpleadoComida(){
 const nombre=document.getElementById('m_nombre').value.trim();
 if(!nombre){toast('Escribe un nombre');return}
 const grupo=document.getElementById('m_grupo').value;
 const id=db.meal.config.nextId||(Math.max(0,...db.meal.employees.map(e=>e.id))+1);
 db.meal.employees.push({id,nombre,grupo,turnoNoche:false,enCapacitacion:false,ausencias:'',ultimaFecha:'',vecesAsignado:0,activo:true});
 db.meal.config.nextId=id+1;document.getElementById('m_nombre').value='';
 save();renderMealEmpleados();toast('Empleado agregado');
}
function renderMealEmpleados(){
 const activos=db.meal.employees.filter(e=>e.activo);
 const noche=activos.filter(e=>e.turnoNoche).length,cap=activos.filter(e=>e.enCapacitacion).length;
 const st=document.getElementById('mealStats');
 if(st)st.innerHTML=`<div class="card kpi"><div class="label">Activos</div><div class="value">${activos.length}</div></div>
  <div class="card kpi"><div class="label">Turno noche</div><div class="value">${noche}</div></div>
  <div class="card kpi"><div class="label">En capacitación</div><div class="value">${cap}</div></div>
  <div class="card kpi"><div class="label">Registros historial</div><div class="value">${db.meal.historial.length}</div></div>`;
 document.getElementById('mealEmpTable').innerHTML=db.meal.employees.map(e=>`<tr>
  <td><input value="${esc(e.nombre)}" onchange="mealSetField(${e.id},'nombre',this.value)"></td>
  <td><select onchange="mealSetField(${e.id},'grupo',this.value)"><option ${e.grupo==='A'?'selected':''}>A</option><option ${e.grupo==='B'?'selected':''}>B</option></select></td>
  <td style="text-align:center"><input type="checkbox" ${e.turnoNoche?'checked':''} onchange="mealSetField(${e.id},'turnoNoche',this.checked)"></td>
  <td style="text-align:center"><input type="checkbox" ${e.enCapacitacion?'checked':''} onchange="mealSetField(${e.id},'enCapacitacion',this.checked)"></td>
  <td><input value="${esc(e.ausencias)}" placeholder="SAB,DOM" onchange="mealSetField(${e.id},'ausencias',this.value)"></td>
  <td><input type="date" value="${e.ultimaFecha||''}" onchange="mealSetField(${e.id},'ultimaFecha',this.value)"></td>
  <td><input type="number" value="${e.vecesAsignado||0}" style="width:60px" onchange="mealSetField(${e.id},'vecesAsignado',Number(this.value)||0)"></td>
  <td style="text-align:center"><input type="checkbox" ${e.activo?'checked':''} onchange="mealSetField(${e.id},'activo',this.checked)"></td>
  <td><button class="btn red" onclick="mealEliminarEmpleado(${e.id})">✕</button></td>
 </tr>`).join('')||'<tr><td colspan="9" class="empty">Sin empleados</td></tr>';
}
function mealSetField(id,field,value){const e=db.meal.employees.find(x=>x.id===id);if(!e)return;e[field]=value;save();if(field==='turnoNoche'||field==='enCapacitacion'||field==='activo')renderMealEmpleados();}
function mealEliminarEmpleado(id){const e=db.meal.employees.find(x=>x.id===id);if(!e)return;if(!confirm(`¿Eliminar a ${e.nombre} de la lista? Su historial ya guardado no se borra.`))return;db.meal.employees=db.meal.employees.filter(x=>x.id!==id);save();renderMealEmpleados();}
function agregarHistorialComida(){
 const fecha=document.getElementById('mh_fecha').value,turno=document.getElementById('mh_turno').value,nombre=document.getElementById('mh_nombre').value.trim();
 if(!fecha||!nombre){toast('Completa fecha y nombre');return}
 const d=mParseISO(fecha);
 db.meal.historial.push({fecha,dia:MEAL_DIAS[mNumDia(d)-1],turno,empleado:nombre});
 document.getElementById('mh_nombre').value='';save();renderMealHistorial();renderMealEmpleados();toast('Agregado al historial');
}
function recalcularComidas(){
 if(!confirm('Esto recalcula "última fecha" y "veces asignado" de todos usando el historial. ¿Continuar?'))return;
 db.meal.employees.forEach(e=>{
  const nombre=e.nombre.trim().toUpperCase();
  const regs=db.meal.historial.filter(r=>(r.empleado||'').trim().toUpperCase()===nombre);
  if(regs.length>0){e.vecesAsignado=regs.length;e.ultimaFecha=regs.reduce((max,r)=>r.fecha>max?r.fecha:max,regs[0].fecha);}
  else e.vecesAsignado=0;
 });
 save();renderMealEmpleados();renderMealHistorial();toast('Recalculado desde el historial');
}
function mealEliminarHistorial(idx){if(!confirm('¿Eliminar este registro del historial?'))return;db.meal.historial.splice(idx,1);save();renderMealHistorial();renderMealEmpleados();}
function renderMealHistorial(){
 const filas=db.meal.historial.map((r,i)=>({...r,_idx:i})).sort((a,b)=>(b.fecha+b.turno).localeCompare(a.fecha+a.turno));
 document.getElementById('mealHistTable').innerHTML=filas.map(r=>`<tr><td>${mToDisplay(r.fecha)}</td><td>${esc(r.dia)}</td><td>${esc(r.turno)}</td><td>${esc(r.empleado)}</td><td><button class="btn red" onclick="mealEliminarHistorial(${r._idx})">✕</button></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Todavía no hay registros</td></tr>';
 const conteo=db.meal.employees.map(e=>{const n=e.nombre.trim().toUpperCase();const veces=db.meal.historial.filter(r=>(r.empleado||'').trim().toUpperCase()===n).length;return{nombre:e.nombre,veces}}).sort((a,b)=>b.veces-a.veces);
 document.getElementById('mealResumenTable').innerHTML=conteo.map(c=>`<tr><td>${esc(c.nombre)}</td><td>${c.veces}</td></tr>`).join('');
 const dl=document.getElementById('mealNombres');if(dl)dl.innerHTML=db.meal.employees.map(e=>`<option value="${esc(e.nombre)}">`).join('');
}
// ================= INFORME PDF =================
function fillReportMachineSelect(){
  const sel=document.getElementById('reportMachine');
  if(!sel)return;
  const cur=sel.value;
  sel.innerHTML='<option value="">Todas ('+currentArea+')</option>'+MACHINES().map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join('');
  if([...sel.options].some(o=>o.value===cur))sel.value=cur;
}
function tempCanvas(w,h){
  const c=document.createElement('canvas');c.width=w;c.height=h;c.style.position='fixed';c.style.left='-9999px';
  document.body.appendChild(c);return c;
}
async function descargarInforme(){
  const status=document.getElementById('reportStatus');
  if(!status){ toast('No se encontró el panel de informes'); return; }
  if(typeof window.jspdf === 'undefined' || !window.jspdf?.jsPDF){
    status.textContent='Error: La librería PDF no está cargada. Verifica tu conexión a internet e intenta de nuevo.';
    toast('No se pudo cargar jsPDF');
    return;
  }
  status.textContent='Generando informe…';
  try{
  const machine=document.getElementById('reportMachine')?.value||'';
  const chk=id=>!!document.getElementById(id)?.checked;
  const incDash=chk('reportIncDash');
  const incMach=chk('reportIncMach');
  const incTeam=chk('reportIncTeam');
  const incMeal=chk('reportIncMeal');
  const incPm=chk('reportIncPm');
  const incEvents=chk('reportIncEvents');
  const incParts=chk('reportIncParts');
  const period=getDashPeriod(), ref=dashRefDate;
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'pt',format:'a4'});
  const W=doc.internal.pageSize.getWidth();
  let y=50;
  const ensureSpace=(need)=>{ if(y+need>780){ doc.addPage(); y=50; } };
  const areaTxt=isAllAreas()?'Toda la planta':currentArea;
  doc.setFontSize(16);doc.text('Informe de mantenimiento — '+(machine||('Área '+areaTxt)),40,y);
  doc.setFontSize(10);y+=16;doc.text('Fecha de referencia: '+ref+' · Periodo: '+period,40,y);
  y+=24;

  if(incDash){
    ensureSpace(80);
    const evs=eventsInPeriod(machine||null, period, !machine, ref);
    const mins=downtimeMinutes(evs);
    const ms=machineFilter();
    const totalMin=periodMinutes(period, ref);
    const avgAvail=ms.length?(ms.reduce((a,m)=>{
      const mm=downtimeMinutes(eventsInPeriod(m.id,period,false,ref));
      return a+Math.max(0,100-(mm/totalMin*100));
    },0)/ms.length):100;
    doc.setFontSize(13);doc.text('Dashboard — KPIs',40,y);y+=16;
    doc.setFontSize(10);
    doc.text('Disponibilidad promedio: '+avgAvail.toFixed(1)+'%',40,y);y+=14;
    doc.text('Eventos en periodo: '+evs.length+' · Horas paro: '+(mins/60).toFixed(1)+' h · Máquinas en alcance: '+ms.length,40,y);y+=18;
  }

  if(incMach){
    ensureSpace(120);
    const evs=eventsInPeriod(machine||null, period, !machine, ref);
    const mins=downtimeMinutes(evs);
    const byDay={};evs.forEach(x=>{const d=iso(eventDate(x));byDay[d]=(byDay[d]||0)+(Number(x.minutes)||0)/60;});
    const days=Object.keys(byDay).sort();
    const freq={};evs.forEach(x=>{const k=x.desc||x.type;freq[k]=(freq[k]||0)+1;});
    const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const cv=tempCanvas(900,420);
    const ch=new Chart(cv,{type:'bar',data:{labels:days.length?days:['Sin datos'],datasets:[{label:'Horas paradas',data:days.length?days.map(d=>+byDay[d].toFixed(2)):[0],backgroundColor:'#ef4444'}]},options:{responsive:false,animation:false,scales:{y:{beginAtZero:true}}}});
    await new Promise(r=>setTimeout(r,80));
    ensureSpace(280);
    doc.setFontSize(13);doc.text('Desempeño de máquinas',40,y);y+=8;
    const img=ch.toBase64Image();doc.addImage(img,'PNG',40,y,W-80,(W-80)*420/900);
    y+=(W-80)*420/900+16;
    doc.setFontSize(10);
    doc.text('Eventos: '+evs.length+' · Horas paradas: '+(mins/60).toFixed(1)+' h',40,y);y+=14;
    doc.text('Incidencias más recurrentes:',40,y);y+=14;
    top.forEach(([k,n])=>{ensureSpace(14);doc.text('• '+String(k).slice(0,70)+' ('+n+'x)',48,y);y+=13;});
    ch.destroy();cv.remove();
    y+=8;
  }

  if(incTeam){
    ensureSpace(120);
    const ranking=TEAM().map(r=>{const jobs=collectPersonJobs(r[0],period,ref);const st=personStats(jobs);return Object.assign({name:r[0]},st);}).sort((a,b)=>b.hours-a.hours);
    const cv=tempCanvas(900,Math.max(300,ranking.length*32||300));
    const ch=new Chart(cv,{type:'bar',data:{labels:ranking.length?ranking.map(p=>p.name):['Sin personal'],datasets:[{label:'Horas',data:ranking.length?ranking.map(p=>+p.hours.toFixed(2)):[0],backgroundColor:'#3b82f6'}]},options:{indexAxis:'y',responsive:false,animation:false,scales:{x:{beginAtZero:true}}}});
    await new Promise(r=>setTimeout(r,80));
    ensureSpace(260);
    doc.setFontSize(13);doc.text('Desempeño de personal',40,y);y+=8;
    const imgH=Math.min(420,(W-80)*cv.height/cv.width);
    const img=ch.toBase64Image();doc.addImage(img,'PNG',40,y,W-80,imgH);
    y+=imgH+14;
    doc.setFontSize(10);
    ranking.forEach(p=>{ensureSpace(14);doc.text(p.name+': '+p.count+' trabajos · '+p.hours.toFixed(1)+' h',40,y);y+=13;});
    ch.destroy();cv.remove();
    y+=8;
  }

  if(incMeal){
    ensureSpace(80);
    doc.setFontSize(13);doc.text('Rol de comidas',40,y);y+=16;
    doc.setFontSize(10);
    const semana=(db.meal.semanaActual&&db.meal.semanaActual.length)?db.meal.semanaActual:null;
    if(semana){
      semana.forEach(d=>{ensureSpace(14);doc.text(d.dia+' ('+mToDisplay(d.fecha)+')  AM: '+d.manana+'  PM: '+d.tarde,40,y);y+=14;});
    }else{
      const ultimos=(db.meal.historial||[]).slice(-14);
      if(!ultimos.length){doc.text('Sin registros de rol de comidas.',40,y);y+=14;}
      else ultimos.forEach(r=>{ensureSpace(14);doc.text(mToDisplay(r.fecha)+' ('+r.dia+') · '+r.turno+' · '+r.empleado,40,y);y+=14;});
    }
    y+=8;
  }

  if(incPm){
    ensureSpace(80);
    doc.setFontSize(13);doc.text('Plantilla / planes preventivos',40,y);y+=16;
    doc.setFontSize(10);
    const pms=(db.pm||[]).filter(p=>!machine||p[0]===machine).slice(0,25);
    if(!pms.length){doc.text('Sin planes preventivos en el alcance.',40,y);y+=14;}
    else pms.forEach(p=>{ensureSpace(14);doc.text((p[0]||'')+' · '+(p[1]||'')+' · '+(p[2]||'')+' · prox: '+(p[4]||''),40,y);y+=13;});
    y+=8;
  }

  if(incEvents){
    ensureSpace(120);
    const evs=eventsInPeriod(machine||null, period, !machine, ref);
    const byComp={};
    evs.forEach(e=>{
      const c=e.componente&&e.componente!=='No especificado'?e.componente:(e.clasificacion||e.type||'Otro');
      byComp[c]=(byComp[c]||0)+1;
    });
    const labels=Object.keys(byComp).sort((a,b)=>byComp[b]-byComp[a]).slice(0,10);
    const cv=tempCanvas(900,360);
    const ch=new Chart(cv,{type:'bar',data:{labels:labels.length?labels:['Sin datos'],datasets:[{data:labels.length?labels.map(l=>byComp[l]):[0],backgroundColor:'#a855f7'}]},options:{responsive:false,animation:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
    await new Promise(r=>setTimeout(r,80));
    ensureSpace(260);
    doc.setFontSize(13);doc.text('Fallas y eventos (componentes)',40,y);y+=8;
    const img=ch.toBase64Image();doc.addImage(img,'PNG',40,y,W-80,(W-80)*360/900);
    y+=(W-80)*360/900+14;
    doc.setFontSize(10);doc.text('Total eventos en alcance: '+evs.length,40,y);y+=16;
    ch.destroy();cv.remove();
  }

  if(incParts){
    ensureSpace(120);
    const top=recomendarRefacciones();
    const cv=tempCanvas(900,320);
    const ch=new Chart(cv,{type:'bar',data:{labels:top.length?top.map(t=>t.comp):['Sin datos'],datasets:[{label:'Frecuencia',data:top.length?top.map(t=>t.freq):[0],backgroundColor:'#f59e0b'}]},options:{responsive:false,animation:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
    await new Promise(r=>setTimeout(r,80));
    ensureSpace(240);
    doc.setFontSize(13);doc.text('Ranking componentes / refacciones',40,y);y+=8;
    const img=ch.toBase64Image();doc.addImage(img,'PNG',40,y,W-80,(W-80)*320/900);
    y+=(W-80)*320/900+14;
    doc.setFontSize(10);
    top.forEach(t=>{ensureSpace(14);doc.text(t.comp+': '+t.freq+'x · prioridad '+t.prioridad,40,y);y+=13;});
    ch.destroy();cv.remove();
  }

  doc.save('informe_mantenimiento_'+ref+'.pdf');
  status.textContent='Informe descargado.';
  toast('PDF generado');
  }catch(err){
    console.error(err);
    status.textContent='Error al generar el informe: '+(err?.message||'desconocido');
    toast('Error al generar PDF','err');
  }
}

// ================= NEGLIGENCIA DE COMPRAS =================
function fillNegligenciaMachineSelect(){
  const sel=document.getElementById('ng_m');
  if(!sel)return;
  sel.innerHTML=db.machines.map(m=>`<option value="${esc(m.id)}">${esc(m.id)}</option>`).join('');
}
function agregarNegligencia(){
  const fecha=document.getElementById('ng_fecha')?.value||iso(new Date());
  const machine=document.getElementById('ng_m')?.value;
  const pieza=(document.getElementById('ng_pieza')?.value||'').trim();
  const jefe=(document.getElementById('ng_jefe')?.value||'').trim();
  const horas=Number(document.getElementById('ng_horas')?.value)||0;
  const just=(document.getElementById('ng_just')?.value||'').trim();
  if(!machine){toast('Selecciona una máquina');return;}
  if(!pieza||!jefe){toast('Escribe la pieza y el responsable');return;}
  if(horas<=0){toast('Indica las horas paradas (mayor a 0)');return;}
  db.negligencia.push({fecha,machine,pieza,jefe,horas,just});
  db.history.unshift([fecha,'Gestión financiera integrada',machine,pieza+' — '+just,jefe,horas+' h perdidas']);
  const elP=document.getElementById('ng_pieza'); if(elP) elP.value='';
  const elJ=document.getElementById('ng_jefe'); if(elJ) elJ.value='';
  const elH=document.getElementById('ng_horas'); if(elH) elH.value=0;
  const elJust=document.getElementById('ng_just'); if(elJust) elJust.value='';
  save();renderNegligencia();toast('Registro guardado');
}
function negligenciaEliminar(i){if(!confirm('¿Eliminar este registro?'))return;db.negligencia.splice(i,1);save();renderNegligencia();}
function renderNegligencia(){
  fillNegligenciaMachineSelect();
  document.getElementById('negligenciaTable').innerHTML=db.negligencia.map((r,i)=>`<tr><td>${esc(r.fecha)}</td><td>${esc(r.machine)}</td><td>${esc(r.pieza)}</td><td>${esc(r.jefe)}</td><td>${r.horas}</td><td style="max-width:260px">${esc(r.just)}</td><td><button class="btn red" onclick="negligenciaEliminar(${i})">✕</button></td></tr>`).join('')||'<tr><td colspan="7" class="empty">Sin registros</td></tr>';
  const porJefe={},porMaquina={};
  db.negligencia.forEach(r=>{porJefe[r.jefe]=(porJefe[r.jefe]||0)+r.horas;porMaquina[r.machine]=(porMaquina[r.machine]||0)+r.horas;});
  if(charts.ngJefe){try{charts.ngJefe.destroy()}catch(e){}}
  if(charts.ngMaquina){try{charts.ngMaquina.destroy()}catch(e){}}
  const j=Object.entries(porJefe).sort((a,b)=>b[1]-a[1]);
  const m=Object.entries(porMaquina).sort((a,b)=>b[1]-a[1]);
  charts.ngJefe=new Chart(document.getElementById('negligenciaJefeChart'),{type:'bar',data:{labels:j.length?j.map(x=>x[0]):['Sin datos'],datasets:[{label:'Horas perdidas',data:j.length?j.map(x=>x[1]):[0],backgroundColor:'#a855f7'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
  charts.ngMaquina=new Chart(document.getElementById('negligenciaMaquinaChart'),{type:'bar',data:{labels:m.length?m.map(x=>x[0]):['Sin datos'],datasets:[{label:'Horas perdidas',data:m.length?m.map(x=>x[1]):[0],backgroundColor:'#ef4444'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
}

// ================= BACKLOG SMRP 5.4.9 (READY BACKLOG) =================
function guardarCrew(){
  db.crew={
    personasTotal:Number(document.getElementById('cr_personas').value)||0,
    horasSemanaPersona:Number(document.getElementById('cr_horas').value)||0,
    indirectoPct:Number(document.getElementById('cr_indirecto').value)||0,
    reservaEmergenciaPct:Number(document.getElementById('cr_reserva').value)||0
  };
  save();renderBacklog();toast('Capacidad de cuadrilla guardada');
}
function backlogToggleReady(id,checked){
  const wo=db.workOrders.find(x=>x.id===id);
  if(!wo)return;
  wo.ready=checked;save();renderBacklog();
}
function getBacklogStats(){
  const abiertas=(db.workOrders||[]).filter(x=>x.status!=='Cerrada');
  const readyWork=abiertas.filter(x=>x.ready).reduce((a,x)=>a+(Number(x.downtime)||0),0);
  const c=db.crew||{};
  const netCapacity=Math.max(0,(c.personasTotal||0)*(c.horasSemanaPersona||c.horasTurno||8)*(1-(c.indirectoPct||0)/100)*(1-(c.reservaEmergenciaPct||0)/100));
  const ratio=netCapacity>0?readyWork/netCapacity:0;
  const criticas=abiertas.filter(x=>{
    const p=String(x.priority||'').toLowerCase();
    return p.includes('crít')||p.includes('crit')||p.includes('alta');
  });
  return {abiertas,readyWork,netCapacity,ratio,criticas};
}

function renderSemanaPlanta(){
  const period=getDashPeriod();
  const evs=eventsInPeriod(null, period, true, dashRefDate);
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

  const areaTxt=isAllAreas()?'Toda la planta':currentArea;
  const kpis=document.getElementById('spKpis');
  if(kpis){
    const ratioCls=bk.ratio>=2&&bk.ratio<=4?'b-ok':bk.ratio<2?'b-warn':'b-bad';
    kpis.innerHTML=[
      ['Alcance',areaTxt,selectedMachine||'Todas las máquinas'],
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

  safeChartDestroy(charts,'spKg');
  const ctx=document.getElementById('spKgChart');
  if(ctx){
    charts.spKg=new Chart(ctx,{
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

function fillFichaMachineSelect(){
  const sel=document.getElementById('fichaMachineSelect');
  if(!sel) return;
  const ids=allMachineIds();
  const cur=sel.value||selectedMachine||ids[0]||'';
  sel.innerHTML=ids.map(id=>`<option value="${escAttr(id)}">${esc(id)}</option>`).join('')||'<option value="">—</option>';
  if(cur&&ids.includes(cur)) sel.value=cur;
}
function renderFichaMaquina(){
  fillFichaMachineSelect();
  const mid=document.getElementById('fichaMachineSelect')?.value||selectedMachine||'';
  const box=document.getElementById('fichaContent');
  if(!box) return;
  if(!mid){ box.innerHTML='<div class="empty">Selecciona una máquina</div>'; return; }
  const period=getDashPeriod();
  const evs=eventsInPeriod(mid, period, false, dashRefDate);
  const mins=downtimeMinutes(evs);
  const totalMin=periodMinutes(period, dashRefDate);
  const avail=Math.max(0,100-(mins/totalMin*100));
  const m=db.machines.find(x=>x.id===mid)||{id:mid,dailyTarget:MACHINE_TARGETS[mid]||0};
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
  const ots=(db.workOrders||[]).filter(x=>x.machine===mid&&x.status!=='Cerrada');
  const pms=(db.pm||[]).filter(p=>p[0]===mid).slice(0,8);
  const area=LIVE_MACHINE_DB.find(r=>r.code===mid)?.area||'—';

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

function renderTableroCompra(){
  const period=getDashPeriod();
  const evs=eventsInPeriod(null, period, true, dashRefDate);
  const map={};
  evs.forEach(e=>{
    let c=e.componente;
    if((!c||c==='No especificado')&&e.desc){ Object.assign(e,camposClasificacion(e.desc)); c=e.componente; }
    if(!c||c==='No especificado') return;
    if(!map[c]) map[c]={comp:c,n:0,minutes:0};
    map[c].n++;
    map[c].minutes+=Number(e.minutes)||0;
  });
  const parts=db.parts||[];
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

  safeChartDestroy(charts,'tc');
  const top=rows.slice(0,10);
  const ctx=document.getElementById('tcChart');
  if(ctx){
    charts.tc=new Chart(ctx,{
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

function renderBacklog(){
  document.getElementById('cr_personas').value=db.crew.personasTotal||'';
  document.getElementById('cr_horas').value=db.crew.horasSemanaPersona||'';
  document.getElementById('cr_indirecto').value=db.crew.indirectoPct||'';
  document.getElementById('cr_reserva').value=db.crew.reservaEmergenciaPct||'';

  const abiertas=db.workOrders.filter(x=>x.status!=='Cerrada');
  document.getElementById('backlogOtTable').innerHTML=abiertas.map(x=>`<tr><td>${esc(x.id)}</td><td>${esc(x.machine)}</td><td>${esc(x.fault)}</td><td>${x.downtime||0}</td><td style="text-align:center"><input type="checkbox" ${x.ready?'checked':''} onchange="backlogToggleReady('${x.id}',this.checked)"></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Sin OTs abiertas</td></tr>';

  const st=getBacklogStats();
  document.getElementById('bkReadyWork').textContent=st.readyWork.toFixed(1);
  document.getElementById('bkNetCapacity').textContent=st.netCapacity.toFixed(1);
  document.getElementById('bkRatio').textContent=st.ratio.toFixed(2)+' sem.';

  if(charts.backlog){try{charts.backlog.destroy()}catch(e){}}
  charts.backlog=new Chart(document.getElementById('backlogChart'),{type:'bar',data:{labels:['Ready Work (h)','Net Crew Capacity (h/sem)'],datasets:[{data:[st.readyWork,st.netCapacity],backgroundColor:[st.ratio>=2&&st.ratio<=4?'#22c55e':st.ratio<2?'#f59e0b':'#ef4444','#3b82f6']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},title:{display:true,text:'Referencia sana SMRP: 2 a 4 semanas de Ready Backlog'}}}});
}

// ================= RECOMENDACIONES AUTOMÁTICAS DE PREVENTIVO =================
function renderPmRecommendations(){
  const period=document.getElementById('pmRecoPeriod')?.value||'month';
  const evs=eventsInPeriod(null,period,true,dashRefDate);
  const byM={};
  evs.forEach(x=>{if(!byM[x.machine])byM[x.machine]={events:0,minutes:0};byM[x.machine].events++;byM[x.machine].minutes+=(Number(x.minutes)||0);});
  const ranked=Object.entries(byM).map(([m,v])=>({m,...v})).sort((a,b)=>b.minutes-a.minutes).slice(0,6);
  const list=db.keywords||[];
  document.getElementById('pmRecoList').innerHTML=ranked.length?ranked.map(r=>{
    const evsM=evs.filter(x=>x.machine===r.m);
    const kw=list.map(k=>({k,n:evsM.filter(x=>(x.desc||'').toLowerCase().includes(k.toLowerCase())).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
    const comp=kw.length?kw.slice(0,3).map(x=>x.k).join(', '):'sin componente identificado por palabra clave';
    return `<div class="item"><div class="flex"><strong>${esc(r.m)}</strong><span class="badge b-warn">${(r.minutes/60).toFixed(1)} h · ${r.events} eventos</span></div>
      <div class="muted" style="font-size:11px;margin-top:4px">Componente(s) que más se repite(n): ${esc(comp)}. Sugerencia: agregar/adelantar un preventivo enfocado en ${esc(comp)} para esta máquina.</div>
      <div class="actions mt"><button class="btn" onclick="openModal('pm');setTimeout(()=>{document.getElementById('modalTitle').textContent='Nuevo plan preventivo (RECOMENDACIÓN)';const s=document.getElementById('p_m');if(s)s.value='${r.m}';const n=document.getElementById('p_a');if(n)n.value='(Recomendación) Revisión preventiva de ${esc(comp).replace(/'/g,"\\'")}'},50)">+ Crear como recomendación</button></div>
    </div>`;
  }).join(''):'<div class="empty">Sin suficientes eventos en el periodo para generar recomendaciones</div>';
}

// ================= JUSTIFICACIÓN FINANCIERA DE COMPRAS =================
function fillFinMachineSelect(){
  const sel=document.getElementById('finMachine');
  if(!sel) return;
  const cur=sel.value||window._finMachinePref||'';
  const ids=MACHINES();
  sel.innerHTML='<option value="">(Elegir máquina)</option>'+ids.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join('');
  if(cur && [...sel.options].some(o=>o.value===cur)) sel.value=cur;
  else if(selectedMachine && ids.includes(selectedMachine)) sel.value=selectedMachine;
  window._finMachinePref=undefined;
}
function onFinMachineChange(){
  const m=document.getElementById('finMachine')?.value||'';
  if(m) usarHorasRealesFin(false);
  else renderFinanciero();
  saveFinConfig();
}
function usarHorasRealesFin(showToast){
  const machine=document.getElementById('finMachine')?.value||selectedMachine||'';
  if(!machine){
    if(showToast!==false) toast('Selecciona una máquina para usar horas reales','err');
    return;
  }
  const period=getDashPeriod();
  const evs=eventsInPeriod(machine, period, false, dashRefDate);
  const mins=downtimeMinutes(evs);
  const hours=+(mins/60).toFixed(2);
  const el=document.getElementById('finHorasHombre');
  if(el){
    el.value=hours>0?Math.max(hours,0.5):8;
    el.style.transition='background-color .5s';
    el.style.backgroundColor='#dcfce7';
    setTimeout(()=>{ el.style.backgroundColor=''; },1500);
  }
  if(showToast!==false){
    toast(hours>0?(hours+' h reales · '+evs.length+' evento(s) en el periodo'):'Sin paros en el periodo; se usan 8 h por defecto');
  }
  renderFinanciero();
}
function renderFinanciero(){
  fillFinMachineSelect();
  const machine=document.getElementById('finMachine')?.value||'';
  const costoRefaccion=Number(document.getElementById('finCostoRefaccion')?.value)||0;
  const horasHombre=Number(document.getElementById('finHorasHombre')?.value)||0;
  const costoHora=Number(document.getElementById('finCostoHora')?.value)||0;
  const perdidaProdHora=Number(document.getElementById('finPerdidaProd')?.value)||0;
  const multas=Number(document.getElementById('finMultas')?.value)||0;

  const costoHombre=horasHombre*costoHora;
  const perdidaProduccion=perdidaProdHora*horasHombre;
  const costoTotal=costoRefaccion+costoHombre+perdidaProduccion+multas;
  const ahorro=Math.max(0, costoTotal-costoRefaccion);
  const porcentajeAhorro=costoTotal>0?((ahorro/costoTotal)*100):0;

  const kpisEl=document.getElementById('finKpis');
  if(kpisEl){
    kpisEl.innerHTML=[
      ['Costo refacción','$'+costoRefaccion.toLocaleString('es-MX'),'Inversión en stock','Costo estimado de comprar/tener la refacción en inventario'],
      ['Horas hombre','$'+costoHombre.toLocaleString('es-MX'),horasHombre+' h × $'+costoHora.toLocaleString('es-MX'),'Mano de obra durante la intervención por la falla'],
      ['Producción perdida','$'+perdidaProduccion.toLocaleString('es-MX'),'$'+perdidaProdHora.toLocaleString('es-MX')+'/h × '+horasHombre+' h','Valor de la producción no realizada por el paro'],
      ['COSTO TOTAL REAL','$'+costoTotal.toLocaleString('es-MX'),porcentajeAhorro.toFixed(1)+'% más que solo la refacción','Costo total de NO tener la refacción a tiempo']
    ].map((x,i)=>`<div class="card kpi" title="${esc(x[3])}"${i===3?' style="border:2px solid var(--red)"':''}><div class="label">${x[0]}</div><div class="value"${i===3?' style="color:var(--red);font-size:22px"':''}>${x[1]}</div><div class="sub">${x[2]}</div><div class="hint">${esc(x[3])}</div></div>`).join('');
  }

  renderWaterfall(costoRefaccion, costoHombre, perdidaProduccion, multas, costoTotal);
  renderStackedBar(costoRefaccion, costoHombre, perdidaProduccion, multas, costoTotal);
  renderAreaChart(perdidaProdHora, horasHombre);
  saveFinConfig();

  const items=[
    ['Refacción',costoRefaccion],
    ['Horas hombre',costoHombre],
    ['Producción perdida',perdidaProduccion],
    ['Multas / penalizaciones',multas]
  ];
  const tbody=document.getElementById('finDetalleTable');
  if(tbody){
    tbody.innerHTML=items.map(([c,v])=>{
      const pct=costoTotal>0?((v/costoTotal)*100).toFixed(1):'0.0';
      return `<tr><td>${esc(c)}</td><td>$${v.toLocaleString('es-MX')}</td><td>${pct}%</td></tr>`;
    }).join('');
  }
  const setTxt=(id,t)=>{ const el=document.getElementById(id); if(el) el.textContent=t; };
  setTxt('finTotalDisplay','$'+costoTotal.toLocaleString('es-MX'));
  setTxt('finComparacionDisplay','+'+porcentajeAhorro.toFixed(1)+'% vs. refacción');
  setTxt('finCostoHoraDisplay','$'+perdidaProdHora.toLocaleString('es-MX'));
  setTxt('finAhorroDisplay','$'+ahorro.toLocaleString('es-MX'));
  setTxt('finAhorroPctDisplay',porcentajeAhorro.toFixed(1)+'%');
  const pctRec=costoTotal>0?((costoRefaccion/costoTotal)*100):0;
  setTxt('finRecomendacionPct',pctRec.toFixed(1)+'%');
  const badge=document.getElementById('finRecomendacionBadge');
  if(badge){
    badge.textContent=pctRec<20?'URGENTE':pctRec<40?'ATENCIÓN':'VIABLE';
    badge.className='badge '+(pctRec<20?'b-bad':pctRec<40?'b-warn':'b-ok');
  }

  finData={machine,costoRefaccion,horasHombre,costoHora,perdidaProdHora,multas,costoTotal,ahorro,porcentajeAhorro};
}

function renderWaterfall(costoRef, costoHH, costoProd, multas, total){
  const ctx=document.getElementById('waterfallChart');
  if(!ctx) return;
  if(finCharts.waterfall){ try{finCharts.waterfall.destroy()}catch(e){} }
  if(total<=0 && costoRef<=0 && costoHH<=0 && costoProd<=0 && multas<=0){
    finCharts.waterfall=new Chart(ctx,{
      type:'bar',
      data:{labels:['Sin datos'],datasets:[{data:[0],backgroundColor:'#94a3b8'}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},title:{display:true,text:'Configura los costos para ver el análisis'}}}
    });
    return;
  }
  const labels=['Refacción','Horas hombre','Prod. perdida','Multas','TOTAL'];
  const increments=[costoRef,costoHH,costoProd,multas,total];
  const colors=['#22c55e','#f59e0b','#f97316','#ef4444','#dc2626'];
  let run=0;
  const base=[], rise=[];
  for(let i=0;i<4;i++){
    base.push(run);
    rise.push(increments[i]);
    run+=increments[i];
  }
  base.push(0);
  rise.push(total);
  finCharts.waterfall=new Chart(ctx,{
    type:'bar',
    data:{
      labels,
      datasets:[
        {label:'base',data:base,backgroundColor:'transparent',stack:'w',borderWidth:0},
        {label:'Costo',data:rise,backgroundColor:colors,stack:'w',borderRadius:4}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:c=>{
          if(c.datasetIndex===0) return null;
          return '$'+Number(c.raw||0).toLocaleString('es-MX');
        }}}
      },
      scales:{
        x:{stacked:true},
        y:{stacked:true,beginAtZero:true,ticks:{callback:v=>'$'+Number(v).toLocaleString('es-MX')}}
      }
    }
  });
}

function renderStackedBar(costoRef, costoHH, costoProd, multas, total){
  const ctx=document.getElementById('stackedBarChart');
  if(!ctx) return;
  if(finCharts.stacked){ try{finCharts.stacked.destroy()}catch(e){} }
  finCharts.stacked=new Chart(ctx,{
    type:'bar',
    data:{
      labels:['Escenario falla\n(sin stock)','Escenario óptimo\n(refacción en stock)'],
      datasets:[
        {label:'Refacción',data:[costoRef,costoRef],backgroundColor:'#22c55e',borderRadius:4},
        {label:'Horas hombre',data:[costoHH,0],backgroundColor:'#f59e0b',borderRadius:4},
        {label:'Prod. perdida',data:[costoProd,0],backgroundColor:'#f97316',borderRadius:4},
        {label:'Multas',data:[multas,0],backgroundColor:'#ef4444',borderRadius:4}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:'bottom'},
        tooltip:{callbacks:{label:c=>c.dataset.label+': $'+Number(c.raw||0).toLocaleString('es-MX')}}
      },
      scales:{
        x:{stacked:true},
        y:{stacked:true,beginAtZero:true,ticks:{callback:v=>'$'+Number(v).toLocaleString('es-MX')}}
      }
    }
  });
}

function renderAreaChart(perdidaHora, horas){
  const ctx=document.getElementById('areaChart');
  if(!ctx) return;
  if(finCharts.area){ try{finCharts.area.destroy()}catch(e){} }
  const horasMax=Math.max(Math.ceil(horas*1.5)||12, 12);
  const labels=[], data=[];
  for(let h=0;h<=horasMax;h++){
    labels.push(h+'h');
    data.push(perdidaHora*h);
  }
  finCharts.area=new Chart(ctx,{
    type:'line',
    data:{
      labels,
      datasets:[{
        label:'Pérdida acumulada (MXN)',
        data,
        fill:true,
        backgroundColor:'rgba(239,68,68,0.28)',
        borderColor:'#dc2626',
        borderWidth:3,
        tension:0.25,
        pointRadius:2
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:c=>'$'+Number(c.raw||0).toLocaleString('es-MX')}}
      },
      scales:{
        y:{beginAtZero:true,ticks:{callback:v=>'$'+Number(v).toLocaleString('es-MX')}},
        x:{title:{display:true,text:'Horas de paro',font:{size:11}}}
      }
    }
  });
}

async function exportarFinancieroPDF(){
  if(typeof window.jspdf==='undefined' || !window.jspdf?.jsPDF){
    toast('La librería PDF no está cargada','err');
    return;
  }
  try{
    renderFinanciero();
    await new Promise(r=>setTimeout(r,120));
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:'pt',format:'a4'});
    const W=doc.internal.pageSize.getWidth();
    let y=50;
    doc.setFontSize(16);
    doc.text('Analisis financiero - Justificacion de compras',40,y); y+=22;
    doc.setFontSize(11);
    doc.text('Maquina: '+(finData.machine||'—')+'  |  Fecha: '+new Date().toLocaleDateString('es-MX'),40,y); y+=20;
    doc.text('Periodo ref.: '+getDashPeriod()+' · '+dashRefDate,40,y); y+=28;
    doc.setFontSize(12);
    doc.text('Desglose de costos',40,y); y+=18;
    doc.setFontSize(10);
    const rows=[
      ['Refaccion','$'+finData.costoRefaccion.toLocaleString('es-MX')],
      ['Horas hombre ('+finData.horasHombre+' h x $'+finData.costoHora+')','$'+(finData.horasHombre*finData.costoHora).toLocaleString('es-MX')],
      ['Produccion perdida','$'+(finData.perdidaProdHora*finData.horasHombre).toLocaleString('es-MX')],
      ['Multas','$'+finData.multas.toLocaleString('es-MX')],
      ['COSTO TOTAL REAL','$'+finData.costoTotal.toLocaleString('es-MX')]
    ];
    rows.forEach(([a,b],i)=>{
      if(i===4) doc.setFont(undefined,'bold');
      doc.text(a,40,y); doc.text(b,W-160,y); y+=16;
      doc.setFont(undefined,'normal');
    });
    y+=12;
    const chartIds=['waterfallChart','stackedBarChart','areaChart'];
    for(const id of chartIds){
      const canvas=document.getElementById(id);
      if(!canvas) continue;
      try{
        if(y>520){ doc.addPage(); y=50; }
        const img=canvas.toDataURL('image/png');
        const h=Math.min(220,(W-80)*0.45);
        doc.setFontSize(11); doc.text(id.replace('Chart',''),40,y); y+=8;
        doc.addImage(img,'PNG',40,y,W-80,h);
        y+=h+16;
      }catch(e){ console.warn('No se pudo embeber',id,e); }
    }
    if(y>720){ doc.addPage(); y=50; }
    const pct=finData.costoTotal>0?((finData.costoRefaccion/finData.costoTotal)*100).toFixed(1):'0';
    doc.setFontSize(11);
    doc.text('Recomendacion: la refaccion representa el '+pct+'% del costo total de falla.',40,y); y+=16;
    doc.text('Ahorro estimado al tener stock: $'+finData.ahorro.toLocaleString('es-MX')+' por evento.',40,y);
    doc.save('justificacion_compras_'+(finData.machine||'general')+'_'+iso(new Date())+'.pdf');
    toast('PDF con gráficas generado');
  }catch(err){
    console.error(err);
    toast('Error al generar PDF','err');
  }
}

function copiarFinanciero(){
  const texto=`ANALISIS FINANCIERO - JUSTIFICACION DE COMPRAS
=============================================
Maquina: ${finData.machine||'—'}
Fecha: ${new Date().toLocaleDateString('es-MX')}
Periodo: ${getDashPeriod()} · ${dashRefDate}

DESGLOSE:
- Refaccion: $${finData.costoRefaccion.toLocaleString('es-MX')}
- Horas hombre (${finData.horasHombre} h x $${finData.costoHora}): $${(finData.horasHombre*finData.costoHora).toLocaleString('es-MX')}
- Produccion perdida: $${(finData.perdidaProdHora*finData.horasHombre).toLocaleString('es-MX')}
- Multas: $${finData.multas.toLocaleString('es-MX')}
---------------------------------------------
COSTO TOTAL REAL: $${finData.costoTotal.toLocaleString('es-MX')}

RECOMENDACION:
La refaccion es el ${finData.costoTotal>0?((finData.costoRefaccion/finData.costoTotal)*100).toFixed(1):0}% del costo total de falla.
Ahorro estimado con stock preventivo: $${finData.ahorro.toLocaleString('es-MX')} por evento.`;
  if(navigator.clipboard?.writeText){
    navigator.clipboard.writeText(texto).then(()=>toast('Resumen copiado')).catch(()=>fallbackCopy(texto));
  } else fallbackCopy(texto);
}
function fallbackCopy(texto){
  const ta=document.createElement('textarea');
  ta.value=texto; document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); toast('Resumen copiado'); }catch(e){ toast('No se pudo copiar','err'); }
  document.body.removeChild(ta);
}

document.getElementById('m_lunes').value=iso(mProximoLunes());
if(document.getElementById('ng_fecha'))document.getElementById('ng_fecha').value=iso(new Date());
document.getElementById('meal-empleados').style.display='none';
document.getElementById('meal-historial').style.display='none';
renderMealEmpleados();renderMealBoard();

document.getElementById('weeklyDate').value=iso(new Date());
loadUiState();
loadFinConfig();
if(document.getElementById('dashRefDateInput')) document.getElementById('dashRefDateInput').value=dashRefDate;
if(document.getElementById('teamRefDate')) document.getElementById('teamRefDate').value=dashRefDate;
window.dashPeriod=window.dashPeriod||'day';
updateDashPeriodLabel();
fillAreaSelectUI();
window.dashPeriod=window.dashPeriod||'day';
syncPeriodControls();
fillReportMachineSelect();
fillFinMachineSelect();
const darkBtn=document.getElementById('darkModeBtn');
if(darkBtn) darkBtn.textContent=document.documentElement.classList.contains('dark')?'☀️ Modo claro':'🌙 Modo oscuro';
navigateToView(currentView);
setTimeout(()=>{ const bl=document.getElementById('bootLoader'); if(bl) bl.classList.add('hide'); setTimeout(()=>bl&&bl.remove(),400); }, 350);

// Redimensionar gráficas financieras
let _finResizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(_finResizeTimer);
  _finResizeTimer=setTimeout(()=>{
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
try{ _prevDbJson=JSON.stringify(db); }catch(e){}
