/** Módulo: views/operations.js */

import { state } from '../core/state.js';

import { badge, emptyState, esc, escAttr, flashLastTableRow, save, toast } from '../core/ui.js';

import { camposClasificacion } from '../domain/failure-classifier.js';

import { MACHINES, MACHINE_DB, MACHINE_TARGETS, isAllAreas, iso, parseKg, parseLocalDate, persistMachineDB, rebuildAreasFromLive } from '../domain/machines.js';

import { downtimeMinutes, eventDate, eventsInPeriod, periodMinutes, periodRange, productionFromEvents } from '../domain/production.js';

import { machineFilter } from '../features/weekly-import.js';


import { getDashPeriod, render } from './dashboard.js';

export function renderMachineTiles(){
  const root=document.getElementById('machineTiles');
  if(!root)return;
  const period=getDashPeriod();
  const totalMin=Math.max(1,periodMinutes(period,state.dashRefDate));
  const machines=machineFilter();
  root.innerHTML=machines.map(machine=>{
    const events=eventsInPeriod(machine.id,period,false,state.dashRefDate);
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

export function renderPm(){
 const scopeIds=new Set(MACHINES());
 const rows=state.db.pm.map((r,i)=>({r,i})).filter(({r})=>{
   if(state.selectedMachine && r[0]!==state.selectedMachine) return false;
   if(!scopeIds.has(r[0])) return false;
   return true;
 });
 document.getElementById('pmTable').innerHTML=rows.map(({r,i})=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td>${esc(r[4])}</td><td>${badge(r[5])}</td><td><button class="btn" onclick="completePm(${i})">Ejecutar</button></td></tr>`).join('')||'<tr><td colspan="7" class="empty">Sin planes preventivos en el alcance actual</td></tr>';
}

export function completePm(i){
 state.db.pm[i][3]=iso(new Date()); const d=new Date(); d.setDate(d.getDate()+({'Semanal':7,'Quincenal':15,'Mensual':30,'Trimestral':90,'Diaria':1}[state.db.pm[i][2]]||30));state.db.pm[i][4]=iso(d);
 state.db.history.unshift([iso(new Date()),'Preventivo',state.db.pm[i][0],`Ejecutado: ${state.db.pm[i][1]}`,'Usuario','Cerrado']);save();render();toast('Preventivo ejecutado y reprogramado');
}

export function renderWO(){
 const scopeIds=new Set(MACHINES());
 const period=getDashPeriod();
 const {start,end}=periodRange(period, state.dashRefDate);
 const rows=state.db.workOrders.filter(x=>{
   if(state.selectedMachine && x.machine!==state.selectedMachine) return false;
   if(!scopeIds.has(x.machine) && x.machine!=='SIN ASIGNAR') return false;
   const d=parseLocalDate(x.date);
   if(d<start || d>end) return false;
   return true;
 });
 const lbl=document.getElementById('woFilterLabel');
 if(lbl){
   const areaTxt=isAllAreas()?'Toda la planta':state.currentArea;
   const machTxt=state.selectedMachine||'todas las máquinas';
   lbl.textContent=`Filtro: ${areaTxt} · ${machTxt} · ${iso(start)}${period==='day'?'':' → '+iso(end)} · ${rows.length} OT`;
 }
 document.getElementById('woTable').innerHTML=rows.map(x=>`<tr><td>${esc(x.id)}</td><td>${esc(x.date)}</td><td>${esc(x.machine)}</td><td>${esc(x.fault)}</td><td>${badge(x.priority)}</td><td>${badge(x.status)}</td><td>${esc(x.downtime)}</td><td><button class="btn" onclick='closeWO(${JSON.stringify(String(x.id||''))})'>${x.status==='Cerrada'?'Ver':'Cerrar'}</button></td></tr>`).join('')||`<tr><td colspan="8">${emptyState('No hay OT en este filtro','Cambia área/periodo o crea una nueva orden.','<button class="btn primary" onclick="openModal(\'workOrder\')">+ Nueva OT</button>')}</td></tr>`;
}

export function closeWO(id){
  const x=state.db.workOrders.find(o=>o.id===id);
  if(!x) return;
  if(x.status==='Cerrada'){ toast('Esta OT ya está cerrada'); return; }
  if(!confirm('¿Cerrar la OT '+id+' de '+x.machine+'?')) return;
  x.status='Cerrada';
  state.db.history.unshift([iso(new Date()),'Correctivo',x.machine,x.fault,x.technician,'Cerrado']);
  save();render();toast('OT cerrada');
  flashLastTableRow('woTable');
}

export function renderEvents(){
 const scopeIds=new Set(MACHINES());
 const period=getDashPeriod();
 const {start,end}=periodRange(period, state.dashRefDate);
 const list=state.db.events.filter(x=>{
   if(state.selectedMachine && x.machine!==state.selectedMachine) return false;
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
 if(state.charts.event){try{state.charts.event.destroy()}catch(e){}}
 const evTypes={};
 list.forEach(x=>evTypes[x.type]=(evTypes[x.type]||0)+(Number(x.minutes)||0)/60);
 const evCtx=document.getElementById('eventChart');
 if(evCtx){
   state.charts.event=new Chart(evCtx,{type:'doughnut',data:{labels:Object.keys(evTypes).length?Object.keys(evTypes):['Sin paros'],datasets:[{data:Object.keys(evTypes).length?Object.values(evTypes):[1]}]},options:{responsive:true,maintainAspectRatio:false}});
 }

 // Barras por componente (o clasificación principal)
 if(state.charts.categorias){try{state.charts.categorias.destroy()}catch(e){}}
 const conteo={};
 list.forEach(ev=>{
   const cat=(ev.componente && ev.componente!=='No especificado')?ev.componente:(ev.clasificacion||'No clasificada');
   conteo[cat]=(conteo[cat]||0)+1;
 });
 const labels=Object.keys(conteo).sort((a,b)=>conteo[b]-conteo[a]);
 const data=labels.map(l=>conteo[l]);
 const catCtx=document.getElementById('categoriasFallasChart');
 if(catCtx){
   state.charts.categorias=new Chart(catCtx,{
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

export function editKeywords(){
 const cur=(state.db.keywords||[]).join(', ');
 const val=prompt('Palabras clave a buscar en las descripciones de fallas (separadas por coma):', cur);
 if(val===null)return;
 state.db.keywords=val.split(',').map(s=>s.trim()).filter(Boolean);
 save();renderKeywordChart();
}

function renderKeywordChart(scopedEvents){
 const list=state.db.keywords||[];
 const pool=Array.isArray(scopedEvents)?scopedEvents:state.db.events;
 document.getElementById('keywordListLabel').textContent='Buscando en el filtro actual: '+list.join(' · ');
 const counts=list.map(k=>({k,matches:pool.filter(x=>(x.desc||'').toLowerCase().includes(k.toLowerCase()))}));
 counts.sort((a,b)=>b.matches.length-a.matches.length);
 if(state.charts.keyword){try{state.charts.keyword.destroy()}catch(e){}}
 const cv=document.getElementById('keywordChart');
 if(cv){
   state.charts.keyword=new Chart(cv,{type:'bar',data:{labels:counts.map(c=>c.k),datasets:[{label:'Menciones en fallas',data:counts.map(c=>c.matches.length),backgroundColor:'#f59e0b'}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}});
 }
 document.getElementById('keywordDetail').innerHTML=counts.filter(c=>c.matches.length>0).map(c=>{
   const porMaquina={};
   c.matches.forEach(x=>{porMaquina[x.machine]=(porMaquina[x.machine]||0)+1;});
   const top=Object.entries(porMaquina).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([m,n])=>`${m} (${n})`).join(', ');
   return `<div class="item"><div class="flex"><strong>${esc(c.k)}</strong><span class="badge b-warn">${c.matches.length}×</span></div><div class="muted" style="font-size:11px">Máquinas: ${esc(top)}</div></div>`;
 }).join('')||'<div class="empty">Sin coincidencias en el filtro actual. Cambia área/periodo o registra más fallas.</div>';
}

export function renderMachineDB(){
  const af=document.getElementById('mdbAreaFilter');
  if(af && !af.dataset.filled){
    af.innerHTML='<option value="">Todas las áreas</option>'+state.AREA_ORDER.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
    af.dataset.filled='1';
  }
  const areaF=af?.value||'';
  const q=(document.getElementById('mdbSearch')?.value||'').toLowerCase();
  const rows=state.LIVE_MACHINE_DB.map((r,i)=>({r,i})).filter(({r})=>{
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

export function updateMaquinaDB(i,field,val){
  if(!state.LIVE_MACHINE_DB[i]) return;
  if(field==='dailyKg') state.LIVE_MACHINE_DB[i].dailyKg=Number(val)||0;
  else state.LIVE_MACHINE_DB[i][field]=String(val||'').trim();
  persistMachineDB();
  toast('Máquina actualizada');
  renderMachineDB();
  render();
}

export function eliminarMaquinaDB(i){
  if(!state.LIVE_MACHINE_DB[i]) return;
  if(!confirm('¿Quitar '+state.LIVE_MACHINE_DB[i].code+' del catálogo?')) return;
  state.LIVE_MACHINE_DB.splice(i,1);
  persistMachineDB();
  renderMachineDB();
  render();
  toast('Máquina eliminada del catálogo');
}

export function agregarMaquinaDB(){
  const area=prompt('Área (ej. Cam, Bsl, Dim):', state.currentArea==='__ALL__'?(state.AREA_ORDER[0]||'Cam'):state.currentArea);
  if(area===null) return;
  const code=prompt('Código de máquina (ej. BK-9):','');
  if(!code||!code.trim()) return;
  const kg=prompt('Capacidad kg/día:','0');
  state.LIVE_MACHINE_DB.push({area:area.trim()||'Sin área', code:code.trim(), dailyKg:Number(kg)||0});
  persistMachineDB();
  const af=document.getElementById('mdbAreaFilter');
  if(af){ af.dataset.filled=''; }
  renderMachineDB();
  render();
  toast('Máquina agregada');
}

export function resetMachineDB(){
  if(!confirm('¿Restaurar el catálogo original de máquinas? Se perderán altas/bajas locales.')) return;
  state.LIVE_MACHINE_DB=MACHINE_DB.map(r=>({area:r.area,code:r.code,dailyKg:Number(r.dailyKg)||0}));
  localStorage.removeItem('SL_MACHINE_DB_CUSTOM');
  rebuildAreasFromLive();
  persistMachineDB();
  const af=document.getElementById('mdbAreaFilter');
  if(af){ af.dataset.filled=''; }
  renderMachineDB();
  render();
  toast('Catálogo restaurado');
}

export function renderCards(){ renderMachineDB(); }

