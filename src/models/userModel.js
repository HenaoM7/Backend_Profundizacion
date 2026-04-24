import { getClient, query } from '../database/db.js';

const baseUserSelect = `
  SELECT
    u.id,
    u.nombre,
    u.correo,
    u.contrasena,
    u.activo,
    u.creacion,
    u.actualizacion,
    COALESCE(ARRAY_REMOVE(ARRAY_AGG(r.nombre ORDER BY r.nombre), NULL), '{}') AS roles
  FROM usuarios u
  LEFT JOIN usuarios_roles ur ON ur.id_usuario = u.id
  LEFT JOIN roles r ON r.id = ur.id_rol AND r.activo = TRUE
`;

export const findUserByCorreo = async (correo, { onlyActive = true } = {}) => {
  const conditions = ['LOWER(u.correo) = LOWER($1)'];

  if (onlyActive) {
    conditions.push('u.activo = TRUE');
  }

  const result = await query(
    `
      ${baseUserSelect}
      WHERE ${conditions.join(' AND ')}
      GROUP BY u.id
      LIMIT 1
    `,
    [correo]
  );

  return result.rows[0] ?? null;
};

export const findUserById = async (id, { onlyActive = true } = {}) => {
  const conditions = ['u.id = $1'];

  if (onlyActive) {
    conditions.push('u.activo = TRUE');
  }

  const result = await query(
    `
      ${baseUserSelect}
      WHERE ${conditions.join(' AND ')}
      GROUP BY u.id
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ?? null;
};

export const listUsers = async () => {
  const result = await query(
    `
      ${baseUserSelect}
      GROUP BY u.id
      ORDER BY u.creacion DESC
    `
  );

  return result.rows;
};

export const createUser = async ({ id, nombre, correo, passwordHash, roleIds }) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    await client.query(
      `
        INSERT INTO usuarios (id, nombre, correo, contrasena, activo)
        VALUES ($1, $2, $3, $4, TRUE)
      `,
      [id, nombre, correo, passwordHash]
    );

    for (const roleId of roleIds) {
      await client.query(
        `
          INSERT INTO usuarios_roles (id_usuario, id_rol)
          VALUES ($1, $2)
        `,
        [id, roleId]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};