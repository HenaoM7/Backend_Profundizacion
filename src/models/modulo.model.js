// src/models/modulo.model.js
import pool from '../database/db.js';

export const findAll = async ({ id_curso, activo }) => {
  const values     = [id_curso];
  const conditions = ['m.id_curso = $1', 'm.eliminacion IS NULL'];

  if (activo !== undefined) {
    values.push(activo);
    conditions.push(`m.activo = $${values.length}`);
  }

  const query = `
    SELECT
      m.id_modulo,
      m.id_curso,
      m.titulo,
      m.descripcion,
      m.activo,
      m.orden,
      m.creacion,
      m.actualizacion,
      COUNT(c.id_contenido) FILTER (WHERE c.eliminacion IS NULL) AS contenidos_count
    FROM modulo m
    LEFT JOIN contenido c ON c.id_modulo = m.id_modulo
    WHERE ${conditions.join(' AND ')}
    GROUP BY m.id_modulo
    ORDER BY m.orden ASC
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

export const findById = async (id_modulo) => {
  const moduloQuery = `
    SELECT id_modulo, id_curso, titulo, descripcion, activo, orden, creacion, actualizacion
    FROM modulo
    WHERE id_modulo = $1 AND eliminacion IS NULL
  `;
  const contenidosQuery = `
    SELECT id_contenido, titulo, descripcion, tipo, orden, activo, creacion
    FROM contenido
    WHERE id_modulo = $1 AND eliminacion IS NULL
    ORDER BY orden ASC
  `;

  const [moduloResult, contenidosResult] = await Promise.all([
    pool.query(moduloQuery, [id_modulo]),
    pool.query(contenidosQuery, [id_modulo]),
  ]);

  if (moduloResult.rows.length === 0) return null;
  return { ...moduloResult.rows[0], contenidos: contenidosResult.rows };
};

export const cursoExists = async (id_curso) => {
  const result = await pool.query(
    `SELECT EXISTS (SELECT 1 FROM curso WHERE id_curso = $1 AND eliminacion IS NULL) AS exists`,
    [id_curso]
  );
  return result.rows[0].exists;
};

export const countByCurso = async (id_curso) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS total FROM modulo WHERE id_curso = $1 AND eliminacion IS NULL`,
    [id_curso]
  );
  return parseInt(result.rows[0].total, 10);
};

export const ordenExists = async (id_curso, orden, excludeId) => {
  const values = [id_curso, orden];
  let query = `
    SELECT EXISTS (
      SELECT 1 FROM modulo
      WHERE id_curso = $1 AND orden = $2 AND eliminacion IS NULL
  `;
  if (excludeId) {
    values.push(excludeId);
    query += ` AND id_modulo != $${values.length}`;
  }
  query += ') AS exists';
  const result = await pool.query(query, values);
  return result.rows[0].exists;
};

export const create = async ({ id_curso, titulo, descripcion, orden }) => {
  const query = `
    INSERT INTO modulo (id_curso, titulo, descripcion, activo, orden)
    VALUES ($1, $2, $3, FALSE, $4)
    RETURNING id_modulo, id_curso, titulo, descripcion, activo, orden, creacion, actualizacion
  `;
  const result = await pool.query(query, [id_curso, titulo, descripcion ?? null, orden]);
  return result.rows[0];
};

export const update = async (id_modulo, { titulo, descripcion, orden }) => {
  const fields = [];
  const values = [];

  if (titulo !== undefined)     { values.push(titulo);      fields.push(`titulo = $${values.length}`);      }
  if (descripcion !== undefined){ values.push(descripcion); fields.push(`descripcion = $${values.length}`); }
  if (orden !== undefined)      { values.push(orden);       fields.push(`orden = $${values.length}`);       }

  if (fields.length === 0) return null;

  values.push(id_modulo);
  const query = `
    UPDATE modulo SET ${fields.join(', ')}
    WHERE id_modulo = $${values.length} AND eliminacion IS NULL
    RETURNING id_modulo, id_curso, titulo, descripcion, activo, orden, creacion, actualizacion
  `;
  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
};

export const toggleActivo = async (id_modulo, activo) => {
  const query = `
    UPDATE modulo SET activo = $1
    WHERE id_modulo = $2 AND eliminacion IS NULL
    RETURNING id_modulo, activo, actualizacion
  `;
  const result = await pool.query(query, [activo, id_modulo]);
  return result.rows[0] ?? null;
};

export const reorder = async (id_curso, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      await client.query(
        `UPDATE modulo SET orden = $1 WHERE id_modulo = $2 AND id_curso = $3 AND eliminacion IS NULL`,
        [item.orden, item.id_modulo, id_curso]
      );
    }
    const result = await client.query(
      `SELECT id_modulo, id_curso, titulo, descripcion, activo, orden, creacion, actualizacion
       FROM modulo WHERE id_curso = $1 AND eliminacion IS NULL ORDER BY orden ASC`,
      [id_curso]
    );
    await client.query('COMMIT');
    return result.rows;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const softDelete = async (id_modulo) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE contenido SET eliminacion = NOW() WHERE id_modulo = $1 AND eliminacion IS NULL`,
      [id_modulo]
    );
    const result = await client.query(
      `UPDATE modulo SET eliminacion = NOW()
       WHERE id_modulo = $1 AND eliminacion IS NULL
       RETURNING id_modulo, eliminacion`,
      [id_modulo]
    );
    await client.query('COMMIT');
    return result.rows[0] ?? null;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};