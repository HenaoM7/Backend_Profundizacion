import { query } from '../database/db.js';

// UUID fija para la institución única
const INSTITUCION_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * Obtiene la configuración de la institución única
 */
export const getInstitucionConfig = async () => {
  const result = await query(
    `SELECT 
      id_configuracion_tema,
      nombre,
      url_logo,
      color_primario,
      color_secundario,
      color_terciario,
      color_fondo,
      texto_primario,
      texto_secundario,
      color_muted,
      color_borde,
      color_input,
      creado_en,
      actualizado_en
    FROM configuracion_tema
    WHERE id_configuracion_tema = $1`,
    [INSTITUCION_ID]
  );

  return result.rows[0] || null;
};

/**
 * Actualiza la configuración visual de la institución
 */
export const updateInstitucionConfig = async (configData) => {
  const {
    url_logo,
    color_primario,
    color_secundario,
    color_terciario,
    color_fondo,
    texto_primario,
    texto_secundario,
    texto_terciario,
    color_borde,
    color_input,
  } = configData;

  const result = await query(
    `UPDATE configuracion_tema
    SET 
      url_logo = COALESCE($1, url_logo),
      color_primario = COALESCE($2, color_primario),
      color_secundario = COALESCE($3, color_secundario),
      color_muted = COALESCE($4, color_muted),
      color_fondo = COALESCE($5, color_fondo),
      texto_primario = COALESCE($6, texto_primario),
      texto_secundario = COALESCE($7, texto_secundario),
      texto_muted = COALESCE($8, texto_muted),
      color_borde = COALESCE($9, color_borde),
      color_input = COALESCE($10, color_input)
    WHERE id_configuracion_tema = $11
    RETURNING 
      id_configuracion_tema,
      nombre,
      url_logo,
      color_primario,
      color_secundario,
      color_terciario,
      color_fondo,
      texto_primario,
      texto_secundario,
      texto_terciario,
      color_borde,
      color_input,
      creado_en,
      actualizado_en`,
    [
      url_logo,
      color_primario,
      color_secundario,
      color_terciario,
      color_fondo,
      texto_primario,
      texto_secundario,
      texto_terciario,
      color_borde,
      color_input,
      INSTITUCION_ID,
    ]
  );

  return result.rows[0] || null;
};
