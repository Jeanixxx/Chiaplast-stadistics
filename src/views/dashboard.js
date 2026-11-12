/** Módulo: views/dashboard.js */
import { services } from '../core/services.js';

import { state } from '../core/state.js';

import { esc, escAttr, saveUiState, toast } from '../core/ui.js';

import { MACHINES, isAllAreas, iso, parseLocalDate } from '../domain/machines.js';

import { periodRange } from '../domain/production.js';



import { VIEW_CONFIG } from '../core/services.js';

import { renderCharts, renderMachineDetail } from './machine-detail.js';

import { renderMachineTiles } from './operations.js';

export function renderDashboard(){
  const allPanel=document.getElementById('dashAllPanel');
  const machinePanel=document.getElementById('dashActivePanel');
  if(state.selectedMachine){
    if(allPanel) allPanel.style.display='none';
    if(machinePanel) machinePanel.style.display='block';
    state.machinePeriod=services.getDashPeriod();
    const tabs=[...document.querySelectorAll('#dashActivePanel .tab')];
    const activeIndex=state.machinePeriod==='week'?1:state.machinePeriod==='month'?2:0;
    tabs.forEach((tab,index)=>tab.classList.toggle('active',index===activeIndex));
    renderMachineDetail();
  }else{
    if(allPanel) allPanel.style.display='block';
    if(machinePanel) machinePanel.style.display='none';
  }
  if(!state.selectedMachine){
    renderMachineTiles();
    renderCharts();
  }
}

function updatePageContext(){
  const config=VIEW_CONFIG[state.currentView]||VIEW_CONFIG.dashboard;
  const title=document.getElementById('pageTitle');
  const subtitle=document.getElementById('pageSubtitle');
  const area=isAllAreas()?'Toda la planta':state.currentArea;
  const machine=state.selectedMachine||'Todas las máquinas';
  const period=services.getDashPeriod();
  const {start,end}=periodRange(period,state.dashRefDate);
  const range=period==='day'?iso(start):`${iso(start)} → ${iso(end)}`;
  if(title) title.textContent=config.title;
  if(subtitle) subtitle.textContent=`${area} · ${machine} · ${range}`;
}

export function render(){
  const machines=MACHINES();
  if(state.selectedMachine&&!machines.includes(state.selectedMachine)) state.selectedMachine='';
  const machineSelect=document.getElementById('machineSelect');
  if(machineSelect){
    machineSelect.innerHTML='<option value="">(Todas)</option>'+
      machines.map(machine=>`<option value="${escAttr(machine)}">${esc(machine)}</option>`).join('');
    machineSelect.value=state.selectedMachine;
  }
  const predictiveMachine=document.getElementById('predMachine');
  if(predictiveMachine) predictiveMachine.textContent=state.selectedMachine||(machines[0]||'—');
  services.syncPeriodControls();
  services.updateDashPeriodLabel();

  const financialMachine=document.getElementById('finMachine');
  if(financialMachine){
    services.fillFinMachineSelect();
    if(state.selectedMachine&&[...financialMachine.options].some(option=>option.value===state.selectedMachine)){
      financialMachine.value=state.selectedMachine;
    }
  }

  const activeView=document.querySelector('.view.active')?.id;
  state.currentView=activeView&&VIEW_CONFIG[activeView]?activeView:'dashboard';
  if(activeView!==state.currentView){
    document.querySelectorAll('.view').forEach(section=>section.classList.toggle('active',section.id===state.currentView));
  }
  updatePageContext();
  const view=VIEW_CONFIG[state.currentView];
  if(view.render){
    try{
      view.render();
    }catch(error){
      console.error(`No se pudo actualizar la pantalla "${view.title}"`,error);
      toast(`No se pudo actualizar ${view.title}`,'err');
    }
  }
}

export function syncPeriodControls(){
  const sideP=document.getElementById('sidePeriodSelect');
  const sideD=document.getElementById('sideRefDateInput');
  if(sideP) sideP.value=services.getDashPeriod();
  if(sideD) sideD.value=state.dashRefDate;
}

export function onSidePeriodChange(){
  const sideP=document.getElementById('sidePeriodSelect');
  const sideD=document.getElementById('sideRefDateInput');
  if(sideP) window.dashPeriod=sideP.value||'day';
  if(sideD && sideD.value) state.dashRefDate=sideD.value;
  services.updateDashPeriodLabel();
  services.render();
}

export function shiftDashDate(dir){
  const p=services.getDashPeriod();
  const d=parseLocalDate(state.dashRefDate);
  if(p==='day') d.setDate(d.getDate()+dir);
  else if(p==='week') d.setDate(d.getDate()+dir*7);
  else d.setMonth(d.getMonth()+dir);
  state.dashRefDate=iso(d);
  services.syncPeriodControls();
  services.updateDashPeriodLabel();
  services.render();
}

export function setDashToday(){
  state.dashRefDate=iso(new Date());
  services.syncPeriodControls();
  services.updateDashPeriodLabel();
  services.render();
}

export function updateDashPeriodLabel(){
  const p=services.getDashPeriod();
  const {start,end}=periodRange(p, state.dashRefDate);
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
  const areaTxt=isAllAreas()?'Toda la planta':state.currentArea;
  const machTxt=state.selectedMachine||'Todas las máquinas';
  const ctx=document.getElementById('dashContextLabel');
  if(ctx) ctx.innerHTML=`<span class="ctx-pill ${pillClass}">📅 ${pillLabel}</span> <strong>${esc(areaTxt)}</strong> · ${esc(machTxt)} · ${esc(txt)}`;
  const btn=document.getElementById('btnClearMachine');
  if(btn) btn.style.display=state.selectedMachine?'inline-block':'none';
  saveUiState();
}

export function getDashPeriod(){ return window.dashPeriod || (document.getElementById('sidePeriodSelect')?.value) || 'day'; }

export function clearMachineSelection(){
  state.selectedMachine='';
  const sel=document.getElementById('machineSelect');
  if(sel) sel.value='';
  services.render();
}

