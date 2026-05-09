import {
  getInstitucionConfig,
  updateInstitucionConfig,
} from '../models/institucionModel.js';

/**
 * Expresión regular para validar colores en formato HEX
 */
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6})$/;

/**
 * Mapea nombres nuevos (BD) → nombres antiguos (API/Frontend)
 */
const mapNewToOldNames = (config) => ({
  name: config.nombre,
  logo_url: config.url_logo,
  primary_color: config.color_primario,
  secondary_color: config.color_secundario,
  tertiary_color: config.color_terciario,
  color_muted: config.color_muted,
  background_color: config.color_fondo,
  text_primary: config.texto_primario,
  text_secondary: config.texto_secundario,
  text_on_dark: config.texto_terciario,
  border_color: config.color_borde,
  input_color: config.color_input,
});

/**
 * Mapea nombres antiguos (API/Frontend) → nombres nuevos (BD)
 */
const mapOldToNewNames = (config) => {
  const mapped = {};
  if (config.logo_url !== undefined) mapped.url_logo = config.logo_url;
  if (config.primary_color !== undefined) mapped.color_primario = config.primary_color;
  if (config.secondary_color !== undefined) mapped.color_secundario = config.secondary_color;
  if (config.tertiary_color !== undefined) mapped.color_terciario = config.tertiary_color;
  if (config.color_muted !== undefined) mapped.color_muted = config.color_muted;
  if (config.background_color !== undefined) mapped.color_fondo = config.background_color;
  if (config.text_primary !== undefined) mapped.texto_primario = config.text_primary;
  if (config.text_secondary !== undefined) mapped.texto_secundario = config.text_secondary;
  if (config.text_on_dark !== undefined) mapped.texto_terciario = config.text_on_dark;
  if (config.border_color !== undefined) mapped.color_borde = config.border_color;
  if (config.input_color !== undefined) mapped.color_input = config.input_color;
  return mapped;
};

/**
 * Valida que un color sea un HEX válido
 */
const isValidHexColor = (color) => {
  if (!color) return true; // Los colores son opcionales
  return HEX_COLOR_REGEX.test(color);
};

/**
 * Valida que una URL sea válida
 */
const isValidUrl = (url) => {
  if (!url) return true; // logo_url es opcional
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Obtiene la configuración visual de la institución
 */
export const getInstitucionConfigService = async () => {
  const config = await getInstitucionConfig();

  if (!config) {
    const error = new Error('No se encontró la configuración de la institución.');
    error.statusCode = 404;
    throw error;
  }

  // Retornar con nombres antiguos (compatibilidad con frontend)
  return mapNewToOldNames(config);
};

/**
 * Actualiza la configuración visual de la institución
 */
export const updateInstitucionConfigService = async (configData) => {
  // Validación: no permitir campos vacíos
  if (Object.values(configData).some((val) => val === '')) {
    const error = new Error('No se permiten campos vacíos.');
    error.statusCode = 400;
    throw error;
  }

  // Validar colores HEX (usando nombres antiguos)
  const colorFields = [
    'primary_color',
    'secondary_color',
    'tertiary_color',
    'color_muted',
    'background_color',
    'text_primary',
    'text_secondary',
    'text_on_dark',
    'border_color',
    'input_color',
  ];

  for (const field of colorFields) {
    if (configData[field] && !isValidHexColor(configData[field])) {
      const error = new Error(
        `El campo "${field}" debe ser un color HEX válido en formato #RRGGBB.`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Validar URL del logo
  if (configData.logo_url && !isValidUrl(configData.logo_url)) {
    const error = new Error('El campo "logo_url" debe ser una URL válida.');
    error.statusCode = 400;
    throw error;
  }

  // Mapear nombres antiguos → nuevos
  const mappedData = mapOldToNewNames(configData);

  // Actualizar configuración
  const updatedConfig = await updateInstitucionConfig(mappedData);

  if (!updatedConfig) {
    const error = new Error('Error al actualizar la configuración.');
    error.statusCode = 500;
    throw error;
  }

  // Retornar con nombres antiguos (compatibilidad con frontend)
  return mapNewToOldNames(updatedConfig);
};
