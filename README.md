# Chiaplast · Gestión integral

Aplicación de gestión de mantenimiento industrial con versión web, instalador de Windows y APK Android nativa basada en WebView (**sin Capacitor en el proceso de compilación Android**).

## Usar en computadora sin Python ni herramientas de programación

La opción recomendada para una computadora Windows es el instalador `.exe` generado por GitHub Actions. El usuario final no necesita instalar Python, Node.js ni abrir una terminal.

1. Abre la pestaña **Actions** del repositorio.
2. Entra en la ejecución completada de **Build Windows installer** correspondiente a la rama `feature/supabase-sync`.
3. Descarga el artefacto `chiaplast-windows-installer`.
4. Extrae el artefacto si GitHub lo entrega como ZIP y ejecuta el instalador `.exe`.

El instalador no está firmado digitalmente, por lo que Windows puede mostrar una advertencia de seguridad. Instálalo únicamente si verificaste que proviene de este repositorio.

## Descargar la APK Android desde GitHub

1. Abre **Actions**.
2. Selecciona la ejecución de **Build Android APK (native WebView, no Capacitor)** para la rama `feature/supabase-sync`.
3. Espera a que la ejecución termine correctamente.
4. En **Artifacts**, descarga `chiaplast-android-native-debug-apk`.
5. Extrae el ZIP e instala `app-debug.apk` en tu tablet. Android puede pedir autorización para instalar aplicaciones de esa fuente.

La APK es de depuración para pruebas y no está preparada para publicarse en Google Play. Los artefactos de Actions se conservan durante 30 días.

## Probar localmente

Para probar la versión web desde el código fuente: `npm run build` y después sirve la carpeta `dist/` con cualquier servidor HTTP estático (por ejemplo, `python3 -m http.server 8000 --directory dist`). No abras `index.html` con doble clic: el service worker necesita HTTP(S). El usuario final de Windows no necesita hacerlo si utiliza el instalador `.exe`.

## Sincronización Supabase

La aplicación utiliza la URL HTTPS del proyecto Supabase configurada en `supabase-sync.js`. Esa URL no debe reemplazarse por `localhost`: localhost es únicamente para el servidor de pruebas local.

La sincronización operativa de esta rama usa la tabla existente `public.chiaplast_reportes` y comparte entre sesiones autenticadas fallas/eventos, órdenes de trabajo, preventivos, máquinas, tarjetas, chasis, refacciones, historial, registros de personal y rol de comidas. Se conserva una copia local para trabajar sin conexión; los cambios se envían al recuperar internet e iniciar sesión. Los indicadores, gráficas, disponibilidad calculada, MTBF/MTTR, tendencias y predicciones se calculan en la aplicación y no se guardan como registros centrales. Las eliminaciones se sincronizan mediante marcadores de borrado. Esta ampliación requiere validar las políticas RLS existentes y probar con dos sesiones antes de considerarla lista para producción.

La clave de cliente configurada es una publishable key. Nunca agregar una clave `service_role` o una clave secreta al HTML, JavaScript o APK. En esta etapa se solicita acceso compartido para todos los usuarios autenticados. Las políticas RLS de `chiaplast_reportes` deben permitirles leer y escribir los registros operativos compartidos; no se deben ejecutar aún las migraciones nuevas de `supabase/migrations/`, porque el sincronizador de esta rama todavía usa la tabla existente. Las migraciones son un diseño posterior y requieren revisión y pruebas por separado.

## Compilación y pruebas

```bash
npm ci          # dependencias exactas (lockfile)
npm run build   # genera dist/: bundle JavaScript, HTML, CSS, manifest y service worker
npm test        # pruebas unitarias + prueba de humo en Chromium sobre dist/ (requiere Playwright; ver abajo)
```

- Las librerías (Chart.js, jsPDF y Supabase) se empaquetan dentro de `dist/app.js`; ya no se cargan desde CDN.
- Windows: Electron genera un instalador `.exe` (`npm run build:windows`).
- Android: el workflow copia `dist/` al WebView nativo (sin Capacitor en el proceso de compilación).
- Para `npm test` la primera vez: `npx playwright install chromium`.


## Datos y limitaciones actuales

La aplicación principal mantiene datos en `localStorage`. El sincronizador cubre las colecciones operativas indicadas arriba; no sincroniza preferencias de interfaz ni métricas derivadas. Borrar datos de la app o cambiar de navegador puede afectar los datos locales. Exporta respaldos antes de actualizar.

## Estructura del código

```
index.html               Marcado de la interfaz (punto de entrada; carga dist/app.js)
src/
  main.js                Entrada: orden de carga, handlers expuestos en window y service worker
  vendor.js              Chart.js, jsPDF y Supabase empaquetados (globales window.Chart, window.jspdf, window.supabase)
  core/state.js          Estado mutable único (state.db, state.currentView, ...)
  core/services.js       Registro de servicios de capas superiores (render, navegación, selectores); lo completa bootstrap.js
  core/format.js         Escape HTML y badges (puros)
  core/ui.js             Guardado (save + hooks), notificaciones, preferencias
  data/seed.js           Datos iniciales (semilla)
  domain/dates.js        Fechas locales puras (iso, parseLocalDate, now)
  domain/proxima-falla.js  Cálculo puro de próxima falla (con pruebas unitarias)
  domain/                Reglas de negocio sin DOM: máquinas, clasificación de fallas, producción, predicciones
  features/              Flujos: importación semanal/mensual, equipo, comidas, informes PDF, compras, financiero
  ui/                    Navegación, modales, gráficas
  views/                 Una vista por módulo: dashboard, operaciones, preventivo, historial, backlog...
  tools/maintenance-tools.js  Kanban, recordatorios, notas técnicas, chequeos diarios y preventivo
  sync/supabase-sync.js  Autenticación y sincronización con Supabase (usa saveHooks; no reemplaza funciones globales)
  styles/styles.css      Estilos
pwa/sw.template.js       Plantilla del service worker (el build genera versión de caché y lista de precarga)
scripts/build-web.mjs    Build con esbuild
tests/unit.mjs           Pruebas unitarias de lógica pura
tests/smoke.mjs          Prueba de humo end-to-end
```

Convenciones: los módulos se comunican por `import`/`export`; el estado compartido vive solo en `state`. Las capas bajas (núcleo, dominio, features) no importan vistas ni modales: llaman a `services`, que `bootstrap.js` completa. El grafo de imports no tiene ciclos. Solo los handlers que el HTML invoca (`onclick="..."`) se exponen en `window`.

## Interfaz de acceso y estado de sincronización

La rama `feature/supabase-schema-v1` incluye una pantalla de inicio de sesión de estilo industrial para CHIAPLAST. El sistema muestra la aplicación detrás de la pantalla de acceso y permite entrar con una sesión válida de Supabase Auth. No se ofrece alta libre de cuentas desde esta pantalla; las cuentas deben existir o ser creadas por el procedimiento autorizado de la organización.

El indicador flotante de la esquina inferior derecha cambia de forma y animación para distinguir conexión, envío, recepción, sincronización completada, error y falta de internet. Al pulsarlo se muestran el detalle del estado, la acción de sincronizar manualmente y el cierre de sesión. Si no hay internet, la aplicación indica que los cambios se conservan localmente y vuelve a intentar sincronizar cuando se recupera la conexión.

La interfaz no constituye por sí sola un control de autorización de base de datos: los permisos reales siguen dependiendo de Supabase Auth y las políticas RLS. Se debe validar la experiencia con una cuenta real antes de fusionar y desplegar.
