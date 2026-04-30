import {
  getInstitucionConfig,
  updateInstitucionConfig,
} from '../models/institucionModel.js';

/**
 * Expresión regular para validar colores en formato HEX
 */
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6})$/;

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

  // Retornar solo los campos de configuración (sin id, creacion, actualizacion)
  return {
    name: config.name,
    logo_url: config.logo_url,
    primary_color: config.primary_color,
    secondary_color: config.secondary_color,
    tertiary_color: config.tertiary_color,
    background_color: config.background_color,
    text_primary: config.text_primary,
    text_secondary: config.text_secondary,
    text_tertiary: config.text_tertiary,
    border_color: config.border_color,
    input_color: config.input_color,
  };
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

  // Validar colores HEX
  const colorFields = [
    'primary_color',
    'secondary_color',
    'tertiary_color',
    'background_color',
    'text_primary',
    'text_secondary',
    'text_tertiary',
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

  // Actualizar configuración
  const updatedConfig = await updateInstitucionConfig(configData);

  if (!updatedConfig) {
    const error = new Error('Error al actualizar la configuración.');
    error.statusCode = 500;
    throw error;
  }

  // Retornar solo los campos de configuración
  return {
    name: updatedConfig.name,
    logo_url: updatedConfig.logo_url,
    primary_color: updatedConfig.primary_color,
    secondary_color: updatedConfig.secondary_color,
    tertiary_color: updatedConfig.tertiary_color,
    background_color: updatedConfig.background_color,
    text_primary: updatedConfig.text_primary,
    text_secondary: updatedConfig.text_secondary,
    text_tertiary: updatedConfig.text_tertiary,
    border_color: updatedConfig.border_color,
    input_color: updatedConfig.input_color,
  };
};
