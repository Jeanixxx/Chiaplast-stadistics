/** Módulo: features/financial.js */
import { services } from '../core/services.js';
import { jsPDF } from '../vendor.js';
import { Chart } from '../vendor.js';

import { state } from '../core/state.js';

import { esc, saveFinConfig, toast } from '../core/ui.js';

import { MACHINES, iso } from '../domain/machines.js';

import { downtimeMinutes, eventsInPeriod } from '../domain/production.js';


// ================= JUSTIFICACIÓN FINANCIERA DE COMPRAS =================

export function fillFinMachineSelect(){
  const sel=document.getElementById('finMachine');
  if(!sel) return;
  const cur=sel.value||window._finMachinePref||'';
  const ids=MACHINES();
  sel.innerHTML='<option value="">(Elegir máquina)</option>'+ids.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join('');
  if(cur && [...sel.options].some(o=>o.value===cur)) sel.value=cur;
  else if(state.selectedMachine && ids.includes(state.selectedMachine)) sel.value=state.selectedMachine;
  window._finMachinePref=undefined;
}

export function onFinMachineChange(){
  const m=document.getElementById('finMachine')?.value||'';
  if(m) usarHorasRealesFin(false);
  else renderFinanciero();
  saveFinConfig();
}

export function usarHorasRealesFin(showToast){
  const machine=document.getElementById('finMachine')?.value||state.selectedMachine||'';
  if(!machine){
    if(showToast!==false) toast('Selecciona una máquina para usar horas reales','err');
    return;
  }
  const period=services.getDashPeriod();
  const evs=eventsInPeriod(machine, period, false, state.dashRefDate);
  const mins=downtimeMinutes(evs);
  const hours=+(mins/60).toFixed(2);
  const el=document.getElementById('finHorasHombre');
  if(el){
    el.value=hours>0?Math.max(hours,0.5):8;
    el.style.transition='background-color .5s';
    el.style.backgroundColor='#dcfce7';
    setTimeout(()=>{ el.style.backgroundColor=''; },1500);
  }
  if(showToast!==false){
    toast(hours>0?(hours+' h reales · '+evs.length+' evento(s) en el periodo'):'Sin paros en el periodo; se usan 8 h por defecto');
  }
  renderFinanciero();
}

export function renderFinanciero(){
  services.fillFinMachineSelect();
  const machine=document.getElementById('finMachine')?.value||'';
  const costoRefaccion=Number(document.getElementById('finCostoRefaccion')?.value)||0;
  const horasHombre=Number(document.getElementById('finHorasHombre')?.value)||0;
  const costoHora=Number(document.getElementById('finCostoHora')?.value)||0;
  const perdidaProdHora=Number(document.getElementById('finPerdidaProd')?.value)||0;
  const multas=Number(document.getElementById('finMultas')?.value)||0;

  const costoHombre=horasHombre*costoHora;
  const perdidaProduccion=perdidaProdHora*horasHombre;
  const costoTotal=costoRefaccion+costoHombre+perdidaProduccion+multas;
  const ahorro=Math.max(0, costoTotal-costoRefaccion);
  const porcentajeAhorro=costoTotal>0?((ahorro/costoTotal)*100):0;

  const kpisEl=document.getElementById('finKpis');
  if(kpisEl){
    kpisEl.innerHTML=[
      ['Costo refacción','$'+costoRefaccion.toLocaleString('es-MX'),'Inversión en stock','Costo estimado de comprar/tener la refacción en inventario'],
      ['Horas hombre','$'+costoHombre.toLocaleString('es-MX'),horasHombre+' h × $'+costoHora.toLocaleString('es-MX'),'Mano de obra durante la intervención por la falla'],
      ['Producción perdida','$'+perdidaProduccion.toLocaleString('es-MX'),'$'+perdidaProdHora.toLocaleString('es-MX')+'/h × '+horasHombre+' h','Valor de la producción no realizada por el paro'],
      ['COSTO TOTAL REAL','$'+costoTotal.toLocaleString('es-MX'),porcentajeAhorro.toFixed(1)+'% más que solo la refacción','Costo total de NO tener la refacción a tiempo']
    ].map((x,i)=>`<div class="card kpi" title="${esc(x[3])}"${i===3?' style="border:2px solid var(--red)"':''}><div class="label">${x[0]}</div><div class="value"${i===3?' style="color:var(--red);font-size:22px"':''}>${x[1]}</div><div class="sub">${x[2]}</div><div class="hint">${esc(x[3])}</div></div>`).join('');
  }

  renderWaterfall(costoRefaccion, costoHombre, perdidaProduccion, multas, costoTotal);
  renderStackedBar(costoRefaccion, costoHombre, perdidaProduccion, multas, costoTotal);
  renderAreaChart(perdidaProdHora, horasHombre);
  saveFinConfig();

  const items=[
    ['Refacción',costoRefaccion],
    ['Horas hombre',costoHombre],
    ['Producción perdida',perdidaProduccion],
    ['Multas / penalizaciones',multas]
  ];
  const tbody=document.getElementById('finDetalleTable');
  if(tbody){
    tbody.innerHTML=items.map(([c,v])=>{
      const pct=costoTotal>0?((v/costoTotal)*100).toFixed(1):'0.0';
      return `<tr><td>${esc(c)}</td><td>$${v.toLocaleString('es-MX')}</td><td>${pct}%</td></tr>`;
    }).join('');
  }
  const setTxt=(id,t)=>{ const el=document.getElementById(id); if(el) el.textContent=t; };
  setTxt('finTotalDisplay','$'+costoTotal.toLocaleString('es-MX'));
  setTxt('finComparacionDisplay','+'+porcentajeAhorro.toFixed(1)+'% vs. refacción');
  setTxt('finCostoHoraDisplay','$'+perdidaProdHora.toLocaleString('es-MX'));
  setTxt('finAhorroDisplay','$'+ahorro.toLocaleString('es-MX'));
  setTxt('finAhorroPctDisplay',porcentajeAhorro.toFixed(1)+'%');
  const pctRec=costoTotal>0?((costoRefaccion/costoTotal)*100):0;
  setTxt('finRecomendacionPct',pctRec.toFixed(1)+'%');
  const badge=document.getElementById('finRecomendacionBadge');
  if(badge){
    badge.textContent=pctRec<20?'URGENTE':pctRec<40?'ATENCIÓN':'VIABLE';
    badge.className='badge '+(pctRec<20?'b-bad':pctRec<40?'b-warn':'b-ok');
  }

  state.finData={machine,costoRefaccion,horasHombre,costoHora,perdidaProdHora,multas,costoTotal,ahorro,porcentajeAhorro};
}

function renderWaterfall(costoRef, costoHH, costoProd, multas, total){
  const ctx=document.getElementById('waterfallChart');
  if(!ctx) return;
  if(state.finCharts.waterfall){ try{state.finCharts.waterfall.destroy()}catch{} }
  if(total<=0 && costoRef<=0 && costoHH<=0 && costoProd<=0 && multas<=0){
    state.finCharts.waterfall=new Chart(ctx,{
      type:'bar',
      data:{labels:['Sin datos'],datasets:[{data:[0],backgroundColor:'#94a3b8'}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},title:{display:true,text:'Configura los costos para ver el análisis'}}}
    });
    return;
  }
  const labels=['Refacción','Horas hombre','Prod. perdida','Multas','TOTAL'];
  const increments=[costoRef,costoHH,costoProd,multas,total];
  const colors=['#22c55e','#f59e0b','#f97316','#ef4444','#dc2626'];
  let run=0;
  const base=[], rise=[];
  for(let i=0;i<4;i++){
    base.push(run);
    rise.push(increments[i]);
    run+=increments[i];
  }
  base.push(0);
  rise.push(total);
  state.finCharts.waterfall=new Chart(ctx,{
    type:'bar',
    data:{
      labels,
      datasets:[
        {label:'base',data:base,backgroundColor:'transparent',stack:'w',borderWidth:0},
        {label:'Costo',data:rise,backgroundColor:colors,stack:'w',borderRadius:4}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:c=>{
          if(c.datasetIndex===0) return null;
          return '$'+Number(c.raw||0).toLocaleString('es-MX');
        }}}
      },
      scales:{
        x:{stacked:true},
        y:{stacked:true,beginAtZero:true,ticks:{callback:v=>'$'+Number(v).toLocaleString('es-MX')}}
      }
    }
  });
}

function renderStackedBar(costoRef, costoHH, costoProd, multas, total){
  const ctx=document.getElementById('stackedBarChart');
  if(!ctx) return;
  if(state.finCharts.stacked){ try{state.finCharts.stacked.destroy()}catch{} }
  state.finCharts.stacked=new Chart(ctx,{
    type:'bar',
    data:{
      labels:['Escenario falla\n(sin stock)','Escenario óptimo\n(refacción en stock)'],
      datasets:[
        {label:'Refacción',data:[costoRef,costoRef],backgroundColor:'#22c55e',borderRadius:4},
        {label:'Horas hombre',data:[costoHH,0],backgroundColor:'#f59e0b',borderRadius:4},
        {label:'Prod. perdida',data:[costoProd,0],backgroundColor:'#f97316',borderRadius:4},
        {label:'Multas',data:[multas,0],backgroundColor:'#ef4444',borderRadius:4}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:'bottom'},
        tooltip:{callbacks:{label:c=>c.dataset.label+': $'+Number(c.raw||0).toLocaleString('es-MX')}}
      },
      scales:{
        x:{stacked:true},
        y:{stacked:true,beginAtZero:true,ticks:{callback:v=>'$'+Number(v).toLocaleString('es-MX')}}
      }
    }
  });
}

function renderAreaChart(perdidaHora, horas){
  const ctx=document.getElementById('areaChart');
  if(!ctx) return;
  if(state.finCharts.area){ try{state.finCharts.area.destroy()}catch{} }
  const horasMax=Math.max(Math.ceil(horas*1.5)||12, 12);
  const labels=[], data=[];
  for(let h=0;h<=horasMax;h++){
    labels.push(h+'h');
    data.push(perdidaHora*h);
  }
  state.finCharts.area=new Chart(ctx,{
    type:'line',
    data:{
      labels,
      datasets:[{
        label:'Pérdida acumulada (MXN)',
        data,
        fill:true,
        backgroundColor:'rgba(239,68,68,0.28)',
        borderColor:'#dc2626',
        borderWidth:3,
        tension:0.25,
        pointRadius:2
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:c=>'$'+Number(c.raw||0).toLocaleString('es-MX')}}
      },
      scales:{
        y:{beginAtZero:true,ticks:{callback:v=>'$'+Number(v).toLocaleString('es-MX')}},
        x:{title:{display:true,text:'Horas de paro',font:{size:11}}}
      }
    }
  });
}

export async function exportarFinancieroPDF(){
  try{
    renderFinanciero();
    await new Promise(r=>setTimeout(r,120));
      const doc=new jsPDF({unit:'pt',format:'a4'});
    const W=doc.internal.pageSize.getWidth();
    let y=50;
    doc.setFontSize(16);
    doc.text('Analisis financiero - Justificacion de compras',40,y); y+=22;
    doc.setFontSize(11);
    doc.text('Maquina: '+(state.finData.machine||'—')+'  |  Fecha: '+new Date().toLocaleDateString('es-MX'),40,y); y+=20;
    doc.text('Periodo ref.: '+services.getDashPeriod()+' · '+state.dashRefDate,40,y); y+=28;
    doc.setFontSize(12);
    doc.text('Desglose de costos',40,y); y+=18;
    doc.setFontSize(10);
    const rows=[
      ['Refaccion','$'+state.finData.costoRefaccion.toLocaleString('es-MX')],
      ['Horas hombre ('+state.finData.horasHombre+' h x $'+state.finData.costoHora+')','$'+(state.finData.horasHombre*state.finData.costoHora).toLocaleString('es-MX')],
      ['Produccion perdida','$'+(state.finData.perdidaProdHora*state.finData.horasHombre).toLocaleString('es-MX')],
      ['Multas','$'+state.finData.multas.toLocaleString('es-MX')],
      ['COSTO TOTAL REAL','$'+state.finData.costoTotal.toLocaleString('es-MX')]
    ];
    rows.forEach(([a,b],i)=>{
      if(i===4) doc.setFont(undefined,'bold');
      doc.text(a,40,y); doc.text(b,W-160,y); y+=16;
      doc.setFont(undefined,'normal');
    });
    y+=12;
    const chartIds=['waterfallChart','stackedBarChart','areaChart'];
    for(const id of chartIds){
      const canvas=document.getElementById(id);
      if(!canvas) continue;
      try{
        if(y>520){ doc.addPage(); y=50; }
        const img=canvas.toDataURL('image/png');
        const h=Math.min(220,(W-80)*0.45);
        doc.setFontSize(11); doc.text(id.replace('Chart',''),40,y); y+=8;
        doc.addImage(img,'PNG',40,y,W-80,h);
        y+=h+16;
      }catch(e){ console.warn('No se pudo embeber',id,e); }
    }
    if(y>720){ doc.addPage(); y=50; }
    const pct=state.finData.costoTotal>0?((state.finData.costoRefaccion/state.finData.costoTotal)*100).toFixed(1):'0';
    doc.setFontSize(11);
    doc.text('Recomendacion: la refaccion representa el '+pct+'% del costo total de falla.',40,y); y+=16;
    doc.text('Ahorro estimado al tener stock: $'+state.finData.ahorro.toLocaleString('es-MX')+' por evento.',40,y);
    doc.save('justificacion_compras_'+(state.finData.machine||'general')+'_'+iso(new Date())+'.pdf');
    toast('PDF con gráficas generado');
  }catch(err){
    console.error(err);
    toast('Error al generar PDF','err');
  }
}

export function copiarFinanciero(){
  const texto=`ANALISIS FINANCIERO - JUSTIFICACION DE COMPRAS
=============================================
Maquina: ${state.finData.machine||'—'}
Fecha: ${new Date().toLocaleDateString('es-MX')}
Periodo: ${services.getDashPeriod()} · ${state.dashRefDate}

DESGLOSE:
- Refaccion: $${state.finData.costoRefaccion.toLocaleString('es-MX')}
- Horas hombre (${state.finData.horasHombre} h x $${state.finData.costoHora}): $${(state.finData.horasHombre*state.finData.costoHora).toLocaleString('es-MX')}
- Produccion perdida: $${(state.finData.perdidaProdHora*state.finData.horasHombre).toLocaleString('es-MX')}
- Multas: $${state.finData.multas.toLocaleString('es-MX')}
---------------------------------------------
COSTO TOTAL REAL: $${state.finData.costoTotal.toLocaleString('es-MX')}

RECOMENDACION:
La refaccion es el ${state.finData.costoTotal>0?((state.finData.costoRefaccion/state.finData.costoTotal)*100).toFixed(1):0}% del costo total de falla.
Ahorro estimado con stock preventivo: $${state.finData.ahorro.toLocaleString('es-MX')} por evento.`;
  if(navigator.clipboard?.writeText){
    navigator.clipboard.writeText(texto).then(()=>toast('Resumen copiado')).catch(()=>fallbackCopy(texto));
  } else fallbackCopy(texto);
}

function fallbackCopy(texto){
  const ta=document.createElement('textarea');
  ta.value=texto; document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); toast('Resumen copiado'); }catch{ toast('No se pudo copiar','err'); }
  document.body.removeChild(ta);
}

