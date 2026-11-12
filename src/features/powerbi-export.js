/** Módulo: features/powerbi-export.js */

import { state } from '../core/state.js';

import { toast } from '../core/ui.js';

import { iso } from '../domain/machines.js';

export function exportPowerBI(){
  const rows=[['fecha','maquina','tipo','sintoma','componente','modo_falla','accion','minutos_paro','descripcion','confianza']];
  (state.db.events||[]).forEach(e=>{
    rows.push([
      e.date||'', e.machine||'', e.type||'',
      e.sintoma||'', e.componente||'', e.modo_falla||'', e.accion||'',
      e.minutes||0, String(e.desc||'').replace(/;/g,','), e.confianza||''
    ]);
  });
  const csv='\uFEFF'+rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='eventos_powerbi_'+iso(new Date())+'.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV BI exportado ('+((state.db.events||[]).length)+' filas)');
}

