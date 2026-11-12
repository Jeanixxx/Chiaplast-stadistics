/**
 * Cálculo puro de la próxima falla: última falla + intervalo medio entre fallas consecutivas.
 * Sin dependencias del DOM ni del estado, para poder probarlo de forma aislada.
 * @param {Date[]} fechas fechas válidas de fallas de una máquina
 * @returns {{proxima: Date, ultima: Date, promedioDias: number, n: number} | null} null si hay menos de 3 fechas
 */
export function calcularProximaFalla(fechas) {
  const DIA = 86400000;
  const orden = fechas.filter(d => d instanceof Date && !isNaN(d)).sort((a, b) => a - b);
  if (orden.length < 3) return null;
  let suma = 0;
  for (let i = 1; i < orden.length; i++) suma += (orden[i] - orden[i - 1]) / DIA;
  const promedioDias = suma / (orden.length - 1);
  const ultima = orden[orden.length - 1];
  return {
    proxima: new Date(ultima.getTime() + promedioDias * DIA),
    ultima,
    promedioDias,
    n: orden.length,
  };
}
