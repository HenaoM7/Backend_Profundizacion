import { query } from '../database/db.js';

// UUID fija para la institución única
const INSTITUCION_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * Obtiene la configuración de la institución única
 */
export const getInstitucionConfig = async () => {
  const result = await query(
    `SELECT 
      id,
      name,
      logo_url,
      primary_color,
      secondary_color,
      tertiary_color,
      background_color,
      text_primary,
      text_secondary,
      text_tertiary,
      border_color,
      input_color,
      created_at,
      updated_at
    FROM institucion
    WHERE id = $1`,
    [INSTITUCION_ID]
  );

  return result.rows[0] || null;
};

/**
 * Actualiza la configuración visual de la institución
 */
export const updateInstitucionConfig = async (configData) => {
  const {
    logo_url,
    primary_color,
    secondary_color,
    tertiary_color,
    background_color,
    text_primary,
    text_secondary,
    text_tertiary,
    border_color,
    input_color,
  } = configData;

  const result = await query(
    `UPDATE institucion
    SET 
      logo_url = COALESCE($1, logo_url),
      primary_color = COALESCE($2, primary_color),
      secondary_color = COALESCE($3, secondary_color),
      tertiary_color = COALESCE($4, tertiary_color),
      background_color = COALESCE($5, background_color),
      text_primary = COALESCE($6, text_primary),
      text_secondary = COALESCE($7, text_secondary),
      text_tertiary = COALESCE($8, text_tertiary),
      border_color = COALESCE($9, border_color),
      input_color = COALESCE($10, input_color)
    WHERE id = $11
    RETURNING 
      id,
      name,
      logo_url,
      primary_color,
      secondary_color,
      tertiary_color,
      background_color,
      text_primary,
      text_secondary,
      text_tertiary,
      border_color,
      input_color,
      created_at,
      updated_at`,
    [
      logo_url,
      primary_color,
      secondary_color,
      tertiary_color,
      background_color,
      text_primary,
      text_secondary,
      text_tertiary,
      border_color,
      input_color,
      INSTITUCION_ID,
    ]
  );

  return result.rows[0] || null;
};
