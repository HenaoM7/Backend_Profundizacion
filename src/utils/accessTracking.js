/**
 * Obtiene el año y mes actual en formato ISO
 * @returns {string} Formato: YYYY-MM
 */
export const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Obtiene el año y mes de una fecha específica
 * @param {Date|string} date - Fecha a procesar
 * @returns {string} Formato: YYYY-MM
 */
export const getMonthKey = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Verifica si una fecha está dentro de los últimos 7 días
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean}
 */
export const isWithin7Days = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now - d);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
};

/**
 * Limpia timestamps mayores a 7 días de un array
 * @param {string[]} timestamps - Array de ISO timestamps
 * @returns {string[]} Array filtrado
 */
export const cleanOldTimestamps = (timestamps = []) => {
  if (!Array.isArray(timestamps)) {
    return [];
  }
  
  return timestamps.filter((ts) => {
    try {
      return isWithin7Days(ts);
    } catch (e) {
      // Ignorar timestamps inválidos
      return false;
    }
  });
};

/**
 * Determina si debe hacerse rotación de mes
 * @param {string|null} lastAccessTimestamp - Timestamp del último acceso (ISO string o null)
 * @returns {boolean}
 */
export const shouldRotateMonth = (lastAccessTimestamp) => {
  if (!lastAccessTimestamp) {
    return false;
  }
  
  try {
    const lastAccessMonth = getMonthKey(lastAccessTimestamp);
    const currentMonth = getCurrentMonthKey();
    return lastAccessMonth !== currentMonth;
  } catch (e) {
    return false;
  }
};

/**
 * Procesa los arrays de acceso para un login
 * Implementa:
 * - Rotación de mes si corresponde
 * - Limpieza de timestamps viejos
 * - Adición del nuevo timestamp
 * 
 * @param {Object} params
 * @param {string[]} params.accesos_mes_actual - Array actual de accesos del mes
 * @param {string[]} params.accesos_mes_anterior - Array de accesos del mes anterior
 * @param {string[]} params.accesos_ultimos_7dias - Array de últimos 7 días
 * @param {string|null} params.ultimo_acceso - Timestamp del último acceso
 * @returns {Object} Nuevos valores para los tres arrays
 */
export const processAccessArrays = ({
  accesos_mes_actual = [],
  accesos_mes_anterior = [],
  accesos_ultimos_7dias = [],
  ultimo_acceso = null,
}) => {
  const ahora = new Date().toISOString();
  
  // Convertir a arrays si no lo son
  const mesActual = Array.isArray(accesos_mes_actual) ? accesos_mes_actual : [];
  const mesAnterior = Array.isArray(accesos_mes_anterior) ? accesos_mes_anterior : [];
  const ultimos7 = Array.isArray(accesos_ultimos_7dias) ? accesos_ultimos_7dias : [];
  
  let nuevoMesActual = [...mesActual];
  let nuevoMesAnterior = [...mesAnterior];
  let nuevoUltimos7 = [...ultimos7];
  
  // Verificar si debe rotarse el mes
  if (shouldRotateMonth(ultimo_acceso)) {
    // Rotar: mes_actual → mes_anterior
    nuevoMesAnterior = [...nuevoMesActual];
    nuevoMesActual = [];
  }
  
  // Agregar timestamp actual
  nuevoMesActual.push(ahora);
  
  // Limpiar y agregar timestamp a últimos 7 días
  nuevoUltimos7 = cleanOldTimestamps(nuevoUltimos7);
  nuevoUltimos7.push(ahora);
  
  return {
    accesos_mes_actual: nuevoMesActual,
    accesos_mes_anterior: nuevoMesAnterior,
    accesos_ultimos_7dias: nuevoUltimos7,
  };
};
