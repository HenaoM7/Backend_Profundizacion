import { getClient, query } from '../database/db.js';

const baseUserSelect = `
  SELECT
    u.id_usuario,
    u.nombre,
    u.correo,
    u.contrasena,
    u.activo,
    u.creado_por,
    u.creacion,
    u.actualizacion,
    u.ultimo_acceso,
    COALESCE(ARRAY_REMOVE(ARRAY_AGG(r.nombre ORDER BY r.nombre), NULL), '{}') AS roles
  FROM usuario u
  LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
  LEFT JOIN rol r ON r.id_rol = ur.id_rol AND r.activo = TRUE
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
      GROUP BY u.id_usuario
      LIMIT 1
    `,
    [correo]
  );

  return result.rows[0] ?? null;
};

export const findUserById = async (id, { onlyActive = true } = {}) => {
  const conditions = ['u.id_usuario = $1'];

  if (onlyActive) {
    conditions.push('u.activo = TRUE');
  }

  const result = await query(
    `
      ${baseUserSelect}
      WHERE ${conditions.join(' AND ')}
      GROUP BY u.id_usuario
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ?? null;
};

export const listUsers = async ({ nombre, fechaDesde, fechaHasta } = {}) => {
  const conditions = [];
  const params = [];
  let index = 1;

  if (nombre && typeof nombre === 'string' && nombre.trim()) {
    conditions.push(`LOWER(u.nombre) LIKE LOWER($${index})`);
    params.push(`%${nombre.trim()}%`);
    index += 1;
  }

  if (fechaDesde) {
    conditions.push(`u.creacion >= $${index}`);
    params.push(fechaDesde);
    index += 1;
  }

  if (fechaHasta) {
    conditions.push(`u.creacion <= $${index}`);
    params.push(fechaHasta);
    index += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `
      ${baseUserSelect}
      ${whereClause}
      GROUP BY u.id_usuario
      ORDER BY u.creacion DESC
    `,
    params
  );

  return result.rows;
};

export const createUser = async ({ id, nombre, correo, passwordHash, createdBy, roleIds }) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    await client.query(
      `
        INSERT INTO usuario (id_usuario, nombre, correo, contrasena, activo, creado_por)
        VALUES ($1, $2, $3, $4, TRUE, $5)
      `,
      [id, nombre, correo, passwordHash, createdBy]
    );

    for (const roleId of roleIds) {
      await client.query(
        `
          INSERT INTO usuario_rol (id_usuario, id_rol)
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

export const updateUser = async ({ id, nombre, roleIds }) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Actualizar nombre si se proporciona
    if (nombre) {
      await client.query(
        `
          UPDATE usuario
          SET nombre = $1, actualizacion = NOW()
          WHERE id_usuario = $2
        `,
        [nombre, id]
      );
    }

    // Actualizar roles si se proporcionan
    if (roleIds && roleIds.length > 0) {
      // Eliminar roles anteriores
      await client.query('DELETE FROM usuario_rol WHERE id_usuario = $1', [id]);

      // Insertar nuevos roles
      for (const roleId of roleIds) {
        await client.query(
          `
            INSERT INTO usuario_rol (id_usuario, id_rol)
            VALUES ($1, $2)
          `,
          [id, roleId]
        );
      }

      // Actualizar timestamp si se cambiaron roles
      if (!nombre) {
        await client.query(
          `
            UPDATE usuario
            SET actualizacion = NOW()
            WHERE id_usuario = $1
          `,
          [id]
        );
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deactivateUser = async (id) => {
  await query(
    `
      UPDATE usuario
      SET activo = FALSE, actualizacion = NOW()
      WHERE id_usuario = $1
    `,
    [id]
  );
};

export const activateUser = async (id) => {
  await query(
    `
      UPDATE usuario
      SET activo = TRUE, actualizacion = NOW()
      WHERE id_usuario = $1
    `,
    [id]
  );
};