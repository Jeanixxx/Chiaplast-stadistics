# Chiaplast · Gestión integral

Aplicación web local para consultar y administrar la operación de planta desde una sola interfaz.

## Iniciar

La app no requiere compilación ni instalación de dependencias. Desde esta carpeta, inicia un servidor estático:

```bash
python3 -m http.server 8000
```

Después abre [http://localhost:8000](http://localhost:8000) en el navegador. Chart.js y jsPDF se cargan desde CDN, por lo que las gráficas y exportaciones PDF requieren conexión a internet.

## Módulos

- Dashboard, resumen semanal y ficha de máquina.
- Mantenimiento preventivo, predictivo y correctivo, eventos e historial.
- Catálogo de máquinas, refacciones, equipo de mantenimiento y rol de comidas.
- Importación de reportes diarios y mensuales, informes PDF y backlog.
- Gestión financiera, compras y pérdidas por falta de refacciones.

Las pantallas comparten los filtros de área, máquina y periodo. La navegación y la pantalla activa se restauran al volver a abrir la app.

## Datos

Los datos se guardan en el `localStorage` del navegador y no se envían a un servidor. El historial se puede exportar a CSV; esa exportación no incluye el resto de los datos guardados. Borrar los datos del sitio o cambiar de navegador puede eliminar o dejar atrás los registros locales.

## Archivos

- `index.html`: estructura de la aplicación.
- `styles.css`: estilos y diseño adaptable.
- `app.js`: estado compartido, navegación y funciones de los módulos.
