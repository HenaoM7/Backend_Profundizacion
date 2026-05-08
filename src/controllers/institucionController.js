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
    // Sanitizar los datos del body (recibe nombres antiguos del frontend)
    const configData = {};

    if (req.body.logo_url !== undefined) {
      configData.logo_url = typeof req.body.logo_url === 'string' ? req.body.logo_url.trim() : req.body.logo_url;
    }

    if (req.body.primary_color !== undefined) {
      configData.primary_color = typeof req.body.primary_color === 'string' ? req.body.primary_color.trim() : req.body.primary_color;
    }

    if (req.body.secondary_color !== undefined) {
      configData.secondary_color = typeof req.body.secondary_color === 'string' ? req.body.secondary_color.trim() : req.body.secondary_color;
    }

    if (req.body.tertiary_color !== undefined) {
      configData.tertiary_color = typeof req.body.tertiary_color === 'string' ? req.body.tertiary_color.trim() : req.body.tertiary_color;
    }

    if (req.body.color_muted !== undefined) {
      configData.color_muted = typeof req.body.color_muted === 'string' ? req.body.color_muted.trim() : req.body.color_muted;
    }

    if (req.body.background_color !== undefined) {
      configData.background_color = typeof req.body.background_color === 'string' ? req.body.background_color.trim() : req.body.background_color;
    }

    if (req.body.text_primary !== undefined) {
      configData.text_primary = typeof req.body.text_primary === 'string' ? req.body.text_primary.trim() : req.body.text_primary;
    }

    if (req.body.text_secondary !== undefined) {
      configData.text_secondary = typeof req.body.text_secondary === 'string' ? req.body.text_secondary.trim() : req.body.text_secondary;
    }

    if (req.body.text_on_dark !== undefined) {
      configData.text_on_dark = typeof req.body.text_on_dark === 'string' ? req.body.text_on_dark.trim() : req.body.text_on_dark;
    }

    if (req.body.border_color !== undefined) {
      configData.border_color = typeof req.body.border_color === 'string' ? req.body.border_color.trim() : req.body.border_color;
    }

    if (req.body.input_color !== undefined) {
      configData.input_color = typeof req.body.input_color === 'string' ? req.body.input_color.trim() : req.body.input_color;
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
