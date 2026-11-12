/** Módulo: views/preventive.js */

import { state } from '../core/state.js';

import { esc, escAttr } from '../core/ui.js';

import { MACHINE_DB, iso } from '../domain/machines.js';


function preventiveChecklistKey(date){return 'chiaplast-preventive-checklist-v1:'+date;}

function readPreventiveChecklist(date){try{return JSON.parse(localStorage.getItem(preventiveChecklistKey(date))||'{}')||{};}catch(e){return {};}}

export function togglePreventiveMachine(machineId,checked){
  const date=document.getElementById('preventiveChecklistDate')?.value||state.dashRefDate;
  const checklist=readPreventiveChecklist(date);checklist[machineId]=!!checked;
  try{localStorage.setItem(preventiveChecklistKey(date),JSON.stringify(checklist));}catch(e){}
  const label=[...document.querySelectorAll('.preventive-machine-item')].find(el=>el.querySelector('input')?.dataset.machine===machineId);
  if(label)label.classList.toggle('is-done',!!checked);
  renderPreventiveChecklistSummary(date);
}

function renderPreventiveChecklistSummary(date){
  const checklist=readPreventiveChecklist(date),total=Object.values(checklist).filter(Boolean).length;
  const summary=document.getElementById('preventiveChecklistSummary');
  if(summary)summary.textContent=total+' equipo(s) marcados como atendidos · '+date;
}

export function renderPreventiveChecklist(){
  const dateInput=document.getElementById('preventiveChecklistDate');if(!dateInput)return;
  if(!dateInput.value)dateInput.value=state.dashRefDate||iso(new Date());
  dateInput.onchange=()=>renderPreventiveChecklist();
  const date=dateInput.value,checklist=readPreventiveChecklist(date),root=document.getElementById('preventiveAreaChecklist');
  if(!root)return;
  const grouped={};
  (state.LIVE_MACHINE_DB||MACHINE_DB).forEach(row=>{if(!row||!row.code)return;const area=row.area||'Otras';(grouped[area]||(grouped[area]=[])).push(row.code);});
  root.innerHTML=Object.entries(grouped).map(([area,machines])=>{
    const done=machines.filter(m=>checklist[m]).length;
    return `<section class="preventive-area-card"><div class="preventive-area-head"><span>${esc(area)}</span><span class="badge ${done===machines.length?'b-ok':'b-warn'}">${done}/${machines.length}</span></div><div class="preventive-machine-list">${machines.map(m=>`<label class="preventive-machine-item ${checklist[m]?'is-done':''}"><input type="checkbox" data-machine="${escAttr(m)}" ${checklist[m]?'checked':''} onchange="togglePreventiveMachine(this.dataset.machine,this.checked)"><span>${esc(m)}</span></label>`).join('')}</div></section>`;
  }).join('')||'<div class="empty">No hay máquinas en el área seleccionada.</div>';
  renderPreventiveChecklistSummary(date);
}

