/**
 * Utility functions para cálculos comunes en SuperAdmin
 */

/**
 * Calcula el porcentaje de variación entre dos valores
 * @param {number} actual - Valor actual
 * @param {number} anterior - Valor anterior (referencia)
 * @returns {number} Porcentaje de variación redondeado a 2 decimales
 */
export const calcularVariacion = (actual, anterior) => {
  if (anterior <= 0) {
    return actual > 0 ? 100 : 0;
  }
  const variacion = ((actual - anterior) / anterior) * 100;
  return Math.round(variacion * 100) / 100;
};

/**
 * Asegura que un valor no sea null/undefined
 * @param {any} valor - Valor a validar
 * @param {any} defecto - Valor por defecto (default: 0)
 * @returns {any} El valor o el defecto
 */
export const validarValor = (valor, defecto = 0) => {
  return valor !== null && valor !== undefined ? valor : defecto;
};

/**
 * Parsea un array JSON de forma segura
 * @param {string|array} value - Valor a parsear
 * @returns {array} Array parseado o array vacío
 */
export const parseJsonArray = (value) => {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
};

/**
 * Normaliza un nombre de rol a minúsculas de forma segura
 * @param {string} rol - Rol a normalizar
 * @returns {string} Rol normalizado o undefined
 */
export const normalizarRol = (rol) => {
  return rol ? rol.toLowerCase() : undefined;
};

/**
 * Normaliza filtros de estado
 * @param {string} estado - Estado a normalizar (activo/inactivo)
 * @returns {boolean|undefined} true si es activo, false si es inactivo, undefined si no es válido
 */
export const normalizarEstado = (estado) => {
  if (!estado) return undefined;
  const normalizado = estado.toLowerCase();
  if (normalizado === 'activo') return true;
  if (normalizado === 'inactivo') return false;
  return undefined;
};

/**
 * Construye una cláusula WHERE dinámicamente
 * @param {string[]} conditions - Array de condiciones
 * @returns {string} Cláusula WHERE completa o string vacío
 */
export const construirWhereClause = (conditions) => {
  const condicionesValidas = conditions.filter(c => c && c.trim().length > 0);
  return condicionesValidas.length > 0 ? `WHERE ${condicionesValidas.join(' AND ')}` : '';
};

/**
 * Convierte minutos a formato legible (min, horas, días, semanas, meses)
 * @param {number} minutos - Tiempo en minutos
 * @returns {string} Formato legible (ej: "2h 30m", "3 días", "2 semanas")
 */
export const formatearTiempo = (minutos) => {
  if (!minutos || minutos === 0) return '0 min';
  
  const mins = Math.floor(minutos);
  
  if (mins < 60) return `${mins} min`;
  
  const horas = Math.floor(mins / 60);
  const minutosRestantes = mins % 60;
  
  if (horas < 24) {
    return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}m` : `${horas}h`;
  }
  
  const dias = Math.floor(horas / 24);
  const horasRestantes = horas % 24;
  
  if (dias < 7) {
    return horasRestantes > 0 ? `${dias}d ${horasRestantes}h` : `${dias}d`;
  }
  
  const semanas = Math.floor(dias / 7);
  const diasRestantes = dias % 7;
  
  if (semanas < 4) {
    return diasRestantes > 0 ? `${semanas}s ${diasRestantes}d` : `${semanas}s`;
  }
  
  const meses = Math.floor(dias / 30);
  const diasRestantesMes = dias % 30;
  
  return diasRestantesMes > 0 ? `${meses}m ${diasRestantesMes}d` : `${meses}m`;
};
