// src/models/curso.model.js
import pool from '../database/db.js';

// ── Queries ───────────────────────────────────────────────────

export const findAll = async ({ activo, id_usuario, page = 1, limit = 10 } = {}) => {
  const pageNum  = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset   = (pageNum - 1) * limitNum;

  const values     = [];
  const conditions = ['c.eliminacion IS NULL'];

  if (activo !== undefined) { values.push(activo);      conditions.push(`c.activo = $${values.length}`);     }
  if (id_usuario)           { values.push(id_usuario);  conditions.push(`c.id_usuario = $${values.length}`); }

  const where = conditions.join(' AND ');

  const dataQuery = `
    SELECT
      c.id_curso, c.id_usuario, c.titulo, c.descripcion, c.activo,
      c.creacion, c.actualizacion,
      COUNT(m.id_modulo) FILTER (WHERE m.eliminacion IS NULL) AS modulos_count
    FROM curso c
    LEFT JOIN modulo m ON m.id_curso = c.id_curso
    WHERE ${where}
    GROUP BY c.id_curso
    ORDER BY c.creacion DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM curso c
    WHERE ${where}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...values, limitNum, offset]),
    pool.query(countQuery, values),
  ]);

  return {
    data:       dataResult.rows,
    total:      parseInt(countResult.rows[0].total, 10),
    page:       pageNum,
    limit:      limitNum,
    totalPages: Math.ceil(parseInt(countResult.rows[0].total, 10) / limitNum),
  };
};

export const findById = async (id_curso) => {
  const cursoQuery = `
    SELECT id_curso, id_usuario, titulo, descripcion, activo, creacion, actualizacion
    FROM curso
    WHERE id_curso = $1 AND eliminacion IS NULL
  `;

  const modulosQuery = `
    SELECT
      m.id_modulo,
      m.titulo,
      m.descripcion,
      m.activo,
      m.orden,
      m.creacion,
      COUNT(c.id_contenido) FILTER (WHERE c.eliminacion IS NULL) AS contenidos_count
    FROM modulo m
    LEFT JOIN contenido c ON c.id_modulo = m.id_modulo
    WHERE m.id_curso = $1 AND m.eliminacion IS NULL
    GROUP BY m.id_modulo
    ORDER BY m.orden ASC
  `;

  const [cursoResult, modulosResult] = await Promise.all([
    pool.query(cursoQuery, [id_curso]),
    pool.query(modulosQuery, [id_curso]),
  ]);

  if (cursoResult.rows.length === 0) return null;

  return { ...cursoResult.rows[0], modulos: modulosResult.rows };
};

export const create = async ({ id_usuario, titulo, descripcion }) => {
  const query = `
    INSERT INTO curso (id_usuario, titulo, descripcion, activo)
    VALUES ($1, $2, $3, TRUE)
    RETURNING id_curso, id_usuario, titulo, descripcion, activo, creacion, actualizacion
  `;
  const result = await pool.query(query, [id_usuario, titulo, descripcion ?? null]);
  return result.rows[0];
};

export const update = async (id_curso, { titulo, descripcion, id_usuario }) => {
  const fields = [];
  const values = [];

  if (titulo !== undefined)     { values.push(titulo);      fields.push(`titulo = $${values.length}`);     }
  if (descripcion !== undefined){ values.push(descripcion); fields.push(`descripcion = $${values.length}`); }
  if (id_usuario !== undefined) { values.push(id_usuario);  fields.push(`id_usuario = $${values.length}`); }

  if (fields.length === 0) return null;

  values.push(id_curso);
  const query = `
    UPDATE curso SET ${fields.join(', ')}
    WHERE id_curso = $${values.length} AND eliminacion IS NULL
    RETURNING id_curso, id_usuario, titulo, descripcion, activo, creacion, actualizacion
  `;
  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
};

export const toggleActivo = async (id_curso, activo) => {
  const query = `
    UPDATE curso SET activo = $1
    WHERE id_curso = $2 AND eliminacion IS NULL
    RETURNING id_curso, activo, actualizacion
  `;
  const result = await pool.query(query, [activo, id_curso]);
  return result.rows[0] ?? null;
};

export const softDelete = async (id_curso) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE contenido SET eliminacion = NOW()
       WHERE id_modulo IN (
         SELECT id_modulo FROM modulo WHERE id_curso = $1 AND eliminacion IS NULL
       ) AND eliminacion IS NULL`,
      [id_curso]
    );

    await client.query(
      `UPDATE modulo SET eliminacion = NOW()
       WHERE id_curso = $1 AND eliminacion IS NULL`,
      [id_curso]
    );

    const result = await client.query(
      `UPDATE curso SET eliminacion = NOW()
       WHERE id_curso = $1 AND eliminacion IS NULL
       RETURNING id_curso, eliminacion`,
      [id_curso]
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