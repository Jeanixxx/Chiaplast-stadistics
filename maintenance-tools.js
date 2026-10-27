/* Herramientas operativas esenciales de Chiaplast Statistics.
   Registros en db/localStorage; supabase-sync.js los sincroniza (kanban, reminders, technicalNotes, dailyChecks, pmChecks).
   Evidencias fotográficas: locales para evitar subir archivos pesados a la tabla JSON. */
(function(){
'use strict';
if(typeof db==='undefined'||typeof VIEW_CONFIG==='undefined')return;
db.kanban=db.kanban||[];db.reminders=db.reminders||[];db.technicalNotes=db.technicalNotes||[];db.dailyChecks=db.dailyChecks||[];db.pmChecks=db.pmChecks||[];
var $=function(id){return document.getElementById(id);};
var escT=function(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var today=function(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
var uid=function(){return window.crypto&&crypto.randomUUID?crypto.randomUUID():'mt-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);};
var machines=function(){return typeof LIVE_MACHINE_DB!=='undefined'?LIVE_MACHINE_DB:[];};
var machineOptions=function(){return machines().map(function(m){return '<option value="'+escT(m.code)+'">'+escT(m.area)+' · '+escT(m.code)+'</option>';}).join('');};
var areas=function(){return Array.from(new Set(machines().map(function(m){return m.area;})));};
var areaOptions=function(){return areas().map(function(a){return '<option>'+escT(a)+'</option>';}).join('');};
var persist=function(){try{save();}catch(e){console.error(e);}};
var toastT=function(s){if(typeof toast==='function')toast(s);else alert(s);};
var evidenceKey='CP_MAINT_NOTE_EVIDENCE_V1';
var evidenceRead=function(){try{return JSON.parse(localStorage.getItem(evidenceKey)||'{}');}catch(e){return {};}};
var evidenceWrite=function(x){try{localStorage.setItem(evidenceKey,JSON.stringify(x));}catch(e){toastT('No hay espacio local suficiente para guardar la evidencia.');}};

function installUI(){
 var main=document.querySelector('main');if(!main)return;
 if(!$('mtKanban')){var w=document.createElement('div');w.id='mtToolViews';
 w.innerHTML=
 '<section id="mtKanban" class="view"><div class="card"><div class="section-title">Tablero Kanban</div><p class="muted">Tareas de mantenimiento compartidas entre usuarios.</p><div class="formgrid"><div class="field"><label>Tarea</label><input id="mtTaskTitle" maxlength="140" placeholder="Revisar chumacera de BM-2"></div><div class="field"><label>Máquina</label><select id="mtTaskMachine"><option value="">General</option>'+machineOptions()+'</select></div><div class="field"><label>Fecha límite</label><input id="mtTaskDue" type="date"></div><div class="field"><label>Responsable</label><input id="mtTaskOwner" maxlength="80"></div></div><div class="field"><label>Detalle</label><textarea id="mtTaskDetails" rows="2"></textarea></div><button class="btn primary mt" onclick="mtAddTask()">Agregar tarea</button></div><div id="mtKanbanBoard" class="grid layout3 mt"></div></section>'+
 '<section id="mtReminders" class="view"><div class="card"><div class="section-title">Recordatorios</div><p class="muted">Los recordatorios se comparten. Los avisos emergentes dependen de los permisos del navegador.</p><div class="formgrid"><div class="field"><label>Recordatorio</label><input id="mtReminderTitle" maxlength="140"></div><div class="field"><label>Máquina</label><select id="mtReminderMachine"><option value="">General</option>'+machineOptions()+'</select></div><div class="field"><label>Fecha</label><input id="mtReminderDate" type="date" value="'+today()+'"></div><div class="field"><label>Hora</label><input id="mtReminderTime" type="time"></div><div class="field"><label>Responsable</label><input id="mtReminderOwner" maxlength="80"></div></div><div class="field"><label>Detalle</label><textarea id="mtReminderDetails" rows="2"></textarea></div><button class="btn primary mt" onclick="mtAddReminder()">Guardar recordatorio</button></div><div class="card mt"><div class="section-title">Avisos programados</div><div style="overflow:auto"><table><thead><tr><th>Fecha</th><th>Recordatorio</th><th>Máquina</th><th>Responsable</th><th>Estado</th><th></th></tr></thead><tbody id="mtReminderRows"></tbody></table></div></div></section>'+
 '<section id="mtNotes" class="view"><div class="card"><div class="section-title">Notas técnicas y evidencias</div><p class="muted">El texto se comparte por Supabase; las fotos se guardan en el dispositivo que las adjunta.</p><div class="formgrid"><div class="field"><label>Área</label><select id="mtNoteArea">'+areaOptions()+'</select></div><div class="field"><label>Máquina</label><select id="mtNoteMachine"><option value="">General</option>'+machineOptions()+'</select></div><div class="field"><label>Título</label><input id="mtNoteTitle" maxlength="140"></div></div><div class="field"><label>Nota técnica</label><textarea id="mtNoteBody" rows="4" maxlength="3000" placeholder="Síntoma, diagnóstico, acción y recomendación"></textarea></div><div class="field"><label>Fotografías (máximo 4)</label><input id="mtNotePhotos" type="file" accept="image/*" multiple></div><button class="btn primary mt" onclick="mtAddNote()">Guardar nota</button></div><div id="mtNoteRows" class="grid layout2 mt"></div></section>'+
 '<section id="mtDaily" class="view"><div class="card"><div class="section-title">Chequeo diario</div><div class="formgrid"><div class="field"><label>Fecha</label><input id="mtDailyDate" type="date" value="'+today()+'"></div><div class="field"><label>Máquina</label><select id="mtDailyMachine">'+machineOptions()+'</select></div><div class="field"><label>Técnico</label><input id="mtDailyTech" maxlength="80"></div><div class="field"><label>Resultado</label><select id="mtDailyStatus"><option>OK</option><option>Observación</option><option>Falla</option></select></div></div><div class="formgrid mt"><label class="item"><input type="checkbox" id="mtD1"> Limpieza general</label><label class="item"><input type="checkbox" id="mtD2"> Guardas y protecciones</label><label class="item"><input type="checkbox" id="mtD3"> Sin fugas de aceite/aire</label><label class="item"><input type="checkbox" id="mtD4"> Sin ruidos/vibración anormal</label><label class="item"><input type="checkbox" id="mtD5"> Instalación eléctrica</label><label class="item"><input type="checkbox" id="mtD6"> Paro de emergencia</label></div><div class="field mt"><label>Observaciones</label><textarea id="mtDailyNotes" rows="3" maxlength="1500"></textarea></div><button class="btn primary mt" onclick="mtSaveDaily()">Guardar chequeo</button></div><div class="card mt"><div class="section-title">Historial de chequeos diarios</div><div style="overflow:auto"><table><thead><tr><th>Fecha</th><th>Máquina</th><th>Técnico</th><th>Resultado</th><th>Observaciones</th></tr></thead><tbody id="mtDailyRows"></tbody></table></div></div></section>'+
 '<section id="mtPreventive" class="view"><div class="card"><div class="section-title">Chequeo preventivo</div><div class="formgrid"><div class="field"><label>Fecha</label><input id="mtPmDate" type="date" value="'+today()+'"></div><div class="field"><label>Máquina</label><select id="mtPmMachine" onchange="mtUpdatePmChecklist()">'+machineOptions()+'</select></div><div class="field"><label>Técnico</label><input id="mtPmTech" maxlength="80"></div></div><div id="mtPmChecklist" class="grid layout2 mt"></div><div class="field mt"><label>Observaciones / pendientes</label><textarea id="mtPmNotes" rows="3" maxlength="1500"></textarea></div><button class="btn primary mt" onclick="mtSavePreventive()">Guardar preventivo</button></div><div class="card mt"><div class="section-title">Últimas ejecuciones</div><div style="overflow:auto"><table><thead><tr><th>Fecha</th><th>Área</th><th>Máquina</th><th>Técnico</th><th>Avance</th><th>Observaciones</th></tr></thead><tbody id="mtPmRows"></tbody></table></div></div></section>'+
 '<section id="mtCalendar" class="view"><div class="card"><div class="section-title">Tablero mensual de preventivos</div><p class="muted">Toca una máquina para marcar que ya tiene su preventivo del mes; también se marca al guardar un chequeo preventivo.</p><div class="pm-toolbar"><div class="pm-month"><button class="btn" onclick="mtShiftMonth(-1)">‹</button><strong id="mtPmMonth"></strong><button class="btn" onclick="mtShiftMonth(1)">›</button></div><label class="pm-date">Fecha del check <input id="mtPmDateIn" type="date" onchange="mtPmSetDate(this.value)"></label><div class="pm-actions"><button class="btn" onclick="mtPmCsv()">Exportar CSV</button><button class="btn" onclick="mtPmReset()">Reiniciar mes</button></div></div><div class="pm-summary"><b id="mtPmSummaryText"></b><div class="pm-track"><div class="pm-fill" id="mtPmFill" style="width:0"></div></div><small id="mtPmSaved"></small></div><div id="mtPmPlant" class="pm-plant"></div><section class="pm-stats" id="mtPmStats"></section></div></section>';
 main.appendChild(w);
 }
 Object.assign(VIEW_CONFIG,{mtKanban:{title:'Tablero Kanban',render:renderKanban},mtReminders:{title:'Recordatorios',render:renderReminders},mtNotes:{title:'Notas técnicas',render:renderNotes},mtDaily:{title:'Chequeo diario',render:renderDaily},mtPreventive:{title:'Chequeo preventivo',render:renderPreventive},mtCalendar:{title:'Calendario preventivo',render:renderCalendar}});
 mtUpdatePmChecklist();
}
function renderKanban(){var h=$('mtKanbanBoard');if(!h)return;var states=[['todo','Por hacer'],['doing','En proceso'],['done','Terminado']];h.innerHTML=states.map(function(s){var rows=db.kanban.filter(function(t){return (t.status||'todo')===s[0];});return '<div class="card"><div class="section-title">'+s[1]+' <span class="badge">'+rows.length+'</span></div>'+(rows.length?rows.map(function(t){return '<div class="item mt"><strong>'+escT(t.title)+'</strong><p class="muted">'+escT(t.machineLabel||'General')+(t.due?' · '+escT(t.due):'')+(t.owner?' · '+escT(t.owner):'')+'</p><p>'+escT(t.details||'')+'</p><div class="actions">'+(s[0]!=='todo'?'<button class="btn" onclick="mtMoveTask(\''+t.id+'\',\'todo\')">Por hacer</button>':'')+(s[0]!=='doing'?'<button class="btn" onclick="mtMoveTask(\''+t.id+'\',\'doing\')">En proceso</button>':'')+(s[0]!=='done'?'<button class="btn" onclick="mtMoveTask(\''+t.id+'\',\'done\')">Terminar</button>':'')+'<button class="btn" onclick="mtDeleteTask(\''+t.id+'\')">Eliminar</button></div></div>';}).join(''):'<div class="empty">Sin tareas</div>')+'</div>';}).join('');}
function mtAddTask(){var title=$('mtTaskTitle').value.trim();if(!title)return toastT('Escribe la tarea.');var code=$('mtTaskMachine').value,m=machines().find(function(x){return x.code===code;});db.kanban.unshift({id:uid(),title:title,machine:code,machineLabel:m?m.area+' · '+m.code:'General',due:$('mtTaskDue').value,owner:$('mtTaskOwner').value.trim(),details:$('mtTaskDetails').value.trim(),status:'todo',createdAt:new Date().toISOString()});['mtTaskTitle','mtTaskDue','mtTaskOwner','mtTaskDetails'].forEach(function(i){$(i).value='';});persist();renderKanban();}
function mtMoveTask(id,status){var t=db.kanban.find(function(x){return x.id===id;});if(t){t.status=status;t.updatedAt=new Date().toISOString();persist();renderKanban();}}
function mtDeleteTask(id){if(confirm('¿Eliminar esta tarea?')){db.kanban=db.kanban.filter(function(x){return x.id!==id;});persist();renderKanban();}}
function renderReminders(){var h=$('mtReminderRows');if(!h)return;var rows=db.reminders.slice().sort(function(a,b){return a.date.localeCompare(b.date);});h.innerHTML=rows.length?rows.map(function(r){return '<tr><td>'+escT(r.date)+' '+escT(r.time||'')+'</td><td><strong>'+escT(r.title)+'</strong><div class="muted">'+escT(r.details||'')+'</div></td><td>'+escT(r.machineLabel||'General')+'</td><td>'+escT(r.owner||'—')+'</td><td>'+(r.done?'Atendido':r.date<today()?'Vencido':'Pendiente')+'</td><td>'+(r.done?'':'<button class="btn" onclick="mtCompleteReminder(\''+r.id+'\')">Atender</button>')+' <button class="btn" onclick="mtDeleteReminder(\''+r.id+'\')">Eliminar</button></td></tr>';}).join(''):'<tr><td colspan="6">No hay recordatorios.</td></tr>';}
function mtAddReminder(){var title=$('mtReminderTitle').value.trim(),date=$('mtReminderDate').value;if(!title||!date)return toastT('Indica recordatorio y fecha.');var code=$('mtReminderMachine').value,m=machines().find(function(x){return x.code===code;});db.reminders.unshift({id:uid(),title:title,date:date,time:$('mtReminderTime').value,owner:$('mtReminderOwner').value.trim(),details:$('mtReminderDetails').value.trim(),machine:code,machineLabel:m?m.area+' · '+m.code:'General',done:false,createdAt:new Date().toISOString()});['mtReminderTitle','mtReminderTime','mtReminderOwner','mtReminderDetails'].forEach(function(i){$(i).value='';});persist();renderReminders();}
function mtCompleteReminder(id){var r=db.reminders.find(function(x){return x.id===id;});if(r){r.done=true;persist();renderReminders();}}
function mtDeleteReminder(id){if(confirm('¿Eliminar recordatorio?')){db.reminders=db.reminders.filter(function(x){return x.id!==id;});persist();renderReminders();}}
function compressPhoto(file){return new Promise(function(resolve,reject){var reader=new FileReader();reader.onerror=reject;reader.onload=function(){var img=new Image();img.onerror=reject;img.onload=function(){var scale=Math.min(1,1000/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.62));};img.src=reader.result;};reader.readAsDataURL(file);});}
function renderNotes(){var h=$('mtNoteRows');if(!h)return;var ev=evidenceRead();h.innerHTML=db.technicalNotes.length?db.technicalNotes.map(function(n){return '<div class="card"><div class="flex"><div class="section-title">'+escT(n.title)+'</div><button class="btn" onclick="mtDeleteNote(\''+n.id+'\')">Eliminar</button></div><div class="muted">'+escT(n.date)+' · '+escT(n.area)+' · '+escT(n.machineLabel||'General')+'</div><p style="white-space:pre-wrap">'+escT(n.body)+'</p>'+(ev[n.id]||[]).map(function(src){return '<img src="'+src+'" alt="Evidencia" style="max-width:100%;max-height:220px;object-fit:contain">';}).join('')+'<small class="muted">Texto compartido; fotografías locales</small></div>';}).join(''):'<div class="card muted">No hay notas guardadas.</div>';}
async function mtAddNote(){var title=$('mtNoteTitle').value.trim(),body=$('mtNoteBody').value.trim();if(!title||!body)return toastT('Completa título y nota.');var id=uid(),code=$('mtNoteMachine').value,m=machines().find(function(x){return x.code===code;}),photos=[];for(var f of Array.from($('mtNotePhotos').files||[]).slice(0,4)){if(f.type.indexOf('image/')===0){try{photos.push(await compressPhoto(f));}catch(e){}}}db.technicalNotes.unshift({id:id,title:title,body:body,date:today(),area:$('mtNoteArea').value,machine:code,machineLabel:m?m.area+' · '+m.code:'General',createdAt:new Date().toISOString()});if(photos.length){var ev=evidenceRead();ev[id]=photos;evidenceWrite(ev);}['mtNoteTitle','mtNoteBody','mtNotePhotos'].forEach(function(i){$(i).value='';});persist();renderNotes();}
function mtDeleteNote(id){if(confirm('¿Eliminar esta nota?')){db.technicalNotes=db.technicalNotes.filter(function(n){return n.id!==id;});var ev=evidenceRead();delete ev[id];evidenceWrite(ev);persist();renderNotes();}}
function mtSaveDaily(){var code=$('mtDailyMachine').value,m=machines().find(function(x){return x.code===code;});var r={id:uid(),date:$('mtDailyDate').value||today(),machine:code,area:m?m.area:'',machineLabel:m?m.area+' · '+m.code:code,technician:$('mtDailyTech').value.trim(),status:$('mtDailyStatus').value,checks:[$('mtD1').checked,$('mtD2').checked,$('mtD3').checked,$('mtD4').checked,$('mtD5').checked,$('mtD6').checked],notes:$('mtDailyNotes').value.trim(),createdAt:new Date().toISOString()};db.dailyChecks.unshift(r);persist();renderDaily();$('mtDailyNotes').value='';toastT('Chequeo diario guardado.');}
function renderDaily(){var h=$('mtDailyRows');if(!h)return;h.innerHTML=db.dailyChecks.slice(0,100).map(function(r){return '<tr><td>'+escT(r.date)+'</td><td>'+escT(r.machineLabel||r.machine)+'</td><td>'+escT(r.technician||'—')+'</td><td>'+escT(r.status)+'</td><td>'+escT(r.notes||'—')+'</td></tr>';}).join('')||'<tr><td colspan="5">Sin registros.</td></tr>';}
const ZONAS=['Zona 1','Zona 2','Zona 3','Zona 4 (Porta malla)','Zona 5 (Porta malla)','Zona 6 (Porta malla)','Codo Portamalla','Cabezal','Motor Principal'];
const SOPL=['Soplador 1','Soplador 2','Soplador 3','Soplador 4','Luminaria'];
const EXT_CHECK=[
  ['ZONA MECÁNICA',['ESTADO DE LOS RODILLOS','ESTADO DE LOS BALEROS DE LOS RODILLOS','ESTADO DE LAS CHUMACERAS','ESTADO DE LAS BANDAS','ESTADO DE LOS MOTORES','ESTADO DE LOS BALEROS DE LOS MOTORES','ESTADO DE LOS REDUCTORES','ESTADO DEL ACEITE DE LOS REDUCTORES DE LOS MOTORES','ESTADO DEL CABEZAL','ESTADO DEL DADO DEL CABEZAL','ESTADO DE LOS PLATOS DE AIRE','ESTADO DE LOS CONDUCTOS DE LOS PLATOS DE AIRE','ESTRUCTURA Y TORNILLERÍA','ESTADO DE HUSILLO Y CAÑON','ESTADO DEL PORTAMALLA','ESTADO DE LAS POLEAS','ESTADO DE LAS CUCHILLAS (RF)']],
  ['ZONA NEUMÁTICA E HIDRÁULICA',['ESTADO DE LOS PISTONES','ESTADO DE LAS VÁLVULAS','ESTADO DE LAS MANGUERAS','ESTADO DEL ACEITE','ESTADO DE LA UNIDAD DE MANTENIMIENTO','ESTADO DE LOS SELLOS Y CONEXIONES']],
  ['ZONA ELÉCTRICA',['ESTADO DE LOS CABLES Y TERMINALES','ESTADO DE LOS CONTACTORES','ESTADO DE LAS PASTILLAS TÉRMICAS','ESTADO DE LOS GUARDAMOTORES','ESTADO DE LOS ESTADOS SÓLIDOS','ESTADO DE LOS PIROMETROS','ESTADO DEL INVERSOR','ESTADO DE LAS PISTAS DE BRONCE','ESTADO DE LA CAJA DE ALIMENTACIÓN DEL CABEZAL','ESTADO DE LOS SOPLADORES','ESTADO DEL PLC','ESTADO DE LAS RESISTENCIAS']]
];
const MQ=[
 ['Sistema neumático',['Nivel y calidad del aceite del sistema','Fugas y ajuste del sistema completo de aire','Pruebas de respuesta de electroválvulas']],
 ['Motor y transmisión',['Cables expuestos','Rodamientos y guardas funcionando bien']],
 ['Cadenas y bandas',['Levas y opresores bien sujetos','Alineación de cadenas y piñones']],
 ['Rodillos y guías',['Rótulas bien puestas','Pandeos, desgaste o golpes en los ejes']],
 ['Sistema eléctrico',['Sopleteo de tablero y módulos eléctricos','Revisión de resistencias y termopares']],
 ['Sistema electrónico',['Limpieza de la óptica','Reajuste de conectores de los módulos']],
 ['Lubricación general',['Rodamientos lineales y chumaceras','Cadenas y engranajes']],
 ['Tornillería y estructura',['Tornillos completos','Vibración o estructura mal ajustada']],
 ['Limpieza general',['Charcos de aceite, sopleteo y barrido de la zona de la máquina']],
 ['Pruebas de funcionamiento',[]]
];
const CAM_CHECK=[
  ['ZONA MECÁNICA',['ESTADO DE RODILLOS','ESTADO DE CABEZAL SUPERIOR E INFERIOR','ESTADO DE ROTULAS','ESTADO DE ESTRUCTURA Y TORNILLERÍA','ESTADO DE LA BANDA','ESTADO DE BALEROS','ESTADO DEL MOTOR','ESTADO DE LA MEDIA LUNA','ESTADO DEL CHUC','ESTADO DE LAS CUCHILLAS','ESTADO DEL PISADOR']],
  ['ZONA NEUMÁTICA E HIDRÁULICA',['ESTADO DE LOS PISTONES','ESTADO DE LAS VÁLVULAS','ESTADO DE LAS MANGUERAS','ESTADO DEL ACEITE','ESTADO DE LAS ELECTROVÁLVULAS','ESTADO DEL CHILLER']],
  ['ZONA ELÉCTRICA',['ESTADO DE LOS CABLES Y TERMINALES','ESTADO DE LOS CONTACTORES','ESTADO DE LAS PASTILLAS TÉRMICAS','ESTADO DE LOS GUARDAMOTORES','ESTADO DE LOS ESTADOS SÓLIDOS','ESTADO DE LOS PIROMETROS','ESTADO DEL INVERSOR','ESTADO DEL PLC','ESTADO DE LAS RESISTENCIAS','ESTADO DEL DISPLAY','ESTADO DE SENSORES','ESTADO FOTOCELDAS']]
];
const DIM_CHECK=[
  ['ZONA MECÁNICA',[
    'ESTADO DE RODILLOS',
    'ESTADO DE CABEZAL SUPERIOR E INFERIOR',
    'ESTADO DE ROTULAS',
    'ESTADO DE ESTRUCTURA Y TORNILLERÍA',
    'ESTADO DE LA BANDA',
    'ESTADO DE BALEROS',
    'ESTADO DEL MOTOR',
    'ESTADO DE LA MEDIA LUNA',
    'ESTADO DEL CHUC',
    'ESTADO DE LAS CUCHILLAS',
    'ESTADO DEL PISADOR'
  ]],
  ['ZONA NEUMÁTICA E HIDRÁULICA',[
    'ESTADO DE LOS PISTONES',
    'ESTADO DE LAS VÁLVULAS',
    'ESTADO DE LAS MANGUERAS',
    'ESTADO DEL ACEITE',
    'ESTADO DE LAS ELECTROVÁLVULAS',
    'ESTADO DEL CHILLER'
  ]],
  ['ZONA ELÉCTRICA',[
    'ESTADO DE LOS CABLES Y TERMINALES',
    'ESTADO DE LOS CONTACTORES',
    'ESTADO DE LAS PASTILLAS TÉRMICAS',
    'ESTADO DE LOS GUARDAMOTORES',
    'ESTADO DE LOS ESTADOS SÓLIDOS',
    'ESTADO DE LOS PIROMETROS',
    'ESTADO DEL INVERSOR',
    'ESTADO DEL PLC',
    'ESTADO DE LAS RESISTENCIAS',
    'ESTADO DEL DISPLAY',
    'ESTADO DE SENSORES',
    'ESTADO FOTOCELDAS'
  ]]
];
const GREASE_N=47;
const pmM=(name,key)=>({name,short:name,key:key||name});
const pmList=names=>names.map(n=>pmM(n));
const pmG=(name,span,count,cols)=>({group:name,span,cols:cols||count,subs:Array.from({length:count},(_,i)=>({name:name+' '+(i+1),short:String(i+1),key:name.replace(/\s+/g,'-')+'-'+(i+1)}))});
const PM_LAYOUT=[
  {code:'CAM',title:'CAM',cols:4,items:[
    ...pmList(['BK-1','BK-2','BK-3','BK-4','BK-5','BK-6','BK-7','BK-8','BNG-1','BNG-2','BC-1']),pmM('BC-1','BC-1#2'),
    ...pmList(['IMP-1','IMP-2','IMP-3','FLEJADORA'])]},
  {code:'DIM',title:'DIM',cols:4,items:[
    ...pmList(['BM-1','BM-2','BM-3','BM-4','BM-5','BD-1','BD-2','BD-3']),
    pmG('SELLADORA',4,5),pmG('HORNO M',2,4,2),pmM('FLEJADORA','FLEJADORA-1'),pmM('FLEJADORA','FLEJADORA-2')]},
  {code:'BSL',title:'BSL',cols:4,items:pmList(['BW-1','BN-1','BN-2','BN-3','BN-4','B-02','B-03','B-06','BSL-1','BSL-2','BSL-3','BSL-4','BSL-5','BSL-6','BD-4','ELEVADOR'])},
  {code:'EXT1',title:'EXT1',cols:7,items:pmList(['EXT-19','ECB-1','CRI-3','CRI-4','CRI-5','EXT-6','EXT-8','EXT-9','EXT-10','EXT-11','EXT-12','EXT-13','EXT-14','EXT-15','EXT-16','EXT-17','EXT-20','EXT-21','EXT-22','EXT-A1','EXT-A2','RF','RF 2','EXT-N1','EXT-N2','FUELLADORA','FUELLADORA 2','EXT-A3'])},
  {code:'EXT2',title:'EXT2',cols:7,items:pmList(['EXT-A4','EXT-A5','EXT-A6','EXT-A7','EXT-A8','EXT-A9','EXT-A10','EXT-A11','EXT-A12','EXT-A13','EXT-N3','EXT-N4','EXT-N5','EXT-N6','EXT-N7','CRI-1','CRI-2'])}
];
const PM_ITEMS=[];PM_LAYOUT.forEach(z=>z.items.forEach(it=>{if(it.group)it.subs.forEach(s=>PM_ITEMS.push({id:z.code+':'+s.key,name:s.name,zone:z.code}));else PM_ITEMS.push({id:z.code+':'+it.key,name:it.name,zone:z.code});}));
var pad=function(n){return String(n).padStart(2,'0');};
var fd=function(d){d=String(d||'');return d.length>=10?d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4):d;};
var pmMonth=today().slice(0,7),pmDate=today();
var monthName=function(m,short){var p=m.split('-').map(Number);return new Date(p[0],p[1]-1,1).toLocaleDateString('es-MX',{month:short?'short':'long',year:'numeric'});};
var daysIn=function(m){var p=m.split('-').map(Number);return new Date(p[0],p[1],0).getDate();};
function pmRec(month,create){var r=db.pmChecks.find(function(x){return x&&x._syncKind==='pmBoard'&&x.month===month;});if(!r&&create){r={id:'board:'+month,_syncKind:'pmBoard',month:month,board:{v:1,month:month,savedAt:0,done:{}}};db.pmChecks.push(r);}if(r&&(!r.board||!r.board.done))r.board={v:1,month:month,savedAt:0,done:{}};return r;}
function pmDone(month){var r=pmRec(month);return r?r.board.done:{};}
function pmCommit(r){r.board.savedAt=Date.now();r.updatedAt=new Date().toISOString();persist();}
function pmZoneOf(area){return /cam/i.test(area)?'CAM':/dim/i.test(area)?'DIM':/bsl/i.test(area)?'BSL':/2/.test(area)?'EXT2':'EXT1';}
function pmMarkMachine(code,area,date){var z=pmZoneOf(area),it=PM_ITEMS.find(function(i){return i.zone===z&&(i.id===z+':'+code||i.name===code);});if(!it)return;var month=date.slice(0,7),r=pmRec(month,true);if(!r.board.done[it.id]){r.board.done[it.id]={d:date,t:Date.now()};pmCommit(r);}}
function pmPoints(area){var z=pmZoneOf(area);return z==='CAM'?CAM_CHECK:z==='DIM'?DIM_CHECK:z==='BSL'?MQ.filter(function(g){return g[1].length;}):EXT_CHECK;}
var seg=function(name,opts){return '<span class="pm-seg">'+opts.map(function(o){return '<label><input type="radio" name="'+name+'" value="'+o+'">'+o+'</label>';}).join('')+'</span>';};
function mtUpdatePmChecklist(){var h=$('mtPmChecklist');if(!h)return;var code=$('mtPmMachine').value,m=machines().find(function(x){return x.code===code;}),area=m?m.area:'',z=pmZoneOf(area),s='';
 if(z.indexOf('EXT')===0){s+='<div class="card"><div class="section-title">Temperatura y consumo</div>'+ZONAS.map(function(n,i){return '<div class="pm-zr"><b>'+escT(n)+'</b><span><input id="mtPmT'+i+'" inputmode="decimal" placeholder="°C"><input id="mtPmA'+i+'" inputmode="decimal" placeholder="A"></span></div>';}).join('')+'</div><div class="card"><div class="section-title">Prueba operativa</div>'+SOPL.map(function(n,i){return '<div class="pm-zr"><b>'+escT(n)+'</b>'+seg('mtPmS'+i,['OK','NO'])+'</div>';}).join('')+'</div>';}
 var k=0;pmPoints(area).forEach(function(g,n){s+='<div class="card"><div class="section-title">'+escT(g[0])+'</div><button class="btn" onclick="mtPmAllOk('+n+')">Marcar zona en OK</button>'+g[1].map(function(t){var id='mtPmP'+n+'_'+(k++);return '<div class="pm-zr"><b>'+escT(t)+'</b>'+seg(id,['OK','Falla','N/A'])+'</div>';}).join('')+'</div>';});
 if(z==='DIM'&&/^(BM|BD)-/i.test(code)){s+='<div class="card"><div class="section-title">Uso de la grasera</div><div class="pm-grease">';for(var p=1;p<=GREASE_N;p++)s+='<label><input type="checkbox" class="mtPmG" value="'+p+'"><span>'+p+'</span></label>';s+='</div></div>';}
 h.className='mt';h.innerHTML=s;}
function mtPmAllOk(n){document.querySelectorAll('#mtPmChecklist input[type=radio][value=OK]').forEach(function(i){if(n==null||i.name.indexOf('mtPmP'+n+'_')===0)i.checked=true;});}
function mtSavePreventive(){var code=$('mtPmMachine').value,m=machines().find(function(x){return x.code===code;}),area=m?m.area:'',date=$('mtPmDate').value||today(),checks=[],miss=null,k=0;
 pmPoints(area).forEach(function(g,n){g[1].forEach(function(t){var c=document.querySelector('input[name="mtPmP'+n+'_'+(k++)+'"]:checked');if(!c&&!miss)miss=t;checks.push({zone:g[0],item:t,v:c?c.value:''});});});
 if(miss){toastT('Falta marcar: '+miss);return;}
 var measures=[],tests=[];ZONAS.forEach(function(n,i){if($('mtPmT'+i))measures.push({point:n,temp:$('mtPmT'+i).value.trim(),amp:$('mtPmA'+i).value.trim()});});SOPL.forEach(function(n,i){var c=document.querySelector('input[name="mtPmS'+i+'"]:checked');if(c)tests.push({item:n,v:c.value});});
 var grease=Array.from(document.querySelectorAll('.mtPmG:checked')).map(function(i){return Number(i.value);});
 var ok=checks.filter(function(x){return x.v==='OK';}).length,fails=checks.filter(function(x){return x.v==='Falla';}).length;
 db.pmChecks.unshift({id:uid(),date:date,machine:code,area:area,machineLabel:m?m.area+' · '+m.code:code,technician:$('mtPmTech').value.trim(),checks:checks,measures:measures,tests:tests,grease:grease,completed:ok,fails:fails,total:checks.length,notes:$('mtPmNotes').value.trim(),createdAt:new Date().toISOString()});
 pmMarkMachine(code,area,date);persist();renderPreventive();renderCalendar();mtUpdatePmChecklist();$('mtPmNotes').value='';toastT('Preventivo registrado'+(fails?' · '+fails+' falla(s)':'')+'.');}
function renderPreventive(){var h=$('mtPmRows');if(!h)return;h.innerHTML=db.pmChecks.filter(function(r){return r&&!r._syncKind;}).slice(0,100).map(function(r){var f=(r.checks||[]).filter(function(x){return x.v==='Falla';}).map(function(x){return x.item;});return '<tr><td>'+escT(r.date)+'</td><td>'+escT(r.area)+'</td><td>'+escT(r.machineLabel||r.machine)+'</td><td>'+escT(r.technician||'—')+'</td><td>'+(r.completed||0)+'/'+(r.total||0)+(f.length?' · ⚠'+f.length:'')+'</td><td>'+escT((f.length?'Fallas: '+f.join(', ')+'. ':'')+(r.notes||'')||'—')+'</td></tr>';}).join('')||'<tr><td colspan="6">Sin preventivos registrados.</td></tr>';}
function mtShiftMonth(delta){var p=pmMonth.split('-').map(Number),d=new Date(p[0],p[1]-1+delta,1);pmMonth=d.getFullYear()+'-'+pad(d.getMonth()+1);pmDate=pmMonth===today().slice(0,7)?today():pmMonth+'-01';renderCalendar();}
function mtPmSetDate(v){if(!v||v.slice(0,7)!==pmMonth){toastT('La fecha debe estar dentro de '+monthName(pmMonth)+'.');$('mtPmDateIn').value=pmDate;return;}pmDate=v;}
function mtPmToggle(id){var it=PM_ITEMS.find(function(i){return i.id===id;});if(!it)return;var r=pmRec(pmMonth,true);if(r.board.done[id]){if(!confirm('¿Quitar el check de '+it.name+'?'))return;delete r.board.done[id];}else r.board.done[id]={d:pmDate,t:Date.now()};pmCommit(r);renderCalendar();}
function mtPmReset(){var r=pmRec(pmMonth),n=r?Object.keys(r.board.done).length:0;if(!n){toastT('Este mes no tiene checks.');return;}if(!confirm('Se quitarán los '+n+' checks de '+monthName(pmMonth)+'. ¿Continuar?'))return;r.board.done={};pmCommit(r);renderCalendar();}
function mtPmCsv(){var done=pmDone(pmMonth),q=function(v){return '"'+String(v).replace(/"/g,'""')+'"';},rows=[['Zona','Máquina','Preventivo','Fecha']];PM_ITEMS.forEach(function(i){var r=done[i.id];rows.push([i.zone,i.name,r?'Hecho':'Pendiente',r?fd(r.d):'']);});var a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+rows.map(function(r){return r.map(q).join(',');}).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.download='PREVENTIVO_'+pmMonth.replace('-','')+'.csv';document.body.appendChild(a);a.click();a.remove();}
function pmCell(z,m,done){var id=z+':'+m.key,rec=done[id];return '<button type="button" class="pm-cell'+(rec?' is-done':'')+(m.short.length>=9&&m.short.indexOf(' ')<0?' is-long':'')+'" data-id="'+escT(id)+'" title="'+escT(m.name)+'">'+escT(m.short)+'<small>'+(rec?escT(fd(rec.d).slice(0,5)):'')+'</small></button>';}
function renderCalendar(){var h=$('mtPmPlant');if(!h)return;var month=pmMonth,days=daysIn(month),done=pmDone(month),total=PM_ITEMS.length,doneItems=PM_ITEMS.filter(function(i){return done[i.id];}),n=doneItems.length,pending=total-n,pct=total?Math.round(n*100/total):0,mlabel=monthName(month);
 $('mtPmMonth').textContent=mlabel.charAt(0).toUpperCase()+mlabel.slice(1);var di=$('mtPmDateIn');di.min=month+'-01';di.max=month+'-'+pad(days);di.value=pmDate;
 var zs=function(c){var l=PM_ITEMS.filter(function(i){return i.zone===c;});return {total:l.length,done:l.filter(function(i){return done[i.id];}).length};};
 h.innerHTML=PM_LAYOUT.map(function(z){var s=zs(z.code);return '<section class="pm-zone" data-z="'+z.code+'"><div class="pm-zone-head"><h3>'+escT(z.title)+'</h3><span>'+s.done+'/'+s.total+'</span></div><div class="pm-scroll"><div class="pm-grid" style="--cols:'+z.cols+'">'+z.items.map(function(it){return it.group?'<div class="pm-group" style="--span:'+it.span+'"><b>'+escT(it.group)+'</b><div class="pm-subs" style="--n:'+it.cols+'">'+it.subs.map(function(sb){return pmCell(z.code,sb,done);}).join('')+'</div></div>':pmCell(z.code,it,done);}).join('')+'</div></div></section>';}).join('');
 var rec=pmRec(month),sv=rec&&rec.board.savedAt;$('mtPmSummaryText').textContent=n+' de '+total+' · '+pct+'%';$('mtPmFill').style.width=pct+'%';$('mtPmSaved').textContent=sv?'Guardado '+new Date(sv).toLocaleString('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Sin cambios guardados';
 var now=today().slice(0,7),el=month===now?new Date().getDate():month<now?days:0,rate=el?n/el:0,rateTxt=el?(rate<10?rate.toFixed(1):Math.round(rate))+'':'—',rateNote=month===now&&el?'Proyección al cierre: '+Math.min(total,Math.round(rate*days)):month<now?'Mes cerrado':'Mes por iniciar',perDay=Array(days).fill(0);
 doneItems.forEach(function(i){var d=Number(String(done[i.id].d||'').slice(8,10));if(d>=1&&d<=days)perDay[d-1]++;});var mx=Math.max.apply(null,[1].concat(perDay));
 var row=function(l,d,t){var p=t?Math.round(d*100/t):0;return '<div class="pm-row"><b>'+escT(l)+'</b><div class="pm-track"><div class="pm-fill" style="width:'+p+'%"></div></div><em>'+d+'/'+t+' · '+p+'%</em></div>';};
 var pend=pending?PM_LAYOUT.map(function(z){var l=PM_ITEMS.filter(function(i){return i.zone===z.code&&!done[i.id];});return l.length?'<div class="pm-pending-zone"><b>'+escT(z.title)+' · '+l.length+'</b><div class="pm-chips">'+l.map(function(i){return '<span class="pm-chip">'+escT(i.name)+'</span>';}).join('')+'</div></div>':'';}).join(''):'<p class="muted">Todas las máquinas ya tienen su preventivo de este mes.</p>';
 var hist=db.pmChecks.filter(function(r){return r&&r._syncKind==='pmBoard'&&r.board&&r.board.done;}).map(function(r){return {month:r.month,done:PM_ITEMS.filter(function(i){return r.board.done[i.id];}).length};}).sort(function(a,b){return b.month.localeCompare(a.month);}).slice(0,6);
 var kpi=function(a,b,c){return '<div class="pm-kpi"><span>'+a+'</span><b>'+b+'</b><small>'+escT(c)+'</small></div>';};
 $('mtPmStats').innerHTML='<div class="section-title">Estadísticas de '+escT(mlabel)+'</div><div class="pm-kpis">'+kpi('CON PREVENTIVO',n,'de '+total+' máquinas')+kpi('PENDIENTES',pending,'por atender')+kpi('AVANCE DEL MES',pct+'%','cumplimiento')+kpi('RITMO DIARIO',rateTxt,rateNote)+'</div><div class="pm-panels"><div class="pm-panel"><h3>Avance por área</h3>'+PM_LAYOUT.map(function(z){var s=zs(z.code);return row(z.title,s.done,s.total);}).join('')+'</div><div class="pm-panel"><h3>Preventivos por día</h3><div class="pm-days">'+perDay.map(function(v,i){return '<div class="pm-day" title="Día '+(i+1)+': '+v+'">'+(v?'<u>'+v+'</u>':'')+'<i style="height:'+Math.round(v*100/mx)+'%"></i></div>';}).join('')+'</div><div class="pm-axis">'+perDay.map(function(v,i){return '<span>'+((i===0||(i+1)%5===0)?i+1:'')+'</span>';}).join('')+'</div></div><div class="pm-panel"><h3>Máquinas pendientes</h3>'+pend+'</div><div class="pm-panel"><h3>Historial de meses</h3>'+(hist.length?hist.map(function(x){return row(monthName(x.month,true),x.done,total);}).join(''):'<p class="muted">Aún no hay meses guardados.</p>')+'</div></div>';}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#mtPmPlant [data-id]');if(b)mtPmToggle(b.dataset.id);});
Object.assign(window,{mtAddTask:mtAddTask,mtMoveTask:mtMoveTask,mtDeleteTask:mtDeleteTask,mtAddReminder:mtAddReminder,mtCompleteReminder:mtCompleteReminder,mtDeleteReminder:mtDeleteReminder,mtAddNote:mtAddNote,mtDeleteNote:mtDeleteNote,mtSaveDaily:mtSaveDaily,mtUpdatePmChecklist:mtUpdatePmChecklist,mtSavePreventive:mtSavePreventive,mtShiftMonth:mtShiftMonth,mtPmAllOk:mtPmAllOk,mtPmSetDate:mtPmSetDate,mtPmReset:mtPmReset,mtPmCsv:mtPmCsv});
installUI();
if(typeof render==='function'){try{render();}catch(e){console.warn('[Chiaplast Tools]',e);}}
})();