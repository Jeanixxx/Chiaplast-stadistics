/** Módulo: features/meals.js */

import { state } from '../core/state.js';

import { esc, save, toast } from '../core/ui.js';

import { iso } from '../domain/machines.js';

// ================= ROL DE COMIDAS (rotación de tienda) =================

const MEAL_DIAS=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

const MEAL_ABBR=['LUN','MAR','MIE','JUE','VIE','SAB','DOM'];

function mPad(n){return n<10?'0'+n:''+n}

function mParseISO(s){const p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2])}

function mAddDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n)}

function mNumDia(d){const g=d.getDay();return g===0?7:g}

export function mProximoLunes(){const hoy=new Date();const n=mNumDia(hoy);const diff=n===1?0:(8-n);return mAddDays(new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate()),diff)}

export function mToDisplay(s){if(!s)return'—';const p=s.split('-');return p[2]+'/'+p[1]+'/'+p[0]}

export function showMealTab(name,btn){
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

export function generarSemanaComidas(){
 const lunesStr=document.getElementById('m_lunes').value;
 if(!lunesStr){toast('Elige la fecha del lunes');return;}
 const numSemana=Number(document.getElementById('m_semana').value);
 const lunes=mParseISO(lunesStr);
 const activos=state.db.meal.employees.filter(e=>e.activo);
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
 state.db.meal.semanaActual=semana;save();renderMealBoard();renderMealEmpleados();
 toast(relajado?'Semana generada (hubo que repetir a alguien: no alcanzó personal disponible)':'Semana generada, nadie se repite');
}

export function renderMealBoard(){
 const card=document.getElementById('mealBoardCard');const board=document.getElementById('mealBoard');
 if(!state.db.meal.semanaActual||!state.db.meal.semanaActual.length){card.style.display='none';return}
 card.style.display='block';
 board.innerHTML=state.db.meal.semanaActual.map(d=>`<div class="machine-tile"><strong>${esc(d.dia)}</strong><small>${mToDisplay(d.fecha)}</small>
  <div class="mt" style="font-size:12px"><span class="muted">AM:</span> ${esc(d.manana)}</div>
  <div style="font-size:12px"><span class="muted">PM:</span> ${esc(d.tarde)}</div></div>`).join('');
}

export function archivarSemanaComidas(){
 if(!state.db.meal.semanaActual||!state.db.meal.semanaActual.length){toast('No hay semana generada');return}
 state.db.meal.semanaActual.forEach(d=>{
  if(d.manana!=='SIN DISPONIBLE')state.db.meal.historial.push({fecha:d.fecha,dia:d.dia,turno:'Mañana',empleado:d.manana});
  if(d.tarde!=='SIN DISPONIBLE')state.db.meal.historial.push({fecha:d.fecha,dia:d.dia,turno:'Tarde',empleado:d.tarde});
 });
 state.db.meal.semanaActual=[];save();renderMealBoard();renderMealHistorial();toast('Semana guardada en historial');
}

export function limpiarSemanalComidas(){
 if(!confirm('¿Poner en No el turno de noche y vaciar las ausencias de todos?'))return;
 state.db.meal.employees.forEach(e=>{e.turnoNoche=false;e.ausencias='';});save();renderMealEmpleados();toast('Datos semanales limpiados');
}

export function agregarEmpleadoComida(){
 const nombre=document.getElementById('m_nombre').value.trim();
 if(!nombre){toast('Escribe un nombre');return}
 const grupo=document.getElementById('m_grupo').value;
 const id=state.db.meal.config.nextId||(Math.max(0,...state.db.meal.employees.map(e=>e.id))+1);
 state.db.meal.employees.push({id,nombre,grupo,turnoNoche:false,enCapacitacion:false,ausencias:'',ultimaFecha:'',vecesAsignado:0,activo:true});
 state.db.meal.config.nextId=id+1;document.getElementById('m_nombre').value='';
 save();renderMealEmpleados();toast('Empleado agregado');
}

export function renderMealEmpleados(){
 const activos=state.db.meal.employees.filter(e=>e.activo);
 const noche=activos.filter(e=>e.turnoNoche).length,cap=activos.filter(e=>e.enCapacitacion).length;
 const st=document.getElementById('mealStats');
 if(st)st.innerHTML=`<div class="card kpi"><div class="label">Activos</div><div class="value">${activos.length}</div></div>
  <div class="card kpi"><div class="label">Turno noche</div><div class="value">${noche}</div></div>
  <div class="card kpi"><div class="label">En capacitación</div><div class="value">${cap}</div></div>
  <div class="card kpi"><div class="label">Registros historial</div><div class="value">${state.db.meal.historial.length}</div></div>`;
 document.getElementById('mealEmpTable').innerHTML=state.db.meal.employees.map(e=>`<tr>
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

export function mealSetField(id,field,value){const e=state.db.meal.employees.find(x=>x.id===id);if(!e)return;e[field]=value;save();if(field==='turnoNoche'||field==='enCapacitacion'||field==='activo')renderMealEmpleados();}

export function mealEliminarEmpleado(id){const e=state.db.meal.employees.find(x=>x.id===id);if(!e)return;if(!confirm(`¿Eliminar a ${e.nombre} de la lista? Su historial ya guardado no se borra.`))return;state.db.meal.employees=state.db.meal.employees.filter(x=>x.id!==id);save();renderMealEmpleados();}

export function agregarHistorialComida(){
 const fecha=document.getElementById('mh_fecha').value,turno=document.getElementById('mh_turno').value,nombre=document.getElementById('mh_nombre').value.trim();
 if(!fecha||!nombre){toast('Completa fecha y nombre');return}
 const d=mParseISO(fecha);
 state.db.meal.historial.push({fecha,dia:MEAL_DIAS[mNumDia(d)-1],turno,empleado:nombre});
 document.getElementById('mh_nombre').value='';save();renderMealHistorial();renderMealEmpleados();toast('Agregado al historial');
}

export function recalcularComidas(){
 if(!confirm('Esto recalcula "última fecha" y "veces asignado" de todos usando el historial. ¿Continuar?'))return;
 state.db.meal.employees.forEach(e=>{
  const nombre=e.nombre.trim().toUpperCase();
  const regs=state.db.meal.historial.filter(r=>(r.empleado||'').trim().toUpperCase()===nombre);
  if(regs.length>0){e.vecesAsignado=regs.length;e.ultimaFecha=regs.reduce((max,r)=>r.fecha>max?r.fecha:max,regs[0].fecha);}
  else e.vecesAsignado=0;
 });
 save();renderMealEmpleados();renderMealHistorial();toast('Recalculado desde el historial');
}

export function mealEliminarHistorial(idx){if(!confirm('¿Eliminar este registro del historial?'))return;state.db.meal.historial.splice(idx,1);save();renderMealHistorial();renderMealEmpleados();}

export function renderMealHistorial(){
 const filas=state.db.meal.historial.map((r,i)=>({...r,_idx:i})).sort((a,b)=>(b.fecha+b.turno).localeCompare(a.fecha+a.turno));
 document.getElementById('mealHistTable').innerHTML=filas.map(r=>`<tr><td>${mToDisplay(r.fecha)}</td><td>${esc(r.dia)}</td><td>${esc(r.turno)}</td><td>${esc(r.empleado)}</td><td><button class="btn red" onclick="mealEliminarHistorial(${r._idx})">✕</button></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Todavía no hay registros</td></tr>';
 const conteo=state.db.meal.employees.map(e=>{const n=e.nombre.trim().toUpperCase();const veces=state.db.meal.historial.filter(r=>(r.empleado||'').trim().toUpperCase()===n).length;return{nombre:e.nombre,veces}}).sort((a,b)=>b.veces-a.veces);
 document.getElementById('mealResumenTable').innerHTML=conteo.map(c=>`<tr><td>${esc(c.nombre)}</td><td>${c.veces}</td></tr>`).join('');
 const dl=document.getElementById('mealNombres');if(dl)dl.innerHTML=state.db.meal.employees.map(e=>`<option value="${esc(e.nombre)}">`).join('');
}

