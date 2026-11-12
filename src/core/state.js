/**
 * Estado mutable global de la aplicación (única fuente de verdad en tiempo de ejecución).
 * Cada módulo lee y escribe propiedades de `state` en lugar de variables sueltas,
 * para que el estado compartido sea explícito y pueda cambiar entre módulos.
 */
import { seed } from '../data/seed.js';

export const state = {
  AREA_ORDER: undefined,
  LIVE_MACHINE_DB: undefined,
  _finResizeTimer: undefined,
  _histFilterCache: {key:'',rows:null},
  _prevDbJson: null,
  charts: {},
  currentArea: undefined,
  currentView: 'dashboard',
  dashRefDate: undefined,
  db: JSON.parse(localStorage.getItem('SL_CMMS_DB_v2')||'null')||seed,
  finCharts: {},
  finData: undefined,
  historyPage: 0,
  machinePeriod: 'day',
  selectedMachine: '',
};
