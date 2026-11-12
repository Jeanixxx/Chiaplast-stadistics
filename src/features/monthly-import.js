/** Módulo: features/monthly-import.js */
import { services } from '../core/services.js';

import { state } from '../core/state.js';

import { badge, esc, toast } from '../core/ui.js';

import { camposClasificacion } from '../domain/failure-classifier.js';

import { MACHINE_TARGETS, iso } from '../domain/machines.js';

import { ensurePerson } from './team.js';

import { durationToHours, durationToMinutes, normalizeMachine, parseDuration } from './weekly-import.js';


// ================= REPORTE MENSUAL =================

const MESES_ES = {
  'enero':1,'febrero':2,'marzo':3,'abril':4,'mayo':5,'junio':6,
  'julio':7,'agosto':8,'septiembre':9,'setiembre':9,'octubre':10,'noviembre':11,'diciembre':12
};

function parseSpanishDate(str){
  const s=String(str||'').trim().toLowerCase()
    .replace(/\s+/g,' ')
    .replace(/[ºª]/g,'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,''); // quita acentos
  // "1 de agosto de 2026" / "01 de agosto 2026" / "1 agosto 2026"
  let m=s.match(/^(\d{1,2})\s*(?:de\s+)?([a-z]+)\s*(?:de\s+)?(\d{4})$/);
  if(m){
    const day=+m[1];
    const mon=MESES_ES[m[2]];
    const year=+m[3];
    if(mon && day>=1 && day<=31) return iso(new Date(year, mon-1, day, 12, 0, 0));
  }
  // fallback YYYY-MM-DD o DD/MM/YYYY
  if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m) return iso(new Date(+m[3], +m[2]-1, +m[1], 12, 0, 0));
  return null;
}

function parseMonthlyRows(text){
  return String(text||'')
    .split(/\r?\n/)
    .map(x=>x.trimEnd())
    .filter(x=>x.trim())
    .map((line,index)=>{
      // Prefer tab, else 2+ spaces
      let cols = line.includes('\t') ? line.split('\t') : line.split(/\s{2,}/);
      // Si se pegó con un solo espacio entre campos, intentar separar por patrones conocidos
      if(cols.length < 4){
        // Heurística: fecha al inicio, luego tipo (MAYÚSCULAS), máquina (código), resto descripción + horas
        const alt = line.match(/^(.+?)\s+(CORRECTIVO|PREVENTIVO|EVENTO|FALLA|APAG[OÓ]N|E-STOP|ALARMA)?\s*([A-Z0-9][\w\- ]*?[A-Z0-9\d])?\s+(.+?)(?:\s+(\d{1,2}:\d{2}\s*(?:a\.?\s*m\.?|p\.?\s*m\.?)?)\s+(\d{1,2}:\d{2}\s*(?:a\.?\s*m\.?|p\.?\s*m\.?)?)?\s+(\d{1,2}:\d{2}))?$/i);
        if(alt){
          cols = [alt[1]||'', alt[2]||'', alt[3]||'', alt[4]||'', alt[5]||'', alt[6]||'', alt[7]||''];
        }
      }
      const c = cols.map(x=>String(x||'').trim());
      const dateRaw = c[0]||'';
      const dateIso = parseSpanishDate(dateRaw) || '';
      const type = (c[1]||'').toUpperCase() || (c[3] ? 'EVENTO' : 'NOTA');
      const rawMachine = c[2]||'';
      const machine = rawMachine ? normalizeMachine(rawMachine) : 'SIN ASIGNAR';
      // Si la descripción quedó vacía pero hay texto en columnas posteriores, juntar
      let description = c[3]||'';
      let start = c[4]||'', end = c[5]||'', duration = c[6]||'';
      // Casos donde tipo/máquina vacíos y la descripción está en col 1 o 2
      if(!c[1] && !c[2] && c[3]===''){
        // "2 de agosto de 2026			maquinas en reposo			00:00"
        // tras split por tabs: [fecha, '', '', 'maquinas...', '', '', '00:00'] o similar
        description = c.find((v,i)=>i>0 && v && !/^\d{1,2}:\d{2}/.test(v) && !/a\.?\s*m\.?|p\.?\s*m\.?/i.test(v)) || description;
        duration = c.find(v=>/^\d{1,2}:\d{2}$/.test(v)) || duration;
      }
      // Ajuste: a veces la descripción arrastra horas si no había tabs
      if(!duration){
        const dm = description.match(/(\d{1,2}:\d{2})\s*$/);
        if(dm){ duration=dm[1]; description=description.replace(/\s*\d{1,2}:\d{2}\s*$/,'').trim(); }
      }
      return {
        row: String(index+1),
        dateRaw,
        date: dateIso,
        type,
        rawMachine,
        machine,
        description: description || (type==='NOTA' ? 'Sin descripción' : ''),
        start,
        end,
        duration
      };
    });
}

export function previewMonthlyImport(){
  const rows=parseMonthlyRows(document.getElementById('monthlyPaste').value);
  const box=document.getElementById('monthlyPreview');
  if(!rows.length){
    box.innerHTML='<div class="notice">No se encontraron filas para analizar.</div>';
    return;
  }
  let ok=0, warn=0;
  const issues=[];
  const rowStatus=rows.map((r,i)=>{
    const miss=[];
    if(!r.date) miss.push('fecha');
    if(!r.machine || r.machine==='SIN ASIGNAR') miss.push('máquina');
    if(!r.description) miss.push('descripción');
    if(!r.duration) miss.push('duración');
    else {
      const pd=parseDuration(r.duration);
      if(!pd.ok) miss.push('duración ilegible ("'+r.duration+'")');
    }
    if(miss.length){ warn++; issues.push('Fila '+(r.row||i+1)+': '+miss.join(', ')); }
    else ok++;
    return miss;
  });
  const head=warn
    ? `<div class="notice"><strong>Indicador:</strong> ${ok} correctas · ${warn} con observaciones · ${rows.length} filas detectadas</div>`
    : `<div class="success"><strong>✓ Indicador:</strong> ${ok}/${rows.length} filas correctas — listo para importar</div>`;
  box.innerHTML=`
    ${head}
    <div style="overflow:auto;margin-top:10px">
      <table>
        <thead><tr><th>#</th><th>Fecha</th><th>Tipo</th><th>Equipo original</th><th>Máquina</th><th>Descripción</th><th>Inicio</th><th>Fin</th><th>Duración</th><th>Estado</th></tr></thead>
        <tbody>
          ${rows.map((r,i)=>{
            const miss=rowStatus[i];
            const st=miss.length?`<span class="badge b-warn">Incompleto</span>`:`<span class="badge b-ok">OK</span>`;
            return `<tr>
            <td>${esc(r.row)}</td>
            <td>${r.date?esc(r.date):'<span class="badge b-bad">'+esc(r.dateRaw)+'</span>'}</td>
            <td>${badge(r.type)}</td>
            <td>${esc(r.rawMachine||'—')}</td>
            <td><strong>${esc(r.machine)}</strong></td>
            <td>${esc(r.description)}</td>
            <td>${esc(r.start)}</td>
            <td>${esc(r.end)}</td>
            <td>${esc(r.duration)}</td>
            <td>${st}</td>
          </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="muted" style="font-size:11px;margin-top:10px">
      <strong>Cómo se interpreta:</strong> OK = fecha, máquina, descripción y duración legibles.
      Incompleto = falta campo o duración no legible (puedes importar igual; las filas sin fecha se omiten al importar).
      Los kg desperdiciados del periodo se estiman con <em>capacidad diaria de la máquina × (minutos de paro / 1440)</em> cuando no hay Dato1/Dato2 del reporte diario.
      ${issues.length?`<br><br><strong>Detalle:</strong><br>${issues.slice(0,15).map(esc).join('<br>')}${issues.length>15?'<br>…':''}`:''}
    </div>`;
}

export function importMonthlyReport(){
  const rows=parseMonthlyRows(document.getElementById('monthlyPaste').value);
  if(!rows.length){toast('No hay filas para importar');return;}

  const ref=document.getElementById('monthlyRef').value.trim() || 'Reporte mensual';
  const tech=document.getElementById('monthlyTech').value.trim();
  if(tech) ensurePerson(tech);
  const area=document.getElementById('monthlyArea').value.trim() || '';
  const techLabel=tech||'Sin asignar';

  let imported=0, skipped=0;
  rows.forEach(r=>{
    if(!r.date){ skipped++; return; }
    const machine=r.machine || 'SIN ASIGNAR';

    // Asegura que la máquina exista en db (aunque no esté en el área actual)
    if(machine!=='SIN ASIGNAR' && !state.db.machines.find(m=>m.id===machine)){
      state.db.machines.push({id:machine,name:machine,status:'Operando',runtime:0,cycles:0,availability:100,powerKwh:0,lastPowerOutage:'—',dailyTarget:MACHINE_TARGETS[machine]||0});
    }

    state.db.history.unshift([
      r.date,
      r.type,
      machine,
      r.description,
      techLabel,
      `Mensual • ${ref}${area?' • '+area:''} • ${r.rawMachine||'—'} • ${r.start} - ${r.end} • ${r.duration}`
    ]);

    if(String(r.type).toUpperCase().includes('CORRECTIVO')){
      state.db.workOrders.unshift({
        id:'OT-MEN-'+Date.now().toString().slice(-7)+'-'+imported,
        date:r.date,
        machine:machine,
        fault:r.description,
        priority:'Media',
        status:'Cerrada',
        downtime:durationToHours(r.duration),
        technician:techLabel
      });
    }

    const clas=camposClasificacion(r.description);
    state.db.events.unshift({
      date:r.date,
      machine:machine,
      type:r.type,
      severity:'Media',
      desc:r.description,
      minutes:durationToMinutes(r.duration),
      kgTarget:0,
      kgActual:0,
      start:r.start,
      end:r.end,
      duration:r.duration,
      ...clas
    });

    imported++;
  });

    document.getElementById('monthlyImportSummary').innerHTML=
    `<div class="success"><strong>${imported} intervenciones agregadas</strong>${skipped?` · ${skipped} omitidas (sin fecha válida)`:''}.<br>
    Referencia: ${esc(ref)} • Responsable: ${esc(techLabel)}${area?' • Área: '+esc(area):''}<br>
    No se eliminaron ni omitieron registros con fecha válida.</div>`;

  document.getElementById('monthlyPreview').innerHTML='';
  document.getElementById('monthlyPaste').value='';
  services.render();
  toast(imported+' filas del reporte mensual agregadas');
}

export function clearMonthlyImport(){
  document.getElementById('monthlyPaste').value='';
  document.getElementById('monthlyPreview').innerHTML='';
}

/* Puente de las herramientas de mantenimiento con la base operativa sincronizada */

export function importMaintenanceStorageIntoDb(){
  const readArray=key=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return[]}};
  const mergeMissing=(current,incoming)=>{
    const result=Array.isArray(current)?current.slice():[];
    const ids=new Set(result.map(item=>item&&String(item.id||item._supabaseId||item.folio||'')).filter(Boolean));
    incoming.forEach(item=>{if(!item||typeof item!=='object')return;const id=String(item.id||item._supabaseId||item.folio||'');if(!id||!ids.has(id)){result.push(item);if(id)ids.add(id)}});
    return result;
  };
  state.db.kanban=mergeMissing(state.db.kanban,readArray('mtto_kanban'));
  state.db.reminders=mergeMissing(state.db.reminders,readArray('mtto_reminders'));
  state.db.dailyChecks=mergeMissing(state.db.dailyChecks,readArray('mtto_hist'));
  const calendar=readArray('mtto_preventive_calendar');
  const boards=(state.db.pmChecks||[]).filter(item=>item&&item._syncKind==='pmBoard');
  let orders=mergeMissing((state.db.pmChecks||[]).filter(item=>!item||item._syncKind!=='pmBoard'),calendar);
  const boardIds=new Set(boards.map(item=>item.month));
  try{
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key||!/^mtto_pm_board_\\d{4}-\\d{2}$/.test(key))continue;
      const month=key.slice('mtto_pm_board_'.length);
      if(boardIds.has(month))continue;
      const board=JSON.parse(localStorage.getItem(key)||'null');
      if(board)boards.push({id:'board:'+month,_syncKind:'pmBoard',month,board,updatedAt:new Date().toISOString()});
    }
  }catch{}
  state.db.pmChecks=orders.concat(boards);
}



export function syncMaintenanceStorageFromDb(){
  const put=(key,value)=>{try{const raw=JSON.stringify(value);if(localStorage.getItem(key)!==raw)localStorage.setItem(key,raw)}catch{}};
  put('mtto_kanban',Array.isArray(state.db.kanban)?state.db.kanban:[]);
  put('mtto_reminders',Array.isArray(state.db.reminders)?state.db.reminders:[]);
  put('mtto_hist',Array.isArray(state.db.dailyChecks)?state.db.dailyChecks:[]);
  const pm=Array.isArray(state.db.pmChecks)?state.db.pmChecks:[];
  put('mtto_preventive_calendar',pm.filter(item=>item&&item._syncKind!=='pmBoard'));
  pm.filter(item=>item&&item._syncKind==='pmBoard'&&/^\d{4}-\d{2}$/.test(item.month||'')).forEach(item=>put('mtto_pm_board_'+item.month,item.board||{}));
}

