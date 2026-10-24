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

La integración inicial sincroniza fallas/eventos de máquina con la tabla `public.chiaplast_reportes`. Los módulos de reportes diarios y mensuales aún no están integrados en esta fase. Para sincronizar dispositivos se requiere conexión a internet y una sesión autenticada.

La clave de cliente configurada es una publishable key. Nunca agregar una clave `service_role` o una clave secreta al HTML, JavaScript o APK. Antes de uso de producción, restringir las políticas RLS para que cada usuario solo pueda acceder a los datos que le corresponden.

## Compilación

GitHub Actions construye automáticamente Windows y Android cuando hay cambios en `main`, `python` o `feature/supabase-sync`, y también puede ejecutarse manualmente desde **Actions**.

- Windows: Electron genera un instalador `.exe`.
- Android: Gradle compila una aplicación Android nativa que muestra los archivos locales en Android WebView usando AndroidX WebKit. La compilación no ejecuta Capacitor ni `cap sync`.
- El proceso web copia `index.html`, `app.js`, `styles.css` y `supabase-sync.js` a `dist`, para que el módulo de sincronización también se incluya en los artefactos.

## Datos y limitaciones actuales

La aplicación principal mantiene datos en `localStorage`. La sincronización remota actualmente cubre fallas/eventos; no significa que todos los módulos estén sincronizados todavía. Borrar datos de la app o cambiar de navegador puede afectar los datos locales. Exporta respaldos antes de actualizar.

## Archivos principales

- `index.html`: interfaz de la aplicación.
- `styles.css`: diseño adaptable.
- `app.js`: navegación, estado y módulos.
- `supabase-sync.js`: autenticación y sincronización inicial de fallas.
- `scripts/build-web.mjs`: prepara los archivos web para los instaladores.
- `android/app/src/main/java/com/chiaplast/gestion/MainActivity.java`: contenedor Android WebView nativo.
