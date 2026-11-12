/** Módulo: domain/production.js */

import { state } from '../core/state.js';

import { MACHINES, MACHINE_TARGETS, iso, parseKg, parseLocalDate } from './machines.js';

state.finData = {
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

state.dashRefDate = iso(new Date());

// fecha de referencia del dashboard

export function periodRange(period, refDate){
  const ref=parseLocalDate(refDate||state.dashRefDate);
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

export function periodMinutes(period, refDate){
  const {start,end}=periodRange(period, refDate);
  return Math.max(1, Math.round((end-start)/60000)+1);
}

export function eventDate(ev){
  return parseLocalDate(ev.date);
}

export function eventsInPeriod(machineId, period, areaOnly, refDate){
  const {start,end}=periodRange(period, refDate||state.dashRefDate);
  const scopeIds = new Set(MACHINES());
  return state.db.events.filter(x=>{
    if(machineId && x.machine!==machineId) return false;
    if(!machineId && state.selectedMachine && x.machine!==state.selectedMachine) return false;
    if(areaOnly && !scopeIds.has(x.machine)) return false;
    const d=eventDate(x);
    return d>=start && d<=end;
  });
}

export function downtimeMinutes(evs){ return evs.reduce((a,x)=>a+(Number(x.minutes)||0),0); }

export function productionFromEvents(evs){
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
      const fromDb=state.db.machines?.find(m=>m.id===machine);
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

export function productionHybrid(evs){
  const reported=productionFromEvents(evs);
  const estimated=productionFromCapacityAndDowntime(evs);
  // Si hay kg reportados en el periodo, prioriza reporte; si no, usa estimación por capacidad×paro
  const useReported=reported.target>0 || reported.waste>0;
  return {
    ... (useReported?reported:estimated),
    reported, estimated, useReported
  };
}

