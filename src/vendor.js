/** Librerías de terceros empaquetadas (sin CDN). Se importan por nombre desde cada módulo. */
import ChartJs from 'chart.js/auto';
import { jsPDF as JsPDF } from 'jspdf';
import { createClient } from '@supabase/supabase-js';

export const Chart = ChartJs;
export const jsPDF = JsPDF;
export { createClient };
