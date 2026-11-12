/** Librerías de terceros, empaquetadas (sin CDN). Exponen los mismos globales que antes. */
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import { createClient } from '@supabase/supabase-js';

window.Chart = Chart;
window.jspdf = { jsPDF };
window.supabase = { createClient };
