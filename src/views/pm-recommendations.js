/** Módulo: views/pm-recommendations.js */

import { state } from '../core/state.js';

import { esc } from '../core/ui.js';

import { eventsInPeriod } from '../domain/production.js';

// ================= RECOMENDACIONES AUTOMÁTICAS DE PREVENTIVO =================

export function renderPmRecommendations(){
  const period=document.getElementById('pmRecoPeriod')?.value||'month';
  const evs=eventsInPeriod(null,period,true,state.dashRefDate);
  const byM={};
  evs.forEach(x=>{if(!byM[x.machine])byM[x.machine]={events:0,minutes:0};byM[x.machine].events++;byM[x.machine].minutes+=(Number(x.minutes)||0);});
  const ranked=Object.entries(byM).map(([m,v])=>({m,...v})).sort((a,b)=>b.minutes-a.minutes).slice(0,6);
  const list=state.db.keywords||[];
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

