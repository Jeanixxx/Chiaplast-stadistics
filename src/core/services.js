/**
 * Registro de servicios de capas superiores (inversión de dependencias).
 * Los módulos de dominio y núcleo llaman a estas funciones sin importar vistas, modales o gráficas,
 * que son capas superiores. src/bootstrap.js registra las implementaciones reales antes de arrancar.
 */
export const services = {
  save: () => {},
  navigateToView: () => {},
  closeModal: () => {},
  updateDashPeriodLabel: () => {},
  syncPeriodControls: () => {},
  render: () => {},
  getDashPeriod: () => 'day',
  syncMaintenanceStorageFromDb: () => {},
  destroyCharts: () => {},
  destroyFinCharts: () => {},
  invalidateHistoryCache: () => {},
  fillAreaSelectUI: () => {},
  fillReportMachineSelect: () => {},
  fillFinMachineSelect: () => {},
  fillFichaMachineSelect: () => {},
  fillNegligenciaMachineSelect: () => {},
};

/** Configuración de vistas; navigation.js la completa. Vive aquí para evitar un ciclo core -> ui. */
export const VIEW_CONFIG = {};
