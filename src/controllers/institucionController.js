import {
  getInstitucionConfigService,
  updateInstitucionConfigService,
} from '../services/institucionService.js';

/**
 * Obtiene la configuración visual de la institución
 * GET /api/institucion/config
 */
export const getConfig = async (_req, res, next) => {
  try {
    const config = await getInstitucionConfigService();
    return res.status(200).json(config);
  } catch (error) {
    return next(error);
  }
};

/**
 * Actualiza la configuración visual de la institución
 * PUT /api/institucion/config
 */
export const updateConfig = async (req, res, next) => {
  try {
    // Sanitizar los datos del body (acepta nombres antiguos y nuevos)
    const configData = {};

    // Logo: acepta logo_url (antiguo) y url_logo (nuevo)
    const logoValue = req.body.logo_url !== undefined ? req.body.logo_url : req.body.url_logo;
    if (logoValue !== undefined) {
      configData.logo_url = typeof logoValue === 'string' ? logoValue.trim() : logoValue;
    }

    // Color primario: acepta primary_color (antiguo) y color_primario (nuevo)
    const primaryColorValue = req.body.primary_color !== undefined ? req.body.primary_color : req.body.color_primario;
    if (primaryColorValue !== undefined) {
      configData.primary_color = typeof primaryColorValue === 'string' ? primaryColorValue.trim() : primaryColorValue;
    }

    // Color secundario: acepta secondary_color (antiguo) y color_secundario (nuevo)
    const secondaryColorValue = req.body.secondary_color !== undefined ? req.body.secondary_color : req.body.color_secundario;
    if (secondaryColorValue !== undefined) {
      configData.secondary_color = typeof secondaryColorValue === 'string' ? secondaryColorValue.trim() : secondaryColorValue;
    }

    // Color fondo: acepta background_color (antiguo) y color_fondo (nuevo)
    const bgColorValue = req.body.background_color !== undefined ? req.body.background_color : req.body.color_fondo;
    if (bgColorValue !== undefined) {
      configData.background_color = typeof bgColorValue === 'string' ? bgColorValue.trim() : bgColorValue;
    }

    // Texto primario: acepta text_primary (antiguo) y texto_primario (nuevo)
    const textPrimaryValue = req.body.text_primary !== undefined ? req.body.text_primary : req.body.texto_primario;
    if (textPrimaryValue !== undefined) {
      configData.text_primary = typeof textPrimaryValue === 'string' ? textPrimaryValue.trim() : textPrimaryValue;
    }

    // Texto secundario: acepta text_secondary (antiguo) y texto_secundario (nuevo)
    const textSecondaryValue = req.body.text_secondary !== undefined ? req.body.text_secondary : req.body.texto_secundario;
    if (textSecondaryValue !== undefined) {
      configData.text_secondary = typeof textSecondaryValue === 'string' ? textSecondaryValue.trim() : textSecondaryValue;
    }

    // Texto en oscuro: acepta text_on_dark (ambos usan el mismo nombre)
    if (req.body.text_on_dark !== undefined) {
      configData.text_on_dark = typeof req.body.text_on_dark === 'string' ? req.body.text_on_dark.trim() : req.body.text_on_dark;
    }

    // Color muted: acepta color_muted (ambos usan el mismo nombre)
    if (req.body.color_muted !== undefined) {
      configData.color_muted = typeof req.body.color_muted === 'string' ? req.body.color_muted.trim() : req.body.color_muted;
    }

    // Color borde: acepta border_color (antiguo) y color_borde (nuevo)
    const borderColorValue = req.body.border_color !== undefined ? req.body.border_color : req.body.color_borde;
    if (borderColorValue !== undefined) {
      configData.border_color = typeof borderColorValue === 'string' ? borderColorValue.trim() : borderColorValue;
    }

    // Color input: acepta input_color (antiguo) y color_input (nuevo)
    const inputColorValue = req.body.input_color !== undefined ? req.body.input_color : req.body.color_input;
    if (inputColorValue !== undefined) {
      configData.input_color = typeof inputColorValue === 'string' ? inputColorValue.trim() : inputColorValue;
    }

    // Color terciario (solo antiguo, por compatibilidad)
    if (req.body.tertiary_color !== undefined) {
      configData.tertiary_color = typeof req.body.tertiary_color === 'string' ? req.body.tertiary_color.trim() : req.body.tertiary_color;
    }

    // Validar que al menos un campo fue enviado
    if (Object.keys(configData).length === 0) {
      return res.status(400).json({
        message: 'Debe proporcionar al menos un campo para actualizar.',
      });
    }

    // Actualizar la configuración
    const updatedConfig = await updateInstitucionConfigService(configData);
    return res.status(200).json(updatedConfig);
  } catch (error) {
    return next(error);
  }
};
