/* Chiaplast Statistics — integración inicial con Supabase.
 * Public key only; never place service_role/secret keys in the client.
 * This first phase syncs machine failure/events (db.events).
 */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://kxediwwncowzksycazdt.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_J-wKdhig_K5uHFlMqSzzfQ_8BOEVoKU';
  const TABLE = 'chiaplast_reportes';
  const supabase = window.supabase?.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  let channel = null;
  let busy = false;
  let saveTimer = null;
  let syncingRemote = false;
  const statusId = 'supabaseSyncStatus';

  function status(message, kind = 'info') {
    const el = document.getElementById(statusId);
    if (!el) return;
    el.textContent = message;
    el.dataset.kind = kind;
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function addStylesAndPanel() {
    if (!document.getElementById('supabaseSyncStyles')) {
      const style = document.createElement('style');
      style.id = 'supabaseSyncStyles';
      style.textContent = `
        #supabaseSyncPanel{position:fixed;right:14px;bottom:14px;z-index:9999;width:min(360px,calc(100vw - 28px));background:var(--panel,#fff);color:var(--text,#172033);border:1px solid var(--border,#d7dde7);border-radius:12px;padding:14px;box-shadow:0 8px 28px #0002;font:13px/1.4 system-ui,sans-serif}
        #supabaseSyncPanel h3{font-size:14px;margin:0 0 8px}#supabaseSyncPanel input{box-sizing:border-box;width:100%;margin:4px 0 8px;padding:9px;border:1px solid #cbd5e1;border-radius:7px}
        #supabaseSyncPanel button{border:0;border-radius:7px;padding:8px 10px;margin:3px 4px 3px 0;cursor:pointer;background:#155e75;color:white}
        #supabaseSyncPanel button.secondary{background:#e2e8f0;color:#172033}#supabaseSyncStatus{margin:8px 0;color:#475569}#supabaseSyncStatus[data-kind="error"]{color:#b91c1c}#supabaseSyncStatus[data-kind="ok"]{color:#047857}
        #supabaseSyncPanel .sync-actions{display:flex;flex-wrap:wrap}#supabaseSyncPanel small{display:block;color:#64748b;margin-top:6px}
      `;
      document.head.appendChild(style);
    }
    if (document.getElementById('supabaseSyncPanel')) return;
    const panel = document.createElement('section');
    panel.id = 'supabaseSyncPanel';
    panel.innerHTML = `
      <h3>Sincronización Chiaplast</h3>
      <div id="supabaseAuthForm">
        <label for="supabaseEmail">Correo de Supabase</label>
        <input id="supabaseEmail" type="email" autocomplete="username" placeholder="correo@empresa.com">
        <label for="supabasePassword">Contraseña</label>
        <input id="supabasePassword" type="password" autocomplete="current-password" placeholder="Contraseña">
        <div class="sync-actions">
          <button id="supabaseSignIn">Iniciar sesión</button>
          <button id="supabaseSignUp" class="secondary">Crear cuenta</button>
        </div>
      </div>
      <div id="supabaseLoggedIn" hidden>
        <div id="supabaseUserLabel"></div>
        <div class="sync-actions">
          <button id="supabaseSyncNow">Sincronizar fallas ahora</button>
          <button id="supabaseSignOut" class="secondary">Cerrar sesión</button>
        </div>
      </div>
      <div id="${statusId}" role="status" aria-live="polite">Preparando conexión…</div>
      <small>Esta primera fase sincroniza fallas/eventos. Los datos diarios y mensuales se integrarán en la siguiente fase.</small>
    `;
    document.body.appendChild(panel);
    document.getElementById('supabaseSignIn').addEventListener('click', signIn);
    document.getElementById('supabaseSignUp').addEventListener('click', signUp);
    document.getElementById('supabaseSignOut').addEventListener('click', signOut);
    document.getElementById('supabaseSyncNow').addEventListener('click', syncAll);
  }

  function showAuth(session) {
    document.getElementById('supabaseAuthForm').hidden = !!session;
    document.getElementById('supabaseLoggedIn').hidden = !session;
    document.getElementById('supabaseUserLabel').textContent = session?.user?.email ? 'Sesión: ' + session.user.email : '';
  }

  async function signIn() {
    if (!supabase) return status('No se pudo cargar la biblioteca de Supabase. Comprueba la conexión a internet.', 'error');
    const email = document.getElementById('supabaseEmail').value.trim();
    const password = document.getElementById('supabasePassword').value;
    if (!email || !password) return status('Escribe tu correo y contraseña.', 'error');
    status('Iniciando sesión…');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return status('No se pudo iniciar sesión: ' + error.message, 'error');
    showAuth(data.session);
    status('Sesión iniciada. Sincronizando fallas…', 'ok');
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
    status('Solicitud enviada. Si Supabase exige confirmar el correo, revisa tu bandeja y confirma antes de iniciar sesión.', 'ok');
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) return status('No se pudo cerrar sesión: ' + error.message, 'error');
    if (channel) await supabase.removeChannel(channel);
    channel = null;
    showAuth(null);
    status('Sesión cerrada.');
  }

  function ensureEventIds() {
    if (!Array.isArray(db.events)) db.events = [];
    let changed = false;
    db.events.forEach(ev => {
      if (!ev._supabaseId) {
        ev._supabaseId = (window.crypto?.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }));
        changed = true;
      }
    });
    return changed;
  }

  function toRow(ev) {
    const eventDate = String(ev.date || ev.fecha || new Date().toISOString().slice(0,10)).slice(0,10);
    return {
      id: ev._supabaseId,
      tipo: 'falla',
      fecha_reporte: /^\d{4}-\d{2}-\d{2}$/.test(eventDate) ? eventDate : new Date().toISOString().slice(0,10),
      area: ev.area || '',
      maquina: ev.machine || ev.maquina || '',
      datos: ev,
      actualizado_en: new Date().toISOString()
    };
  }

  async function syncAll() {
    if (!supabase || busy) return;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return status('Inicia sesión para sincronizar.', 'error');
    busy = true;
    try {
      status('Leyendo reportes de fallas en Supabase…');
      const { data: rows, error } = await supabase.from(TABLE).select('id,tipo,fecha_reporte,area,maquina,datos,actualizado_en').eq('tipo','falla');
      if (error) throw error;

      const remoteById = new Map((rows || []).map(row => [row.id, row]));
      const byId = new Map((Array.isArray(db.events) ? db.events : []).filter(e => e._supabaseId).map(e => [e._supabaseId, e]));
      let remoteChanged = false;
      for (const row of (rows || [])) {
        const remote = row.datos && typeof row.datos === 'object' ? {...row.datos, _supabaseId: row.id} : null;
        if (!remote) continue;
        const existing = byId.get(row.id);
        if (!existing) {
          db.events.unshift(remote);
          byId.set(row.id, remote);
          remoteChanged = true;
        } else if (JSON.stringify(existing) !== JSON.stringify(remote)) {
          Object.assign(existing, remote);
          remoteChanged = true;
        }
      }

      ensureEventIds();
      const rowsToWrite = (db.events || []).map(ev => ({ ev, row: toRow(ev) })).filter(({ev, row}) => {
        const remoteRow = remoteById.get(row.id);
        if (!remoteRow) return true;
        // Evita upserts redundantes que provocarían otro evento Realtime.
        return JSON.stringify(remoteRow.datos || {}) !== JSON.stringify(ev);
      }).map(x => x.row);
      if (rowsToWrite.length) {
        const { error: upsertError } = await supabase.from(TABLE).upsert(rowsToWrite, { onConflict: 'id' });
        if (upsertError) throw upsertError;
      }
      if (remoteChanged) {
        syncingRemote = true;
        try { save(); if (typeof render === 'function') render(); }
        finally { syncingRemote = false; }
      } else if (typeof save === 'function') {
        // Persist assigned stable IDs locally without changing the visible UI.
        save();
      }
      status('Sincronización completada: ' + (db.events || []).length + ' falla(s)/evento(s).', 'ok');
    } catch (err) {
      status('Error de sincronización: ' + (err?.message || String(err)), 'error');
      console.error('[Chiaplast Supabase]', err);
    } finally {
      busy = false;
    }
  }

  async function startRealtime() {
    if (!supabase || channel) return;
    channel = supabase.channel('chiaplast-reportes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, payload => {
        if (payload.new?.tipo === 'falla' || payload.old?.tipo === 'falla') {
          clearTimeout(saveTimer);
          saveTimer = setTimeout(() => { if (!syncingRemote) syncAll(); }, 500);
        }
      })
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') status('Conectado a cambios en tiempo real.', 'ok');
      });
  }

  function installSaveHook() {
    if (typeof save !== 'function' || save.__supabaseWrapped) return;
    const originalSave = save;
    const wrapped = function(...args) {
      const result = originalSave.apply(this, args);
      if (!syncingRemote) {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          if (supabase) syncAll();
        }, 1200);
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
      status('Supabase listo. Inicia sesión para comenzar.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();