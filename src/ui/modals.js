/** Módulo: ui/modals.js */

import { state } from '../core/state.js';

import { closeMobileMenu, esc, flashLastTableRow, save, saveUiState, toast } from '../core/ui.js';

import { camposClasificacion } from '../domain/failure-classifier.js';

import { MACHINES, isAllAreas, iso } from '../domain/machines.js';

import { fillFinMachineSelect } from '../features/financial.js';

import { fillReportMachineSelect } from '../features/report-pdf.js';

import { TEAM, ensurePerson } from '../features/team.js';

import { VIEW_CONFIG } from './navigation.js';

import { render } from '../views/dashboard.js';

export function fillAreaSelectUI(){
  const sel=document.getElementById('areaSelect');
  if(!sel) return;
  const cur=isAllAreas()?'__ALL__':state.currentArea;
  sel.innerHTML='<option value="__ALL__">★ Toda la planta</option>'+
    state.AREA_ORDER.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
  sel.value=cur;
}

function onAreaSelectChange(){
  const e=document.getElementById('areaSelect');
  state.currentArea=e && e.value==='__ALL__'?'__ALL__':(e?.value||state.currentArea);
  state.selectedMachine='';
  fillReportMachineSelect();
  fillFinMachineSelect();
  render();
}

document.getElementById('areaSelect')?.addEventListener('change',onAreaSelectChange);

document.getElementById('machineSelect')?.addEventListener('change',e=>{
  state.selectedMachine=e.target.value||'';
  const finSel=document.getElementById('finMachine');
  if(finSel && state.selectedMachine && [...finSel.options].some(o=>o.value===state.selectedMachine)) finSel.value=state.selectedMachine;
  render();
});

export function navigateToView(viewId){
  const config=VIEW_CONFIG[viewId];
  const view=document.getElementById(viewId);
  const button=[...document.querySelectorAll('.nav button[data-view]')].find(item=>item.dataset.view===viewId);
  if(!config||!view||!button){
    console.error(`No se encontró la pantalla "${viewId}"`);
    toast('La pantalla solicitada no está disponible','err');
    return false;
  }

  state.currentView=viewId;
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

export function openModal(type){
 const modal=document.getElementById('modal'), body=document.getElementById('modalBody'); modal.classList.add('open');
 if(type==='workOrder'){document.getElementById('modalTitle').textContent='Nueva orden de trabajo';body.innerHTML=`<div class="formgrid">
 <div class="field"><label>Fecha</label><input id="f_d" type="date" value="${state.dashRefDate}"></div>
 <div class="field"><label>Máquina</label><select id="f_m">${MACHINES().map(x=>`<option>${x}</option>`).join('')}</select></div>
 <div class="field"><label>Prioridad</label><select id="f_p"><option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option></select></div>
 <div class="field"><label>Técnico</label><select id="f_t">${TEAM().map(x=>`<option>${x[0]}</option>`).join('')}</select></div>
 <div class="field"><label>Horas de paro</label><input id="f_h" type="number" step=".1" value="0"></div>
 <div class="field full"><label>Falla / trabajo solicitado</label><textarea id="f_f" placeholder="Ej. pérdida de señal de fotocelda, cuchilla no corta, alarma VFD..."></textarea></div>
 </div><div class="actions mt"><button class="btn primary" onclick="saveWO()">Crear OT</button></div>`; bindModalEnter();}
 if(type==='event'){document.getElementById('modalTitle').textContent='Registrar falla / evento';body.innerHTML=`<div class="formgrid">
 <div class="field"><label>Fecha</label><input id="e_date" type="date" value="${state.dashRefDate}"></div>
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

export function closeModal(){document.getElementById('modal').classList.remove('open')}

export function saveWO(){
  const machine=document.getElementById('f_m')?.value;
  const fault=(document.getElementById('f_f')?.value||'').trim();
  const tech=document.getElementById('f_t')?.value;
  if(!machine || !fault || !tech){ toast('Completa máquina, falla y técnico','err'); return; }
  const id='OT-'+String(Date.now()).slice(-6);
  const d=iso(document.getElementById('f_d')?.value||new Date());
  const priority=document.getElementById('f_p')?.value||'Media';
  const downtime=Number(document.getElementById('f_h')?.value)||0;
  state.db.workOrders.unshift({id,date:d,machine,fault,priority,status:'Abierta',downtime,technician:tech});
  state.db.history.unshift([d,'Correctivo',machine,fault,tech,'Abierta']);
  ensurePerson(tech);save();closeModal();render();toast(id+' creada');
  flashLastTableRow('woTable'); flashLastTableRow('historyTable');
}

export function saveEvent(){
  const machine=document.getElementById('e_m')?.value;
  const desc=(document.getElementById('e_d')?.value||'').trim();
  if(!machine || !desc){ toast('Completa máquina y descripción','err'); return; }
  const d=iso(document.getElementById('e_date')?.value||new Date());
  const type=document.getElementById('e_t')?.value||'Falla';
  const severity=document.getElementById('e_s')?.value||'Media';
  const minutes=Number(document.getElementById('e_min')?.value)||0;
  const clas=camposClasificacion(desc);
  state.db.events.unshift({date:d,machine,type,severity:severity,desc,minutes,kgTarget:0,kgActual:0,...clas});
  state.db.history.unshift([d,'Evento',machine,desc,'Usuario','Registrado']);
  save();closeModal();render();
  toast('Evento registrado'+(clas.clasificacion!=='No clasificada'?' · '+clas.clasificacion+' ('+clas.confianza+'%)':''));
  flashLastTableRow('historyTable');
}

export function savePm(){
  const machine=document.getElementById('p_m')?.value;
  const activity=(document.getElementById('p_a')?.value||'').trim();
  if(!machine || !activity){ toast('Completa máquina y actividad','err'); return; }
  const f=document.getElementById('p_fr')?.value||'Mensual';
  const pr=document.getElementById('p_pr')?.value||'Media';
  const d=new Date();
  d.setDate(d.getDate()+({'Diaria':1,'Semanal':7,'Quincenal':15,'Mensual':30,'Trimestral':90}[f]||30));
  state.db.pm.push([machine,activity,f,iso(new Date()),iso(d),pr]);
  save();closeModal();render();toast('Plan preventivo agregado');
  flashLastTableRow('pmTable');
}

export function savePart(){
  const name=(document.getElementById('r_n')?.value||'').trim();
  if(!name){ toast('Escribe el nombre de la refacción','err'); return; }
  const cat=(document.getElementById('r_c')?.value||'').trim()||'General';
  const stock=Number(document.getElementById('r_s')?.value)||0;
  const min=Number(document.getElementById('r_m')?.value)||1;
  const equip=(document.getElementById('r_e')?.value||'').trim()||'—';
  state.db.parts.push([name,cat,stock,min,equip]);
  save();closeModal();render();toast('Refacción agregada');
  flashLastTableRow('partsTable');
}

export function exportData(){const blob=new Blob([JSON.stringify(state.db,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='SL_CMMS_backup.json';a.click();URL.revokeObjectURL(a.href);toast('JSON exportado')}

export function importData(e){const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{state.db=JSON.parse(r.result);save();render();toast('Datos importados')}catch(err){toast('Archivo inválido','err')}};r.readAsText(file)}

