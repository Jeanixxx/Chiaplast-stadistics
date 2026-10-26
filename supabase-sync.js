/* Chiaplast Statistics — sincronización de datos operativos compartidos.
 * Usa la tabla existente public.chiaplast_reportes para no exigir una migración
 * de base de datos en esta etapa. No guarda indicadores matemáticos calculados.
 * Nunca colocar una service_role/secret key en el cliente.
 */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://kxediwwncowzksycazdt.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_J-wKdhig_K5uHFlMqSzzfQ_8BOEVoKU';
  const TABLE = 'chiaplast_reportes';
  const PENDING_DELETIONS_KEY = 'SL_SUPABASE_PENDING_DELETIONS_V1';
  const supabase = window.supabase?.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  let channel = null;
  let busy = false;
  let saveTimer = null;
  let syncingRemote = false;
  let lastSnapshot = null;
  const statusId = 'supabaseSyncStatus';

  const COLLECTIONS = [
    { key: 'events', type: 'falla', get: () => db.events, set: v => { db.events = v; } },
    { key: 'workOrders', type: 'orden_trabajo', get: () => db.workOrders, set: v => { db.workOrders = v; } },
    { key: 'pm', type: 'preventivo', get: () => db.pm, set: v => { db.pm = v; } },
    { key: 'machines', type: 'maquina', get: () => db.machines, set: v => { db.machines = v; } },
    { key: 'cards', type: 'tarjeta_maquina', get: () => db.cards, set: v => { db.cards = v; } },
    { key: 'chassis', type: 'chasis', get: () => db.chassis, set: v => { db.chassis = v; } },
    { key: 'parts', type: 'refaccion', get: () => db.parts, set: v => { db.parts = v; } },
    { key: 'negligencia', type: 'gestion_negligencia', get: () => db.negligencia, set: v => { db.negligencia = v; } },
    { key: 'history', type: 'historial', get: () => db.history, set: v => { db.history = v; } },
    // Herramientas operativas esenciales. Usan tipo diario para respetar la restricción existente de la tabla.
    { key: 'kanban', type: 'diario', get: () => db.kanban, set: v => { db.kanban = v; } },
    { key: 'reminders', type: 'diario', get: () => db.reminders, set: v => { db.reminders = v; } },
    { key: 'technicalNotes', type: 'diario', get: () => db.technicalNotes, set: v => { db.technicalNotes = v; } },
    { key: 'dailyChecks', type: 'diario', get: () => db.dailyChecks, set: v => { db.dailyChecks = v; } },
    { key: 'pmChecks', type: 'diario', get: () => db.pmChecks, set: v => { db.pmChecks = v; } },
    { key: 'meal.employees', type: 'personal', get: () => db.meal?.employees, set: v => { db.meal.employees = v; } },
    { key: 'meal.historial', type: 'historial_comidas', get: () => db.meal?.historial, set: v => { db.meal.historial = v; } },
    { key: 'meal.semanaActual', type: 'rol_comidas', get: () => db.meal?.semanaActual, set: v => { db.meal.semanaActual = v; } }
  ];

  const SINGLETONS = [
    { key: 'config.keywords', type: 'configuracion', get: () => db.keywords, set: v => { db.keywords = v; } },
    { key: 'config.crew', type: 'configuracion', get: () => db.crew, set: v => { db.crew = v; } },
    { key: 'config.meal', type: 'configuracion', get: () => db.meal?.config, set: v => { if (!db.meal) db.meal = {}; db.meal.config = v; } },
    { key: 'config.finanzas', type: 'configuracion_financiera',
      get: () => { try { return JSON.parse(localStorage.getItem('SL_FIN_CONFIG') || 'null'); } catch (_) { return null; } },
      set: v => { try { localStorage.setItem('SL_FIN_CONFIG', JSON.stringify(v)); } catch (_) {} } }
  ];

  function status(message, kind = 'info') {
    const el = document.getElementById(statusId);
    if (el) { el.textContent = message; el.dataset.kind = kind; }
    const dock = document.getElementById('chiaplastSyncDock'), orb = document.getElementById('cpSyncOrb');
    if (!dock || !orb) return;
    const lower = String(message || '').toLowerCase();
    let state = kind;
    if (!navigator.onLine || /sin conexión|offline|desconectad/.test(lower)) state = 'offline';
    else if (kind === 'error' || /error|no se pudo|falló|fallo/.test(lower)) state = 'error';
    else if (/recibiendo|descargando|leyendo datos|consultando datos/.test(lower)) state = 'download';
    else if (/enviando|subiendo|guardando en supabase|publicando cambios/.test(lower)) state = 'upload';
    else if (/sincronizando|preparando sincronización|preparando conexión|validando credenciales/.test(lower)) state = 'sync';
    else if (/completada|conectado a cambios|sesión iniciada/.test(lower) || kind === 'ok') state = 'ok';
    else state = 'idle';
    orb.dataset.state = state; orb.title = message || 'Estado de sincronización';
    orb.setAttribute('aria-label', 'Estado de sincronización: ' + message);
    const labels = {upload:['ENVIANDO DATOS','Subiendo cambios a la nube'],download:['RECIBIENDO DATOS','Actualizando desde la nube'],sync:['SINCRONIZANDO','Conectando con Supabase'],offline:['SIN CONEXIÓN','Cambios locales conservados'],error:['ATENCIÓN REQUERIDA','Revisa el detalle del estado'],ok:['SINCRONIZADO','Datos actualizados'],idle:['SISTEMA EN ESPERA','Listo para sincronizar']};
    const label = labels[state] || labels.idle;
    const title=document.getElementById('cpSyncTitle'), summary=document.getElementById('cpSyncSummary'), detail=document.getElementById('cpSyncDetailTitle');
    if(title) title.textContent=label[0]; if(summary) summary.textContent=label[1]; if(detail) detail.textContent=label[0];
    const authMessage=document.getElementById('cpAuthMessage'), gate=document.getElementById('chiaplastAuthGate');
    if(authMessage && gate && !gate.hidden){authMessage.textContent=message || 'Introduce tus credenciales.';authMessage.dataset.kind=kind==='error'?'error':kind==='ok'?'ok':'info';}
  }

  function showAuth(session) {
    const gate=document.getElementById('chiaplastAuthGate');
    if(gate) gate.hidden=!!session;
    document.body.dataset.authenticated=session?'true':'false';
    const detail=document.getElementById('cpSyncDetailTitle'), authMessage=document.getElementById('cpAuthMessage');
    if(detail && session) detail.textContent='Sesión activa';
    if(authMessage && session){authMessage.textContent='Acceso autorizado.';authMessage.dataset.kind='ok';}
  }

  async function signIn(event) {
    if(event) event.preventDefault();
    if(!supabase) return status('No se pudo cargar Supabase. Comprueba tu conexión a internet.','error');
    const email=document.getElementById('supabaseEmail').value.trim(), password=document.getElementById('supabasePassword').value;
    const button=document.getElementById('supabaseSignIn');
    if(!email || !password) return status('Escribe tu correo y contraseña.','error');
    if(button){button.disabled=true;button.textContent='VALIDANDO CREDENCIALES…';}
    status('Validando credenciales…','sync');
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(button){button.disabled=false;button.innerHTML='ACCEDER AL SISTEMA <span aria-hidden="true">↗</span>';}
    if(error){status('No se pudo iniciar sesión. Verifica tus credenciales e inténtalo de nuevo.','error');console.warn('[Chiaplast Auth]',error.message);return;}
    showAuth(data.session); status('Sesión iniciada. Preparando sincronización…','sync');
    await startRealtime(); await syncAll();
  }

  async function signOut() {
    const {error}=await supabase.auth.signOut();
    if(error) return status('No se pudo cerrar sesión: '+error.message,'error');
    if(channel) await supabase.removeChannel(channel);
    channel=null; showAuth(null);
    const password=document.getElementById('supabasePassword'); if(password) password.value='';
    status('Sesión cerrada. Los datos locales se conservan.');
  }

  function installSyncDock() {
    const orb=document.getElementById('cpSyncOrb'), dock=document.getElementById('chiaplastSyncDock');
    const form=document.getElementById('cpLoginForm'), manual=document.getElementById('cpSyncManual'), logout=document.getElementById('supabaseSignOut');
    if(form) form.addEventListener('submit',signIn);
    if(manual) manual.addEventListener('click',syncAll);
    if(logout) logout.addEventListener('click',signOut);
    if(orb && dock){
      orb.addEventListener('click',()=>{const open=dock.dataset.open!=='true';dock.dataset.open=open?'true':'false';orb.setAttribute('aria-expanded',String(open));});
      document.addEventListener('click',event=>{if(!dock.contains(event.target)){dock.dataset.open='false';orb.setAttribute('aria-expanded','false');}});
      document.addEventListener('keydown',event=>{if(event.key==='Escape'){dock.dataset.open='false';orb.setAttribute('aria-expanded','false');}});
    }
    window.addEventListener('offline',()=>status('Sin conexión a internet. Los cambios se conservan localmente.','offline'));
    window.addEventListener('online',()=>{status('Conexión recuperada. Preparando sincronización…','sync');if(supabase)syncAll();});
  }

  function uuid() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function isTuple(row) { return Array.isArray(row); }
  function readMeta(key, fallback) {
    try { return Object.assign({}, JSON.parse(localStorage.getItem(key) || '{}')); }
    catch (_) { return {}; }
  }
  function singletonId(key) {
    const ids = readMeta('SL_SUPABASE_SINGLETON_IDS_V1');
    if (!ids[key]) {
      ids[key] = uuid();
      try { localStorage.setItem('SL_SUPABASE_SINGLETON_IDS_V1', JSON.stringify(ids)); } catch (_) {}
    }
    return ids[key];
  }
  function singletonTimestamp(key, value) {
    const times = readMeta('SL_SUPABASE_SINGLETON_TIMES_V1');
    if (value !== undefined) {
      times[key] = value || '';
      try { localStorage.setItem('SL_SUPABASE_SINGLETON_TIMES_V1', JSON.stringify(times)); } catch (_) {}
    }
    return times[key] || '';
  }
  function findSingleton(key) { return SINGLETONS.find(item => item.key === key); }
  function tupleId(row) {
    const last = row[row.length - 1];
    const prior = row[row.length - 2];
    if (typeof last === 'string' && last.indexOf('__cloudid:') === 0) return last.slice(10);
    return typeof prior === 'string' && prior.indexOf('__cloudid:') === 0 ? prior.slice(10) : '';
  }
  function tupleTime(row) {
    const item = row[row.length - 1];
    const prior = row[row.length - 2];
    return typeof item === 'string' && item.indexOf('__cloudts:') === 0 ? item.slice(10) :
      (typeof prior === 'string' && prior.indexOf('__cloudts:') === 0 ? prior.slice(10) : '');
  }
  function setTupleMeta(row, id, timestamp) {
    const out = row.slice();
    while (out.length && typeof out[out.length - 1] === 'string' &&
      (out[out.length - 1].indexOf('__cloudid:') === 0 || out[out.length - 1].indexOf('__cloudts:') === 0)) out.pop();
    out.push('__cloudid:' + id, '__cloudts:' + timestamp);
    return out;
  }
  function idOf(row) {
    if (isTuple(row)) return tupleId(row);
    return row && typeof row === 'object' ? (row._supabaseId || row._cloudId || '') : '';
  }
  function timeOf(row) {
    if (isTuple(row)) return tupleTime(row);
    return row && typeof row === 'object' ? (row._cloudUpdatedAt || '') : '';
  }
  function cleanRecord(row) {
    if (isTuple(row)) {
      const out = row.slice();
      while (out.length && typeof out[out.length - 1] === 'string' &&
        (out[out.length - 1].indexOf('__cloudid:') === 0 || out[out.length - 1].indexOf('__cloudts:') === 0)) out.pop();
      return out;
    }
    const out = Object.assign({}, row || {});
    delete out._supabaseId;
    delete out._cloudId;
    delete out._cloudUpdatedAt;
    // These are dashboard/analysis outputs, not authoritative central records.
    if (out && typeof out === 'object' && !Array.isArray(out) && out.id && out.name && 'dailyTarget' in out) {
      delete out.runtime;
      delete out.cycles;
      delete out.availability;
      delete out.powerKwh;
      delete out.lastPowerOutage;
    }
    return out;
  }

  function ensureLocalIds() {
    if (typeof db === 'undefined' || !db) return;
    COLLECTIONS.forEach(col => {
      const rows = col.get();
      if (!Array.isArray(rows)) return;
      rows.forEach(row => {
        if (isTuple(row)) {
          if (!tupleId(row)) {
            const meta = setTupleMeta(row, uuid(), '');
            row.splice(0, row.length, ...meta);
          }
        } else if (row && typeof row === 'object') {
          if (!row._supabaseId) row._supabaseId = uuid();
        }
      });
    });
  }

  function collectionEntries() {
    const out = [];
    COLLECTIONS.forEach(col => {
      const rows = col.get();
      if (!Array.isArray(rows)) return;
      rows.forEach(row => {
        if (!row || typeof row !== 'object') return;
        const id = idOf(row);
        if (!id) return;
        out.push({ collection: col.key, type: col.type, id, row, record: cleanRecord(row), updatedAt: timeOf(row) || '' });
      });
    });
    SINGLETONS.forEach(item => {
      const value = item.get();
      if (value == null) return;
      out.push({ collection: item.key, type: item.type, id: singletonId(item.key), row: null,
        record: cleanRecord(value), updatedAt: singletonTimestamp(item.key), singleton: true });
    });
    return out;
  }

  function snapshotNow() {
    const map = new Map();
    collectionEntries().forEach(item => map.set(item.collection + ':' + item.id, JSON.stringify(item.record)));
    return map;
  }

  function getPendingDeletions() {
    try { return JSON.parse(localStorage.getItem(PENDING_DELETIONS_KEY) || '[]'); }
    catch (_) { return []; }
  }
  function setPendingDeletions(items) {
    try { localStorage.setItem(PENDING_DELETIONS_KEY, JSON.stringify(items)); } catch (_) {}
  }

  function markLocalChanges() {
    if (syncingRemote || typeof db === 'undefined' || !db) return;
    ensureLocalIds();
    const current = collectionEntries();
    const next = new Map();
    const now = new Date().toISOString();
    current.forEach(item => {
      const key = item.collection + ':' + item.id;
      const serialized = JSON.stringify(item.record);
      next.set(key, serialized);
      const previous = lastSnapshot?.get(key);
      if (lastSnapshot && previous !== serialized) {
        if (item.singleton) {
          singletonTimestamp(item.collection, now);
        } else if (isTuple(item.row)) {
          const tagged = setTupleMeta(item.row, item.id, now);
          item.row.splice(0, item.row.length, ...tagged);
        } else {
          item.row._cloudUpdatedAt = now;
        }
      }
    });
    if (lastSnapshot) {
      const currentKeys = new Set(current.map(item => item.collection + ':' + item.id));
      const pending = getPendingDeletions();
      const pendingKeys = new Set(pending.map(item => item.collection + ':' + item.id));
      lastSnapshot.forEach((_, key) => {
        if (currentKeys.has(key) || pendingKeys.has(key)) return;
        const split = key.indexOf(':');
        pending.push({ collection: key.slice(0, split), id: key.slice(split + 1), deletedAt: now });
        pendingKeys.add(key);
      });
      setPendingDeletions(pending);
    }
    lastSnapshot = snapshotNow();
  }

  function findCollection(key) { return COLLECTIONS.find(col => col.key === key); }
  function removeLocalRecord(collection, id) {
    const singleton = findSingleton(collection);
    if (singleton) { singleton.set(null); singletonTimestamp(collection, ''); return; }
    const col = findCollection(collection);
    if (!col) return;
    const rows = col.get();
    if (!Array.isArray(rows)) return;
    col.set(rows.filter(row => idOf(row) !== id));
  }
  function putLocalRecord(collection, id, record, timestamp) {
    const singleton = findSingleton(collection);
    if (singleton) {
      singleton.set(record);
      singletonId(collection);
      singletonTimestamp(collection, timestamp || '');
      return;
    }
    const col = findCollection(collection);
    if (!col) return;
    let rows = col.get();
    if (!Array.isArray(rows)) rows = [];
    const index = rows.findIndex(row => idOf(row) === id);
    let replacement;
    if (isTuple(record)) {
      replacement = setTupleMeta(record, id, timestamp || '');
    } else {
      replacement = Object.assign({}, record || {}, { _supabaseId: id, _cloudUpdatedAt: timestamp || '' });
      if (collection === 'machines') {
        const existing = index >= 0 ? rows[index] : null;
        replacement.runtime = existing?.runtime ?? 0;
        replacement.cycles = existing?.cycles ?? 0;
        replacement.availability = existing?.availability ?? 100;
        replacement.powerKwh = existing?.powerKwh ?? 0;
        replacement.lastPowerOutage = existing?.lastPowerOutage ?? '—';
      }
    }
    if (index >= 0) rows[index] = replacement;
    else rows.push(replacement);
    col.set(rows);
  }

  function areaFor(machine) {
    const value = String(machine || '').toUpperCase().trim();
    if (/^(BK-|BNG-|BC-|IMP-|CAM)/.test(value)) return 'CAM';
    if (/^(BM-|BD-|SELLADORA|HORNO M|DIM)/.test(value)) return 'DIM';
    if (/^(BW-|BN-|B-0|BSL-|ELEVADOR H)/.test(value)) return 'BSL';
    if (/^(EXT-|ECB-|CRI-)/.test(value)) return value.indexOf('EXT-A') === 0 || value.indexOf('EXT-N') === 0 ? 'EXT2' : 'EXT1';
    return '';
  }

  function toCloudRow(item) {
    const record = item.record;
    let machine = isTuple(record) ? '' : (record.machine || record.maquina || record.machineId || record.id || '');
    let date = isTuple(record) ? '' : String(record.date || record.fecha || record.date_created || '');
    if (isTuple(record)) {
      if (item.collection === 'pm') { machine = String(record[0] || ''); date = String(record[3] || ''); }
      else if (item.collection === 'parts') machine = String(record[4] || '');
      else if (item.collection === 'history') { date = String(record[0] || ''); machine = String(record[2] || ''); }
    }
    const updatedAt = item.updatedAt || new Date(0).toISOString();
    return {
      id: item.id,
      tipo: item.type,
      fecha_reporte: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10),
      area: (isTuple(record) ? '' : (record.area || '')) || areaFor(machine),
      maquina: machine,
      datos: { _syncVersion: 1, collection: item.collection, record: record, deleted: false, clientUpdatedAt: updatedAt },
      actualizado_en: updatedAt
    };
  }

  function decodeRemote(row) {
    const data = row?.datos;
    if (data && data._syncVersion === 1 && data.collection && data.deleted) {
      return { id: row.id, collection: data.collection, deleted: true, updatedAt: data.clientUpdatedAt || row.actualizado_en || '' };
    }
    if (data && data._syncVersion === 1 && data.collection && Object.prototype.hasOwnProperty.call(data, 'record')) {
      return { id: row.id, collection: data.collection, record: data.record, deleted: false,
        updatedAt: data.clientUpdatedAt || row.actualizado_en || '' };
    }
    // Backward compatibility with the first version, which stored events directly in datos.
    if (row?.tipo === 'falla' && data && typeof data === 'object') {
      const legacy = Object.assign({}, data, { _supabaseId: row.id });
      return { id: row.id, collection: 'events', record: cleanRecord(legacy), deleted: false,
        updatedAt: row.actualizado_en || '' };
    }
    return null;
  }

  function mergeRemote(rows) {
    let changed = false;
    const remoteById = new Map();
    (rows || []).forEach(row => {
      const item = decodeRemote(row);
      if (item) remoteById.set(item.id, item);
    });
    remoteById.forEach(remote => {
      if (remote.deleted) {
        removeLocalRecord(remote.collection, remote.id);
        changed = true;
        return;
      }
      const col = findCollection(remote.collection);
      const singleton = findSingleton(remote.collection);
      if (!col && !singleton) return;
      const localRows = col ? (col.get() || []) : [];
      const local = singleton ? singleton.get() : localRows.find(row => idOf(row) === remote.id);
      if (local == null) {
        putLocalRecord(remote.collection, remote.id, remote.record, remote.updatedAt);
        changed = true;
        return;
      }
      const localTime = Date.parse(singleton ? singletonTimestamp(remote.collection) : (timeOf(local) || '')) || 0;
      const remoteTime = Date.parse(remote.updatedAt || '') || 0;
      if (remoteTime > localTime) {
        putLocalRecord(remote.collection, remote.id, remote.record, remote.updatedAt);
        changed = true;
      }
    });
    return { changed, remoteById };
  }

  function tombstoneRow(item) {
    return {
      id: item.id,
      tipo: 'eliminado',
      fecha_reporte: new Date().toISOString().slice(0, 10),
      area: '',
      maquina: '',
      datos: { _syncVersion: 1, collection: item.collection, record: null, deleted: true, clientUpdatedAt: item.deletedAt || new Date().toISOString() },
      actualizado_en: item.deletedAt || new Date().toISOString()
    };
  }

  async function syncAll() {
    if (!supabase || busy || typeof db === 'undefined') return;
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) return status('No se pudo validar la sesión: ' + sessionError.message, 'error');
    if (!sessionData.session) return status('Inicia sesión para sincronizar.', 'error');
    busy = true;
    try {
      status('Recibiendo datos de Supabase…', 'download');
      ensureLocalIds();
      const { data: rows, error } = await supabase.from(TABLE)
        .select('id,tipo,fecha_reporte,area,maquina,datos,actualizado_en');
      if (error) throw error;

      const merged = mergeRemote(rows || []);
      status('Enviando cambios pendientes a Supabase…', 'upload');
      const pending = getPendingDeletions();
      const pendingByKey = new Map(pending.map(item => [item.collection + ':' + item.id, item]));
      const localEntries = collectionEntries();
      const writes = [];

      localEntries.forEach(item => {
        const remoteRow = (rows || []).find(row => row.id === item.id);
        const remote = remoteRow ? decodeRemote(remoteRow) : null;
        if (!remoteRow || !remote || remote.deleted) {
          writes.push(toCloudRow(item));
          return;
        }
        const localTime = Date.parse(item.updatedAt || '') || 0;
        const remoteTime = Date.parse(remote.updatedAt || '') || 0;
        const sameRecord = remote.collection === item.collection &&
          JSON.stringify(remote.record) === JSON.stringify(item.record);
        if (!sameRecord && localTime >= remoteTime) writes.push(toCloudRow(item));
      });

      pendingByKey.forEach(item => writes.push(tombstoneRow(item)));
      if (writes.length) {
        const { error: upsertError } = await supabase.from(TABLE).upsert(writes, { onConflict: 'id' });
        if (upsertError) throw upsertError;
      }
      if (pending.length) setPendingDeletions([]);

      if (merged.changed) {
        syncingRemote = true;
        try {
          if (typeof save === 'function') save();
          if (typeof render === 'function') render();
        } finally {
          syncingRemote = false;
        }
      } else if (typeof save === 'function') {
        syncingRemote = true;
        try { save(); } finally { syncingRemote = false; }
      }
      lastSnapshot = snapshotNow();
      status('Sincronización completada: ' + collectionEntries().length + ' registros operativos compartidos.', 'ok');
    } catch (err) {
      status('Error de sincronización: ' + (err?.message || String(err)), 'error');
      console.error('[Chiaplast Supabase]', err);
    } finally {
      busy = false;
    }
  }

  async function startRealtime() {
    if (!supabase || channel) return;
    channel = supabase.channel('chiaplast-operational-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => { if (!syncingRemote) syncAll(); }, 700);
      })
      .subscribe(state => {
        if (state === 'SUBSCRIBED') status('Conectado a cambios en tiempo real.', 'ok');
        else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') status('No se pudo mantener la conexión en tiempo real. Se reintentará al sincronizar.', 'error');
      });
  }

  function installSaveHook() {
    if (typeof save !== 'function' || save.__supabaseWrapped) return;
    const originalSave = save;
    const wrapped = function(...args) {
      if (!syncingRemote) markLocalChanges();
      const result = originalSave.apply(this, args);
      // save() also writes standalone settings such as SL_FIN_CONFIG.
      // Re-check after the original save so those settings receive a change timestamp.
      if (!syncingRemote) markLocalChanges();
      if (!syncingRemote) {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => { if (supabase) syncAll(); }, 1200);
      }
      return result;
    };
    wrapped.__supabaseWrapped = true;
    save = wrapped;
  }

  async function init() {
    installSyncDock();
    if (!supabase) {
      showAuth(null);
      status('No se pudo cargar Supabase JS. Verifica internet o el CDN.', 'error');
      return;
    }
    ensureLocalIds();
    lastSnapshot = snapshotNow();
    installSaveHook();
    const { data, error } = await supabase.auth.getSession();
    if (error) status('No se pudo leer la sesión: ' + error.message, 'error');
    showAuth(data?.session || null);
    supabase.auth.onAuthStateChange((_event, session) => {
      showAuth(session);
      if (session) {
        startRealtime();
        syncAll();
      } else {
        if (channel) supabase.removeChannel(channel);
        channel = null;
      }
    });
    if (data?.session) {
      await startRealtime();
      await syncAll();
    } else {
      status(navigator.onLine ? 'Supabase listo. Inicia sesión para sincronizar los datos operativos.' : 'Sin conexión a internet. Conéctate para iniciar sesión.', navigator.onLine ? 'info' : 'offline');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();