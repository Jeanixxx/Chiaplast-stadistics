/** Fechas locales puras (sin dependencias). */
export const now=new Date();

export function iso(d){
  const x=d?new Date(d):new Date();
  if(typeof d==='string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const y=x.getFullYear(), m=String(x.getMonth()+1).padStart(2,'0'), day=String(x.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}

export function parseLocalDate(s){
  const str=String(s||'').trim();
  let m=str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m) return new Date(+m[1], +m[2]-1, +m[3], 12, 0, 0);
  m=str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(m) return new Date(+m[3], +m[2]-1, +m[1], 12, 0, 0);
  const d=new Date(str);
  return isNaN(d)?new Date():d;
}
