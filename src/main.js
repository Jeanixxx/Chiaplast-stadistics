/**
 * Punto de entrada. Carga los módulos en el mismo orden que el app.js original
 * y expone en window solo los handlers referenciados desde el HTML (onclick, onchange, ...).
 */
import './vendor.js';
import { state } from './core/state.js';
import './domain/machines.js';
import './data/seed.js';
import { reclasificarEventosExistentes } from './domain/failure-classifier.js';
import './domain/production.js';
import { closeMobileMenu, exportCSV, hardRefreshApp, toggleDarkMode, toggleFocusMode, toggleMobileMenu, toggleNavGroup, undoLastChange } from './core/ui.js';
import { clearWeeklyImport, importWeeklyReport, previewWeeklyImport } from './features/weekly-import.js';
import { clearMonthlyImport, importMonthlyReport, previewMonthlyImport } from './features/monthly-import.js';
import './ui/navigation.js';
import { clearMachineSelection, onSidePeriodChange, setDashToday, shiftDashDate } from './views/dashboard.js';
import { agregarMaquinaDB, closeWO, completePm, editKeywords, eliminarMaquinaDB, renderEvents, renderMachineDB, resetMachineDB, updateMaquinaDB } from './views/operations.js';
import { renderPrediccionesAvanzadas } from './domain/predictions.js';
import { historyDeleteRow, historyDeleteSelected, historyEditDesc, historyExportSelected, historySelectFiltered, historySelectPage, historyToggleSel, renderHistory } from './views/history.js';
import { exportPowerBI } from './features/powerbi-export.js';
import { removePerson, renderPersonAnalysis, renderTeam, savePerson, selectTeamPerson, teamSetField } from './features/team.js';
import './ui/charts.js';
import { togglePreventiveMachine } from './views/preventive.js';
import { setMachinePeriod } from './views/machine-detail.js';
import { closeModal, exportData, importData, openModal, saveEvent, savePart, savePm, saveWO } from './ui/modals.js';
import { agregarEmpleadoComida, agregarHistorialComida, archivarSemanaComidas, generarSemanaComidas, limpiarSemanalComidas, mealEliminarEmpleado, mealEliminarHistorial, mealSetField, recalcularComidas, showMealTab } from './features/meals.js';
import { descargarInforme } from './features/report-pdf.js';
import { agregarNegligencia, negligenciaEliminar } from './features/purchases.js';
import { backlogToggleReady, guardarCrew, renderFichaMaquina, renderSemanaPlanta, renderTableroCompra } from './views/backlog.js';
import { renderPmRecommendations } from './views/pm-recommendations.js';
import { copiarFinanciero, exportarFinancieroPDF, onFinMachineChange, renderFinanciero, usarHorasRealesFin } from './features/financial.js';
import './bootstrap.js';
import { mtAddNote, mtAddReminder, mtAddTask, mtCompleteReminder, mtDeleteNote, mtDeleteReminder, mtDeleteTask, mtMoveTask, mtPmAllOk, mtPmCsv, mtPmReset, mtPmSetDate, mtSaveDaily, mtSavePreventive, mtShiftMonth, mtUpdatePmChecklist } from './tools/maintenance-tools.js';
import './sync/supabase-sync.js';

window.__chiaplastState = state;
Object.assign(window, {
  agregarEmpleadoComida,
  agregarHistorialComida,
  agregarMaquinaDB,
  agregarNegligencia,
  archivarSemanaComidas,
  backlogToggleReady,
  clearMachineSelection,
  clearMonthlyImport,
  clearWeeklyImport,
  closeMobileMenu,
  closeModal,
  closeWO,
  completePm,
  copiarFinanciero,
  descargarInforme,
  editKeywords,
  eliminarMaquinaDB,
  exportCSV,
  exportData,
  exportPowerBI,
  exportarFinancieroPDF,
  generarSemanaComidas,
  guardarCrew,
  hardRefreshApp,
  historyDeleteRow,
  historyDeleteSelected,
  historyEditDesc,
  historyExportSelected,
  historySelectFiltered,
  historySelectPage,
  historyToggleSel,
  importData,
  importMonthlyReport,
  importWeeklyReport,
  limpiarSemanalComidas,
  mealEliminarEmpleado,
  mealEliminarHistorial,
  mealSetField,
  mtAddNote,
  mtAddReminder,
  mtAddTask,
  mtCompleteReminder,
  mtDeleteNote,
  mtDeleteReminder,
  mtDeleteTask,
  mtMoveTask,
  mtPmAllOk,
  mtPmCsv,
  mtPmReset,
  mtPmSetDate,
  mtSaveDaily,
  mtSavePreventive,
  mtShiftMonth,
  mtUpdatePmChecklist,
  negligenciaEliminar,
  onFinMachineChange,
  onSidePeriodChange,
  openModal,
  previewMonthlyImport,
  previewWeeklyImport,
  recalcularComidas,
  reclasificarEventosExistentes,
  removePerson,
  renderEvents,
  renderFichaMaquina,
  renderFinanciero,
  renderHistory,
  renderMachineDB,
  renderPersonAnalysis,
  renderPmRecommendations,
  renderPrediccionesAvanzadas,
  renderSemanaPlanta,
  renderTableroCompra,
  renderTeam,
  resetMachineDB,
  saveEvent,
  savePart,
  savePerson,
  savePm,
  saveWO,
  selectTeamPerson,
  setDashToday,
  setMachinePeriod,
  shiftDashDate,
  showMealTab,
  teamSetField,
  toggleDarkMode,
  toggleFocusMode,
  toggleMobileMenu,
  toggleNavGroup,
  togglePreventiveMachine,
  undoLastChange,
  updateMaquinaDB,
  usarHorasRealesFin,
});

// Service worker: solo cachea la interfaz estática (ver sw.js).
if (location.protocol === "https:" || location.protocol === "http:") {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" })
        .catch(error => console.warn("[Chiaplast PWA] No se pudo registrar el service worker:", error));
    });
  }
}
