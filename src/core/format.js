/** Escape y formateo HTML puros (sin dependencias). */
export function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

export function escAttr(s){return esc(s).replace(/`/g,'&#96;')}

export function badge(v){
  const x=String(v??'').toLowerCase();
  let c=x.includes('crít')||x.includes('falla')?'b-bad':x.includes('advert')||x.includes('alta')||x.includes('revis')?'b-warn':x.includes('normal')||x.includes('operativa')||x.includes('cerr')||x.includes('dispon')?'b-ok':'b-info';
  return `<span class="badge ${c}">${esc(v)}</span>`;
}
