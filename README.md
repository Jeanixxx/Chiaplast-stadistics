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

Para probar la versión web desde el código fuente, sirve la carpeta con cualquier servidor HTTP estático. El usuario final de Windows no necesita hacerlo si utiliza el instalador `.exe`.

## Sincronización Supabase

La aplicación utiliza la URL HTTPS del proyecto Supabase configurada en `supabase-sync.js`. Esa URL no debe reemplazarse por `localhost`: localhost es únicamente para el servidor de pruebas local.

La sincronización operativa de esta rama usa la tabla existente `public.chiaplast_reportes` y comparte entre sesiones autenticadas fallas/eventos, órdenes de trabajo, preventivos, máquinas, tarjetas, chasis, refacciones, historial, registros de personal y rol de comidas. Se conserva una copia local para trabajar sin conexión; los cambios se envían al recuperar internet e iniciar sesión. Los indicadores, gráficas, disponibilidad calculada, MTBF/MTTR, tendencias y predicciones se calculan en la aplicación y no se guardan como registros centrales. Las eliminaciones se sincronizan mediante marcadores de borrado. Esta ampliación requiere validar las políticas RLS existentes y probar con dos sesiones antes de considerarla lista para producción.

La clave de cliente configurada es una publishable key. Nunca agregar una clave `service_role` o una clave secreta al HTML, JavaScript o APK. En esta etapa se solicita acceso compartido para todos los usuarios autenticados. Las políticas RLS de `chiaplast_reportes` deben permitirles leer y escribir los registros operativos compartidos; no se deben ejecutar aún las migraciones nuevas de `supabase/migrations/`, porque el sincronizador de esta rama todavía usa la tabla existente. Las migraciones son un diseño posterior y requieren revisión y pruebas por separado.

## Compilación

GitHub Actions construye automáticamente Windows y Android cuando hay cambios en `main`, `python` o `feature/supabase-sync`, y también puede ejecutarse manualmente desde **Actions**.

- Windows: Electron genera un instalador `.exe`.
- Android: Gradle compila una aplicación Android nativa que muestra los archivos locales en Android WebView usando AndroidX WebKit. La compilación no ejecuta Capacitor ni `cap sync`.
- El proceso web copia `index.html`, `app.js`, `styles.css` y `supabase-sync.js` a `dist`, para que el módulo de sincronización también se incluya en los artefactos.

## Datos y limitaciones actuales

La aplicación principal mantiene datos en `localStorage`. El sincronizador cubre las colecciones operativas indicadas arriba; no sincroniza preferencias de interfaz ni métricas derivadas. Borrar datos de la app o cambiar de navegador puede afectar los datos locales. Exporta respaldos antes de actualizar.

## Archivos principales

- `index.html`: interfaz de la aplicación.
- `styles.css`: diseño adaptable.
- `app.js`: navegación, estado y módulos.
- `supabase-sync.js`: autenticación y sincronización de datos operativos compartidos.
- `scripts/build-web.mjs`: prepara los archivos web para los instaladores.
- `android/app/src/main/java/com/chiaplast/gestion/MainActivity.java`: contenedor Android WebView nativo.


## Interfaz de acceso y estado de sincronización

La rama `feature/supabase-schema-v1` incluye una pantalla de inicio de sesión de estilo industrial para CHIAPLAST. El sistema muestra la aplicación detrás de la pantalla de acceso y permite entrar con una sesión válida de Supabase Auth. No se ofrece alta libre de cuentas desde esta pantalla; las cuentas deben existir o ser creadas por el procedimiento autorizado de la organización.

El indicador flotante de la esquina inferior derecha cambia de forma y animación para distinguir conexión, envío, recepción, sincronización completada, error y falta de internet. Al pulsarlo se muestran el detalle del estado, la acción de sincronizar manualmente y el cierre de sesión. Si no hay internet, la aplicación indica que los cambios se conservan localmente y vuelve a intentar sincronizar cuando se recupera la conexión.

La interfaz no constituye por sí sola un control de autorización de base de datos: los permisos reales siguen dependiendo de Supabase Auth y las políticas RLS. Se debe validar la experiencia con una cuenta real antes de fusionar y desplegar.
