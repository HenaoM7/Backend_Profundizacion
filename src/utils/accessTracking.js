/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} Formato: YYYY-MM-DD
 */
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene el año y mes actual en formato YYYY-MM
 * @returns {string} Formato: YYYY-MM
 */
export const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Obtiene el año y mes de una fecha específica (YYYY-MM-DD o Date)
 * @param {Date|string} date - Fecha a procesar
 * @returns {string} Formato: YYYY-MM
 */
export const getMonthKey = (date) => {
  let d;
  
  if (typeof date === 'string') {
    // Si es string en formato YYYY-MM-DD
    if (date.includes('-') && date.length === 10) {
      d = new Date(date + 'T00:00:00Z');
    } else {
      // Si es ISO timestamp
      d = new Date(date);
    }
  } else {
    d = date;
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Verifica si una fecha (YYYY-MM-DD) está dentro de los últimos 7 días
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean}
 */
export const isWithin7Days = (dateString) => {
  try {
    const date = new Date(dateString + 'T00:00:00Z');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = today - date;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays <= 7 && diffDays >= 0;
  } catch (e) {
    return false;
  }
};

/**
 * Limpia fechas mayores a 7 días de un array
 * @param {string[]} dateArray - Array de fechas en formato YYYY-MM-DD
 * @returns {string[]} Array filtrado
 */
export const cleanOldDates = (dateArray = []) => {
  if (!Array.isArray(dateArray)) {
    return [];
  }
  
  return dateArray.filter((dateStr) => {
    try {
      return isWithin7Days(dateStr);
    } catch (e) {
      // Ignorar fechas inválidas
      return false;
    }
  });
};

/**
 * Determina si debe hacerse rotación de mes
 * Compara el mes del último acceso con el mes actual
 * @param {string|null} lastAccessDate - Fecha del último acceso (YYYY-MM-DD o ISO string o null)
 * @returns {boolean}
 */
export const shouldRotateMonth = (lastAccessDate) => {
  if (!lastAccessDate) {
    return false;
  }
  
  try {
    const lastMonth = getMonthKey(lastAccessDate);
    const currentMonth = getCurrentMonthKey();
    return lastMonth !== currentMonth;
  } catch (e) {
    return false;
  }
};

/**
 * Procesa los arrays de acceso para un login
 * Implementa:
 * - Rotación de mes si corresponde
 * - Limpieza de fechas viejas (> 7 días)
 * - Adición de la fecha actual (solo si no existe)
 * 
 * Solo se agrega la fecha una vez por día (sin duplicados)
 * 
 * @param {Object} params
 * @param {string[]} params.accesos_mes_actual - Array de fechas del mes actual (YYYY-MM-DD)
 * @param {string[]} params.accesos_mes_anterior - Array de fechas del mes anterior (YYYY-MM-DD)
 * @param {string[]} params.accesos_ultimos_7dias - Array de fechas últimos 7 días (YYYY-MM-DD)
 * @param {string|null} params.ultimo_acceso - Fecha/timestamp del último acceso
 * @returns {Object} Nuevos valores para los tres arrays
 */
export const processAccessArrays = ({
  accesos_mes_actual = [],
  accesos_mes_anterior = [],
  accesos_ultimos_7dias = [],
  ultimo_acceso = null,
}) => {
  const hoy = getTodayDateString(); // Formato: YYYY-MM-DD
  
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
  
  // Agregar fecha actual solo si no existe (evitar duplicados del mismo día)
  if (!nuevoMesActual.includes(hoy)) {
    nuevoMesActual.push(hoy);
  }
  
  // Limpiar fechas viejas (> 7 días) y agregar fecha actual si no existe
  nuevoUltimos7 = cleanOldDates(nuevoUltimos7);
  if (!nuevoUltimos7.includes(hoy)) {
    nuevoUltimos7.push(hoy);
  }
  
  return {
    accesos_mes_actual: nuevoMesActual,
    accesos_mes_anterior: nuevoMesAnterior,
    accesos_ultimos_7dias: nuevoUltimos7,
  };
};
