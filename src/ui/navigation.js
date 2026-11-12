/** Módulo: ui/navigation.js */
import { services } from '../core/services.js';
import { VIEW_CONFIG } from '../core/services.js';
export { VIEW_CONFIG };

import { state } from '../core/state.js';

import { renderPredictive } from '../domain/predictions.js';

import { renderFinanciero } from '../features/financial.js';

import { renderMealBoard, renderMealEmpleados, renderMealHistorial } from '../features/meals.js';

import { renderNegligencia } from '../features/purchases.js';


import { renderTeam } from '../features/team.js';

import { renderBacklog, renderFichaMaquina, renderSemanaPlanta, renderTableroCompra } from '../views/backlog.js';

import { renderDashboard } from '../views/dashboard.js';

import { renderHistory, renderParts } from '../views/history.js';

import { renderCards, renderEvents, renderPm, renderWO } from '../views/operations.js';

import { renderPmRecommendations } from '../views/pm-recommendations.js';

Object.assign(VIEW_CONFIG, {
  dashboard:{title:'Dashboard',render:renderDashboard},
  semanaPlanta:{title:'Semana de la planta',render:renderSemanaPlanta},
  fichaMaquina:{title:'Ficha de máquina',render:renderFichaMaquina},
  preventivo:{title:'Preventivos',render:()=>{renderPm();renderPmRecommendations();}},
  predictivo:{title:'Predictivo',render:renderPredictive},
  correctivo:{title:'Correctivos / OT',render:renderWO},
  eventos:{title:'Fallas y eventos',render:renderEvents},
  tarjetas:{title:'Base de máquinas',render:()=>{renderCards();}},
  historial:{title:'Historial',render:renderHistory},
  importar:{title:'Reporte diario'},
  mensual:{title:'Reporte mensual'},
  refacciones:{title:'Refacciones',render:renderParts},
  equipo:{title:'Equipo de mantenimiento',render:()=>{
    const date=document.getElementById('teamRefDate');
    if(date&&!date.value) date.value=state.dashRefDate;
    renderTeam();
  }},
  comidas:{title:'Rol de comidas',render:()=>{
    renderMealBoard();
    renderMealEmpleados();
    renderMealHistorial();
  }},
  informes:{title:'Informes PDF',render:()=>services.fillReportMachineSelect()},
  negligencia:{title:'Gestión financiera',render:()=>{
    services.fillNegligenciaMachineSelect();
    renderNegligencia();
  }},
  backlog:{title:'Backlog (SMRP 5.4.9)',render:renderBacklog},
  tableroCompra:{title:'Tablero de compra',render:renderTableroCompra},
  financiero:{title:'Justificación de compras',render:renderFinanciero}
});

