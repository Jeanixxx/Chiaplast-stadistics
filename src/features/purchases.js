/** Módulo: features/purchases.js */
import { Chart } from '../vendor.js';

import { state } from '../core/state.js';

import { esc, save, toast } from '../core/ui.js';

import { iso } from '../domain/machines.js';

// ================= NEGLIGENCIA DE COMPRAS =================

export function fillNegligenciaMachineSelect(){
  const sel=document.getElementById('ng_m');
  if(!sel)return;
  sel.innerHTML=state.db.machines.map(m=>`<option value="${esc(m.id)}">${esc(m.id)}</option>`).join('');
}

export function agregarNegligencia(){
  const fecha=document.getElementById('ng_fecha')?.value||iso(new Date());
  const machine=document.getElementById('ng_m')?.value;
  const pieza=(document.getElementById('ng_pieza')?.value||'').trim();
  const jefe=(document.getElementById('ng_jefe')?.value||'').trim();
  const horas=Number(document.getElementById('ng_horas')?.value)||0;
  const just=(document.getElementById('ng_just')?.value||'').trim();
  if(!machine){toast('Selecciona una máquina');return;}
  if(!pieza||!jefe){toast('Escribe la pieza y el responsable');return;}
  if(horas<=0){toast('Indica las horas paradas (mayor a 0)');return;}
  state.db.negligencia.push({fecha,machine,pieza,jefe,horas,just});
  state.db.history.unshift([fecha,'Gestión financiera integrada',machine,pieza+' — '+just,jefe,horas+' h perdidas']);
  const elP=document.getElementById('ng_pieza'); if(elP) elP.value='';
  const elJ=document.getElementById('ng_jefe'); if(elJ) elJ.value='';
  const elH=document.getElementById('ng_horas'); if(elH) elH.value=0;
  const elJust=document.getElementById('ng_just'); if(elJust) elJust.value='';
  save();renderNegligencia();toast('Registro guardado');
}

export function negligenciaEliminar(i){if(!confirm('¿Eliminar este registro?'))return;state.db.negligencia.splice(i,1);save();renderNegligencia();}

export function renderNegligencia(){
  fillNegligenciaMachineSelect();
  document.getElementById('negligenciaTable').innerHTML=state.db.negligencia.map((r,i)=>`<tr><td>${esc(r.fecha)}</td><td>${esc(r.machine)}</td><td>${esc(r.pieza)}</td><td>${esc(r.jefe)}</td><td>${r.horas}</td><td style="max-width:260px">${esc(r.just)}</td><td><button class="btn red" onclick="negligenciaEliminar(${i})">✕</button></td></tr>`).join('')||'<tr><td colspan="7" class="empty">Sin registros</td></tr>';
  const porJefe={},porMaquina={};
  state.db.negligencia.forEach(r=>{porJefe[r.jefe]=(porJefe[r.jefe]||0)+r.horas;porMaquina[r.machine]=(porMaquina[r.machine]||0)+r.horas;});
  if(state.charts.ngJefe){try{state.charts.ngJefe.destroy()}catch{}}
  if(state.charts.ngMaquina){try{state.charts.ngMaquina.destroy()}catch{}}
  const j=Object.entries(porJefe).sort((a,b)=>b[1]-a[1]);
  const m=Object.entries(porMaquina).sort((a,b)=>b[1]-a[1]);
  state.charts.ngJefe=new Chart(document.getElementById('negligenciaJefeChart'),{type:'bar',data:{labels:j.length?j.map(x=>x[0]):['Sin datos'],datasets:[{label:'Horas perdidas',data:j.length?j.map(x=>x[1]):[0],backgroundColor:'#a855f7'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
  state.charts.ngMaquina=new Chart(document.getElementById('negligenciaMaquinaChart'),{type:'bar',data:{labels:m.length?m.map(x=>x[0]):['Sin datos'],datasets:[{label:'Horas perdidas',data:m.length?m.map(x=>x[1]):[0],backgroundColor:'#ef4444'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
}

