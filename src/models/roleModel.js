import { query } from '../database/db.js';

export const listRoles = async () => {
  const result = await query(
    `
      SELECT id_rol as id, nombre, activo, creacion, actualizacion
      FROM rol
      ORDER BY nombre ASC
    `
  );

  return result.rows;
};

export const findActiveRolesByNames = async (roleNames = []) => {
  if (roleNames.length === 0) {
    return [];
  }

  const result = await query(
    `
      SELECT id_rol as id, nombre
      FROM rol
      WHERE nombre = ANY($1::varchar[])
        AND activo = TRUE
      ORDER BY nombre ASC
    `,
    [roleNames]
  );

  return result.rows;
};