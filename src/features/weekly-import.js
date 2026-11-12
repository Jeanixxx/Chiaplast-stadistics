/** Módulo: features/weekly-import.js */
import { services } from '../core/services.js';

import { state } from '../core/state.js';

import { badge, esc, save, toast } from '../core/ui.js';

import { camposClasificacion } from '../domain/failure-classifier.js';

import { MACHINES, iso, parseKg } from '../domain/machines.js';

import { ensurePerson } from './team.js';


export function machineFilter(){
  const ids=new Set(MACHINES());
  let list=state.db.machines.filter(m=>ids.has(m.id));
  if(state.selectedMachine) list=list.filter(m=>m.id===state.selectedMachine);
  return list;
}

export function normalizeMachine(raw){
  let s=String(raw||'').trim().toUpperCase().replace(/\s+/g,' ').replace(/_/g,'-');
  // Compact spaces around hyphen already handled; normalize common aliases
  const aliases={
    'SL1':'BSL-1','SL-1':'BSL-1','BSL1':'BSL-1',
    'SL2':'BSL-2','SL-2':'BSL-2','BSL2':'BSL-2',
    'SL3':'BSL-3','SL-3':'BSL-3','BSL3':'BSL-3',
    'SL4':'BSL-4','SL-4':'BSL-4','BSL4':'BSL-4',
    'SL5':'BSL-5','SL-5':'BSL-5','BSL5':'BSL-5',
    'SL6':'BSL-6','SL-6':'BSL-6','BSL6':'BSL-6',
    'BW1':'BW-1','BW-1':'BW-1',
    'BN1':'BN-1','BN-1':'BN-1','BN2':'BN-2','BN-2':'BN-2','BN3':'BN-3','BN-3':'BN-3','BN4':'BN-4','BN-4':'BN-4',
    'B02':'B-02','B-02':'B-02','B2':'B-02','B03':'B-03','B-03':'B-03','B3':'B-03','B06':'B-06','B-06':'B-06','B6':'B-06',
    'BD4':'BD-4','BD-4':'BD-4','D4':'BD-4',
    'BM1':'BM-1','BM-1':'BM-1','BM2':'BM-2','BM-2':'BM-2','BM3':'BM-3','BM-3':'BM-3','BM4':'BM-4','BM-4':'BM-4','BM5':'BM-5','BM-5':'BM-5',
    'BD1':'BD-1','BD-1':'BD-1','BD2':'BD-2','BD-2':'BD-2','BD3':'BD-3','BD-3':'BD-3',
    'SELLADORAM1':'SELLADORA M1','SELLADORA M1':'SELLADORA M1','SELLADORA1':'SELLADORA M1',
    'SELLADORAM2':'SELLADORA M2','SELLADORA M2':'SELLADORA M2','SELLADORA2':'SELLADORA M2',
    'SELLADORAM3':'SELLADORA M3','SELLADORA M3':'SELLADORA M3','SELLADORA3':'SELLADORA M3',
    'SELLADORAM4':'SELLADORA M4','SELLADORA M4':'SELLADORA M4','SELLADORA4':'SELLADORA M4',
    'SELLADORAM5':'SELLADORA M5','SELLADORA M5':'SELLADORA M5','SELLADORA5':'SELLADORA M5',
    'SELLADORAM6':'SELLADORA M6','SELLADORA M6':'SELLADORA M6','SELLADORA6':'SELLADORA M6',
    'HORNOM':'HORNO M','HORNO M':'HORNO M','HORNO':'HORNO M',
    'FLEJADORA':'FLEJADORA','FLEJADORA1':'FLEJADORA',
    'ELEVADORH':'ELEVADOR H','ELEVADOR H':'ELEVADOR H','ELEVADOR':'ELEVADOR H',
    'BK1':'BK-1','BK2':'BK-2','BK3':'BK-3','BK4':'BK-4','BK5':'BK-5','BK6':'BK-6','BK7':'BK-7','BK8':'BK-8',
    'BNG1':'BNG-1','BNG2':'BNG-2','BC1':'BC-1',
    'IMP1':'IMP-1','IMP2':'IMP-2','IMP3':'IMP-3',
    'EXT19':'EXT-19','ECB1':'ECB-1',
    'CRI1':'CRI-1','CRI2':'CRI-2','CRI3':'CRI-3','CRI4':'CRI-4','CRI5':'CRI-5',
    'EXT6':'EXT-6','EXT8':'EXT-8','EXT9':'EXT-9','EXT10':'EXT-10','EXT11':'EXT-11',
    'EXT12':'EXT-12','EXT13':'EXT-13','EXT14':'EXT-14','EXT15':'EXT-15','EXT16':'EXT-16','EXT17':'EXT-17',
    'EXTA4':'EXT-A4','EXTA5':'EXT-A5','EXTA6':'EXT-A6','EXTA7':'EXT-A7','EXTA8':'EXT-A8',
    'EXTA9':'EXT-A9','EXTA10':'EXT-A10','EXTA11':'EXT-A11','EXTA12':'EXT-A12','EXTA13':'EXT-A13',
    'EXTN3':'EXT-N3','EXTN4':'EXT-N4','EXTN5':'EXT-N5','EXTN6':'EXT-N6','EXTN7':'EXT-N7'
  };
  // Try exact compact key (no spaces)
  const compact=s.replace(/\s+/g,'');
  if(aliases[compact]) return aliases[compact];
  if(aliases[s]) return aliases[s];
  // Pattern matches
  let m;
  if((m=s.match(/^BSL[- ]?(\d+)$/))) return 'BSL-'+m[1];
  if((m=s.match(/^SL[- ]?(\d+)$/))) return 'BSL-'+m[1];
  if((m=s.match(/^BW[- ]?(\d+)$/))) return 'BW-'+m[1];
  if((m=s.match(/^BN[- ]?(\d+)$/))) return 'BN-'+m[1];
  if((m=s.match(/^B[- ]?0*(\d+)$/))) return 'B-'+String(m[1]).padStart(2,'0');
  if((m=s.match(/^BD[- ]?(\d+)$/))) return 'BD-'+m[1];
  if((m=s.match(/^BM[- ]?(\d+)$/))) return 'BM-'+m[1];
  if((m=s.match(/^BK[- ]?(\d+)$/))) return 'BK-'+m[1];
  if((m=s.match(/^BNG[- ]?(\d+)$/))) return 'BNG-'+m[1];
  if((m=s.match(/^BC[- ]?(\d+)$/))) return 'BC-'+m[1];
  if((m=s.match(/^IMP[- ]?(\d+)$/))) return 'IMP-'+m[1];
  if((m=s.match(/^ECB[- ]?(\d+)$/))) return 'ECB-'+m[1];
  if((m=s.match(/^CRI[- ]?(\d+)$/))) return 'CRI-'+m[1];
  if((m=s.match(/^EXT[- ]?A(\d+)$/))) return 'EXT-A'+m[1];
  if((m=s.match(/^EXT[- ]?N(\d+)$/))) return 'EXT-N'+m[1];
  if((m=s.match(/^EXT[- ]?(\d+)$/))) return 'EXT-'+m[1];
  if((m=s.match(/^SELLADORA\s*M?\s*(\d+)$/))) return 'SELLADORA M'+m[1];
  if(/HORNO/.test(s)) return 'HORNO M';
  if(/FLEJADORA/.test(s)) return 'FLEJADORA';
  if(/ELEVADOR/.test(s)) return 'ELEVADOR H';
  return s;
}

function parseExcelRows(text){
  return String(text||'')
    .split(/\r?\n/)
    .map(x=>x.trimEnd())
    .filter(x=>x.trim())
    .map((line,index)=>{
      const cols=line.includes('\t') ? line.split('\t') : line.split(/\s{2,}/);
      const c=cols.map(x=>String(x||'').trim());
      return {
        row:c[0]||String(index+1),
        type:c[1]||'CORRECTIVO',
        rawMachine:c[2]||'',
        machine:normalizeMachine(c[2]||''),
        description:c[3]||'',
        start:c[4]||'',
        end:c[5]||'',
        duration:c[6]||'',
        value1:c[7]||'',
        value2:c[8]||'',
        extra:c.slice(9).join(' | ')
      };
    });
}

export function previewWeeklyImport(){
  const rows=parseExcelRows(document.getElementById('weeklyPaste').value);
  const box=document.getElementById('weeklyPreview');
  if(!rows.length){
    box.innerHTML='<div class="notice">No se encontraron filas para analizar.</div>';
    return;
  }
  let ok=0, warn=0;
  const issues=[];
  const rowStatus=rows.map((r,i)=>{
    const miss=[];
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
        <thead><tr><th>#</th><th>Tipo</th><th>Equipo original</th><th>Máquina</th><th>Descripción</th><th>Inicio</th><th>Fin</th><th>Duración</th><th>Kg objetivo</th><th>Producción muerta</th><th>Estado</th></tr></thead>
        <tbody>
          ${rows.map((r,i)=>{
            const miss=rowStatus[i];
            const st=miss.length?`<span class="badge b-warn">Incompleto</span>`:`<span class="badge b-ok">OK</span>`;
            return `<tr>
            <td>${esc(r.row)}</td>
            <td>${badge(r.type)}</td>
            <td>${esc(r.rawMachine)}</td>
            <td><strong>${esc(r.machine)}</strong></td>
            <td>${esc(r.description)}</td>
            <td>${esc(r.start)}</td>
            <td>${esc(r.end)}</td>
            <td>${esc(r.duration)}</td>
            <td>${esc(r.value1)}</td>
            <td>${esc(r.value2)}</td>
            <td>${st}</td>
          </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="muted" style="font-size:11px;margin-top:10px">
      <strong>Cómo se interpreta:</strong> OK = máquina, descripción y duración legible presentes.
      Incompleto = falta algún campo o la duración no se pudo leer (aún así puedes importar).
      ${issues.length?`<br><br><strong>Detalle:</strong><br>${issues.slice(0,15).map(esc).join('<br>')}${issues.length>15?'<br>…':''}`:''}
    </div>`;
}

function setImportProgress(wrapId, barId, labelId, pct, text){
  const wrap=document.getElementById(wrapId);
  const bar=document.getElementById(barId);
  const lab=document.getElementById(labelId);
  if(wrap) wrap.style.display='block';
  if(bar) bar.style.width=Math.min(100,Math.max(0,pct))+'%';
  if(lab) lab.textContent=text||('Importando… '+Math.round(pct)+'%');
}

export function importWeeklyReport(){
  const rows=parseExcelRows(document.getElementById('weeklyPaste').value);
  if(!rows.length){toast('No hay filas para importar','err');return;}

  setImportProgress('importProgressWrap','importProgressBar','importProgressLabel',5,'Preparando '+rows.length+' filas…');

  const date=document.getElementById('weeklyDate').value || iso(new Date());
  const week=document.getElementById('weeklyWeek').value.trim() || ('Día '+date);
  const tech=document.getElementById('weeklyTech').value.trim();
  if(tech) ensurePerson(tech);
  const area=document.getElementById('weeklyArea').value.trim() || '';

  let imported=0;
  const techLabel=tech||'Sin asignar';
  const total=rows.length;
  rows.forEach((r,idx)=>{
    if(idx%5===0) setImportProgress('importProgressWrap','importProgressBar','importProgressLabel',5+(idx/total)*90, 'Importando '+ (idx+1) +' / '+total);
    const machine=r.machine || 'SIN ASIGNAR';

    // Cada fila se agrega SIEMPRE. No se comparan ni eliminan duplicados.
    state.db.history.unshift([
      date,
      r.type.toUpperCase(),
      machine,
      r.description,
      techLabel,
      `Importado • ${week}${area?' • '+area:''} • ${r.rawMachine} • ${r.start} - ${r.end} • ${r.duration} • D1:${r.value1} • D2:${r.value2}`
    ]);

    // Si es correctivo, también queda como OT histórica.
    if(String(r.type).toUpperCase().includes('CORRECTIVO')){
      state.db.workOrders.unshift({
        id:'OT-IMP-'+Date.now().toString().slice(-7)+'-'+imported,
        date:date,
        machine:machine,
        fault:r.description,
        priority:'Media',
        status:'Cerrada',
        downtime:durationToHours(r.duration),
        technician:techLabel
      });
    }

    // Todo evento importado se conserva como evento de máquina.
    const clas=camposClasificacion(r.description);
    state.db.events.unshift({
      date:date,
      machine:machine,
      type:r.type,
      severity:'Media',
      desc:r.description,
      minutes:durationToMinutes(r.duration),
      kgTarget:parseKg(r.value1),
      kgActual:parseKg(r.value2),
      start:r.start,
      end:r.end,
      duration:r.duration,
      ...clas
    });

    imported++;
  });

  save();
  setImportProgress('importProgressWrap','importProgressBar','importProgressLabel',100, imported+' filas importadas');
  document.getElementById('weeklyImportSummary').innerHTML=
    `<div class="success"><strong>${imported} intervenciones agregadas.</strong><br>
    Fecha: ${esc(date)} • ${esc(week)} • Responsable: ${esc(tech)}${area?' • Área: '+esc(area):''}<br>
    No se eliminaron ni omitieron registros.</div>`;

  document.getElementById('weeklyPreview').innerHTML='';
  document.getElementById('weeklyPaste').value='';
  services.render();
  toast(imported+' filas agregadas al historial');
  setTimeout(()=>{ const w=document.getElementById('importProgressWrap'); if(w) w.style.display='none'; }, 1800);
}

export function parseDuration(v){
  const s=String(v||'').trim();
  if(!s) return {minutes:0, ok:false, empty:true, raw:s};
  let m=s.match(/^(\d{1,3}):([0-5]?\d)$/);
  if(m) return {minutes:Number(m[1])*60+Number(m[2]), ok:true, raw:s};
  if(/^\d+(\.\d+)?$/.test(s)) return {minutes:Math.round(Number(s)), ok:true, raw:s};
  m=s.match(/(\d+)\s*h(?:oras?)?/i);
  const h=m?Number(m[1]):0;
  m=s.match(/(\d+)\s*m(?:in(?:utos?)?)?/i);
  const min=m?Number(m[1]):0;
  if(h||min) return {minutes:h*60+min, ok:true, raw:s};
  return {minutes:0, ok:false, empty:false, raw:s};
}

export function durationToMinutes(v){
  const p=parseDuration(v);
  return p.minutes;
}

export function durationToHours(v){return durationToMinutes(v)/60}

export function clearWeeklyImport(){
  document.getElementById('weeklyPaste').value='';
  document.getElementById('weeklyPreview').innerHTML='';
}

