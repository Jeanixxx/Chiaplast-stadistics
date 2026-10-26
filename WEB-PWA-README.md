# Chiaplast Statistics — versión web/PWA

## Qué incluye
- Interfaz web adaptable a computadoras y tabletas.
- Instalación como aplicación desde un navegador compatible mediante HTTPS.
- Caché local únicamente de los archivos estáticos de la interfaz para permitir abrir la última versión visitada si la red falla.
- Los datos de Supabase, autenticación y Realtime **no se guardan en el caché del service worker**.

## Importante sobre la sincronización
La integración Supabase que existe actualmente sincroniza la colección de **fallas/eventos**. Otros módulos siguen usando almacenamiento local hasta que se integre y pruebe su sincronización de forma explícita. No se debe interpretar el indicador de conexión como sincronización de todos los módulos.

No se modificó el esquema ni se ejecutaron escrituras en Supabase durante la preparación de la PWA.

## Instalación
La PWA debe servirse desde HTTPS (por ejemplo, GitHub Pages) y no abrirse haciendo doble clic en `index.html`. Al visitar la URL en Chrome o Edge, usa el menú del navegador para instalar Chiaplast.

El ZIP generado por CI contiene los archivos de publicación web. No es un instalador de Windows ni un servidor local.

## Protección de datos
- No colocar claves `service_role` ni secretos en archivos de cliente.
- La clave publishable del cliente no sustituye las políticas RLS de Supabase.
- Antes de usar en producción, verificar RLS, permisos por usuario, Realtime en la tabla y pruebas con dos dispositivos.
