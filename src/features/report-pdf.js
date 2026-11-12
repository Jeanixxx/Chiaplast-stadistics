/** Módulo: features/report-pdf.js */
import { jsPDF } from '../vendor.js';
import { Chart } from '../vendor.js';

import { state } from '../core/state.js';

import { esc, toast } from '../core/ui.js';

import { MACHINES, isAllAreas, iso } from '../domain/machines.js';

import { downtimeMinutes, eventDate, eventsInPeriod, periodMinutes } from '../domain/production.js';

import { mToDisplay } from './meals.js';

import { TEAM, collectPersonJobs, personStats } from './team.js';

import { machineFilter } from './weekly-import.js';


import { getDashPeriod } from '../views/dashboard.js';

import { recomendarRefacciones } from '../views/history.js';

// ================= INFORME PDF =================

export function fillReportMachineSelect(){
  const sel=document.getElementById('reportMachine');
  if(!sel)return;
  const cur=sel.value;
  sel.innerHTML='<option value="">Todas ('+state.currentArea+')</option>'+MACHINES().map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join('');
  if([...sel.options].some(o=>o.value===cur))sel.value=cur;
}

function tempCanvas(w,h){
  const c=document.createElement('canvas');c.width=w;c.height=h;c.style.position='fixed';c.style.left='-9999px';
  document.body.appendChild(c);return c;
}

export async function descargarInforme(){
  const status=document.getElementById('reportStatus');
  if(!status){ toast('No se encontró el panel de informes'); return; }
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
  const period=getDashPeriod(), ref=state.dashRefDate;
  const doc=new jsPDF({unit:'pt',format:'a4'});
  const W=doc.internal.pageSize.getWidth();
  let y=50;
  const ensureSpace=(need)=>{ if(y+need>780){ doc.addPage(); y=50; } };
  const areaTxt=isAllAreas()?'Toda la planta':state.currentArea;
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
    const semana=(state.db.meal.semanaActual&&state.db.meal.semanaActual.length)?state.db.meal.semanaActual:null;
    if(semana){
      semana.forEach(d=>{ensureSpace(14);doc.text(d.dia+' ('+mToDisplay(d.fecha)+')  AM: '+d.manana+'  PM: '+d.tarde,40,y);y+=14;});
    }else{
      const ultimos=(state.db.meal.historial||[]).slice(-14);
      if(!ultimos.length){doc.text('Sin registros de rol de comidas.',40,y);y+=14;}
      else ultimos.forEach(r=>{ensureSpace(14);doc.text(mToDisplay(r.fecha)+' ('+r.dia+') · '+r.turno+' · '+r.empleado,40,y);y+=14;});
    }
    y+=8;
  }

  if(incPm){
    ensureSpace(80);
    doc.setFontSize(13);doc.text('Plantilla / planes preventivos',40,y);y+=16;
    doc.setFontSize(10);
    const pms=(state.db.pm||[]).filter(p=>!machine||p[0]===machine).slice(0,25);
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

