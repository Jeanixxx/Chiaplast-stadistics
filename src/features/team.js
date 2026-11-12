/** Módulo: features/team.js */

import { state } from '../core/state.js';

import { badge, esc, save, toast } from '../core/ui.js';

import { iso, parseLocalDate } from '../domain/machines.js';

import { periodRange } from '../domain/production.js';

import { renderMealEmpleados } from './meals.js';

import { closeModal } from '../ui/modals.js';

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
  return (el && el.value) ? el.value : state.dashRefDate;
}

export function collectPersonJobs(personName, period, refDate){
  const {start,end}=periodRange(period, refDate);
  const jobs=[];
  (state.db.history||[]).forEach(h=>{
    const tech=String(h[4]||'');
    if(personName && tech!==personName) return;
    if(!tech) return;
    const d=parseLocalDate(h[0]);
    if(d<start||d>end) return;
    const wo=(state.db.workOrders||[]).find(w=>w.technician===tech && w.machine===h[2] && String(w.fault||'').slice(0,40)===String(h[3]||'').slice(0,40));
    const mins=wo ? (Number(wo.downtime)||0)*60 : 0;
    const pri=wo ? wo.priority : (String(h[1]||'').toUpperCase().includes('CORRECT')?'Media':'Baja');
    jobs.push({
      date:iso(d), type:h[1]||'Trabajo', machine:h[2]||'', desc:h[3]||'',
      tech:tech, result:h[5]||'', minutes:mins, difficulty:difficultyScore(pri),
      priority:pri, source:'historial'
    });
  });
  (state.db.workOrders||[]).forEach(w=>{
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

export function personStats(jobs){
  const n=jobs.length;
  const mins=jobs.reduce((a,j)=>a+(Number(j.minutes)||0),0);
  const diffSum=jobs.reduce((a,j)=>a+(Number(j.difficulty)||0),0);
  const byType={}, byDiff={1:0,2:0,3:0,4:0};
  jobs.forEach(j=>{ byType[j.type]=(byType[j.type]||0)+1; byDiff[j.difficulty]=(byDiff[j.difficulty]||0)+1; });
  return {count:n, minutes:mins, hours:mins/60, avgDiff:n?diffSum/n:0, diffSum, byType, byDiff};
}

export function renderTeam(){
  const period=getTeamPeriod();
  const ref=getTeamRefDate();
  const {start,end}=periodRange(period, ref);
  const elLab=document.getElementById('teamPeriodLabel');
  if(elLab) elLab.textContent='Analizando: '+iso(start)+(period==='day'?'':' → '+iso(end));
  const refInp=document.getElementById('teamRefDate');
  if(refInp && !refInp.value) refInp.value=ref;

  const openBy={};
  (state.db.workOrders||[]).forEach(w=>{
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

  if(state.charts.teamHours){try{state.charts.teamHours.destroy()}catch(e){}}
  const hctx=document.getElementById('teamHoursChart');
  if(hctx){
    const rk=ranking.slice().sort((a,b)=>a.hours-b.hours);
    state.charts.teamHours=new Chart(hctx,{type:'bar',data:{labels:rk.length?rk.map(p=>p.name):['Sin personal'],datasets:[{label:'Horas',data:rk.length?rk.map(p=>+p.hours.toFixed(2)):[0],backgroundColor:rk.map(p=>p.hours<=0?'#ef4444':p.hours<3?'#f59e0b':'#22c55e')}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,title:{display:true,text:'Horas en el periodo'}}}}});
  }

  const sel=document.getElementById('teamPersonSelect');
  if(sel){
    const cur=sel.value;
    sel.innerHTML=(TEAM()).map(r=>'<option value="'+esc(r[0])+'">'+esc(r[0])+'</option>').join('')||'<option value="">—</option>';
    if(cur && [...sel.options].some(o=>o.value===cur)) sel.value=cur;
  }
  renderPersonAnalysis();
}

export function selectTeamPerson(name){
  const sel=document.getElementById('teamPersonSelect');
  if(sel) sel.value=name;
  const btn=[...document.querySelectorAll('.nav button')].find(b=>b.dataset.view==='equipo');
  if(btn && !document.getElementById('equipo').classList.contains('active')) btn.click();
  renderPersonAnalysis();
}

export function renderPersonAnalysis(){
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

  if(state.charts.personType){try{state.charts.personType.destroy()}catch(e){}}
  const ctx=document.getElementById('personTypeChart');
  if(ctx){
    const labels=Object.keys(st.byType);
    state.charts.personType=new Chart(ctx,{
      type:'doughnut',
      data:{labels:labels.length?labels:['Sin datos'],datasets:[{data:labels.length?Object.values(st.byType):[1],backgroundColor:['#3b82f6','#22c55e','#f59e0b','#a855f7','#ef4444','#06b6d4']}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}
    });
  }
}

export function TEAM(){return state.db.meal.employees.filter(e=>e.activo).map(e=>[e.nombre,e.rol||'Técnico',e.especialidad||'General',0,e.estado||'Disponible']);}

export function teamSetField(name,field,value){const e=state.db.meal.employees.find(x=>x.nombre===name);if(!e)return;e[field]=value;save();renderTeam();}

export function removePerson(i){
  const name=TEAM()[i][0];
  if(!confirm('¿Eliminar a '+name+' de la plantilla? (Esto también lo quita del rol de comidas)')) return;
  state.db.meal.employees=state.db.meal.employees.filter(e=>e.nombre!==name);
  save(); renderTeam(); renderMealEmpleados(); toast('Persona eliminada');
}

export function ensurePerson(name){
  const n=String(name||'').trim();
  if(!n) return;
  if(!state.db.meal.employees.some(e=>e.nombre===n)){
    const id=state.db.meal.config.nextId||(Math.max(0,...state.db.meal.employees.map(e=>e.id))+1);
    state.db.meal.employees.push({id,nombre:n,grupo:'A',turnoNoche:false,enCapacitacion:false,ausencias:'',ultimaFecha:'',vecesAsignado:0,activo:true,rol:'Técnico',especialidad:'General',estado:'Disponible'});
    state.db.meal.config.nextId=id+1;
  }
}

export function savePerson(){
  const n=document.getElementById('per_n').value.trim();
  const r=document.getElementById('per_r').value.trim()||'Técnico';
  const e=document.getElementById('per_e').value.trim()||'General';
  const s=document.getElementById('per_s').value||'Disponible';
  const g=document.getElementById('per_g').value||'A';
  if(!n){toast('Nombre requerido');return;}
  if(state.db.meal.employees.some(x=>x.nombre===n)){toast('Ya existe esa persona');return;}
  const id=state.db.meal.config.nextId||(Math.max(0,...state.db.meal.employees.map(x=>x.id))+1);
  state.db.meal.employees.push({id,nombre:n,grupo:g,turnoNoche:false,enCapacitacion:false,ausencias:'',ultimaFecha:'',vecesAsignado:0,activo:true,rol:r,especialidad:e,estado:s});
  state.db.meal.config.nextId=id+1;
  save(); closeModal(); renderTeam(); renderMealEmpleados(); toast(n+' agregado');
}

