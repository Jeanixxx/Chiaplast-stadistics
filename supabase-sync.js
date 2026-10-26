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
    { key: 'meal.employees', type: 'personal', get: () => db.meal?.employees, set: v => { db.meal.employees = v; } },
    { key: 'meal.historial', type: 'historial_comidas', get: () => db.meal?.historial, set: v => { db.meal.historial = v; } },
    { key: 'meal.semanaActual', type: 'rol_comidas', get: () => db.meal?.semanaActual, set: v => { db.meal.semanaActual = v; } }
  ];

  function status(message, kind = 'info') {
    const el = document.getElementById(statusId);
    if (!el) return;
    el.textContent = message;
    el.dataset.kind = kind;
  }

  function addStylesAndPanel() {
    if (!document.getElementById('supabaseSyncStyles')) {
      const style = document.createElement('style');
      style.id = 'supabaseSyncStyles';
      style.textContent =
        '#supabaseSyncPanel{position:fixed;right:14px;bottom:14px;z-index:9999;width:min(360px,calc(100vw - 28px));background:var(--panel,#fff);color:var(--text,#172033);border:1px solid var(--border,#d7dde7);border-radius:12px;padding:14px;box-shadow:0 8px 28px #0002;font:13px/1.4 system-ui,sans-serif}' +
        '#supabaseSyncPanel h3{font-size:14px;margin:0 0 8px}#supabaseSyncPanel input{box-sizing:border-box;width:100%;margin:4px 0 8px;padding:9px;border:1px solid #cbd5e1;border-radius:7px}' +
        '#supabaseSyncPanel button{border:0;border-radius:7px;padding:8px 10px;margin:3px 4px 3px 0;cursor:pointer;background:#155e75;color:white}' +
        '#supabaseSyncPanel button.secondary{background:#e2e8f0;color:#172033}#supabaseSyncStatus{margin:8px 0;color:#475569}#supabaseSyncStatus[data-kind="error"]{color:#b91c1c}#supabaseSyncStatus[data-kind="ok"]{color:#047857}' +
        '#supabaseSyncPanel .sync-actions{display:flex;flex-wrap:wrap}#supabaseSyncPanel small{display:block;color:#64748b;margin-top:6px}';
      document.head.appendChild(style);
    }
    if (document.getElementById('supabaseSyncPanel')) return;
    const panel = document.createElement('section');
    panel.id = 'supabaseSyncPanel';
    panel.innerHTML =
      '<h3>Sincronización Chiaplast</h3>' +
      '<div id="supabaseAuthForm">' +
        '<label for="supabaseEmail">Correo de Supabase</label>' +
        '<input id="supabaseEmail" type="email" autocomplete="username" placeholder="correo@empresa.com">' +
        '<label for="supabasePassword">Contraseña</label>' +
        '<input id="supabasePassword" type="password" autocomplete="current-password" placeholder="Contraseña">' +
        '<div class="sync-actions"><button id="supabaseSignIn">Iniciar sesión</button><button id="supabaseSignUp" class="secondary">Crear cuenta</button></div>' +
      '</div>' +
      '<div id="supabaseLoggedIn" hidden><div id="supabaseUserLabel"></div>' +
        '<div class="sync-actions"><button id="supabaseSyncNow">Sincronizar ahora</button><button id="supabaseSignOut" class="secondary">Cerrar sesión</button></div>' +
      '</div>' +
      '<div id="' + statusId + '" role="status" aria-live="polite">Preparando conexión…</div>' +
      '<small>Datos operativos compartidos entre usuarios autenticados. Los indicadores se calculan en la aplicación.</small>';
    document.body.appendChild(panel);
    document.getElementById('supabaseSignIn').addEventListener('click', signIn);
    document.getElementById('supabaseSignUp').addEventListener('click', signUp);
    document.getElementById('supabaseSignOut').addEventListener('click', signOut);
    document.getElementById('supabaseSyncNow').addEventListener('click', syncAll);
  }

  function showAuth(session) {
    document.getElementById('supabaseAuthForm').hidden = !!session;
    document.getElementById('supabaseLoggedIn').hidden = !session;
    document.getElementById('supabaseUserLabel').textContent =
      session?.user?.email ? 'Sesión: ' + session.user.email : '';
  }

  async function signIn() {
    if (!supabase) return status('No se pudo cargar la biblioteca de Supabase. Comprueba internet.', 'error');
    const email = document.getElementById('supabaseEmail').value.trim();
    const password = document.getElementById('supabasePassword').value;
    if (!email || !password) return status('Escribe tu correo y contraseña.', 'error');
    status('Iniciando sesión…');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return status('No se pudo iniciar sesión: ' + error.message, 'error');
    showAuth(data.session);
    status('Sesión iniciada. Preparando sincronización…', 'ok');
    await startRealtime();
    await syncAll();
  }

  async function signUp() {
    if (!supabase) return status('No se pudo cargar la biblioteca de Supabase.', 'error');
    const email = document.getElementById('supabaseEmail').value.trim();
    const password = document.getElementById('supabasePassword').value;
    if (!email || password.length < 8) return status('Escribe un correo y una contraseña de al menos 8 caracteres.', 'error');
    status('Creando cuenta…');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return status('No se pudo crear la cuenta: ' + error.message, 'error');
    status('Solicitud enviada. Si se solicita confirmar el correo, revisa tu bandeja antes de iniciar sesión.', 'ok');
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) return status('No se pudo cerrar sesión: ' + error.message, 'error');
    if (channel) await supabase.removeChannel(channel);
    channel = null;
    showAuth(null);
    status('Sesión cerrada. Los datos locales se conservan.');
  }

  function uuid() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function isTuple(row) { return Array.isArray(row); }
  function tupleId(row) {
    const item = row[row.length - 1];
    return typeof item === 'string' && item.indexOf('__cloudid:') === 0 ? item.slice(10) : '';
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
        if (isTuple(item.row)) {
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
    const col = findCollection(collection);
    if (!col) return;
    const rows = col.get();
    if (!Array.isArray(rows)) return;
    col.set(rows.filter(row => idOf(row) !== id));
  }
  function putLocalRecord(collection, id, record, timestamp) {
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
    const machine = isTuple(record) ? '' : (record.machine || record.maquina || record.machineId || record.id || '');
    const date = isTuple(record) ? String(record[0] || '') : String(record.date || record.fecha || record.date_created || '');
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
      if (!col) return;
      const localRows = col.get() || [];
      const local = localRows.find(row => idOf(row) === remote.id);
      if (!local) {
        putLocalRecord(remote.collection, remote.id, remote.record, remote.updatedAt);
        changed = true;
        return;
      }
      const localTime = Date.parse(timeOf(local) || '') || 0;
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
      status('Leyendo datos operativos compartidos…');
      ensureLocalIds();
      const { data: rows, error } = await supabase.from(TABLE)
        .select('id,tipo,fecha_reporte,area,maquina,datos,actualizado_en');
      if (error) throw error;

      const merged = mergeRemote(rows || []);
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
      });
  }

  function installSaveHook() {
    if (typeof save !== 'function' || save.__supabaseWrapped) return;
    const originalSave = save;
    const wrapped = function(...args) {
      if (!syncingRemote) markLocalChanges();
      const result = originalSave.apply(this, args);
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
    addStylesAndPanel();
    if (!supabase) {
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
      status('Supabase listo. Inicia sesión para sincronizar los datos operativos.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();