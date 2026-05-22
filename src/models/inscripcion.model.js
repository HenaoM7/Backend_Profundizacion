// src/models/inscripcion.model.js
import pool from '../database/db.js';

export const findAll = async ({ id_curso, id_usuario, page = 1, limit = 10 } = {}) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const values = [];
  const conditions = [];

  if (id_curso)   { values.push(id_curso);   conditions.push(`i.id_curso = $${values.length}`); }
  if (id_usuario) { values.push(id_usuario); conditions.push(`i.id_usuario = $${values.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const dataQuery = `
    SELECT id_inscripcion, id_curso, id_usuario, fecha_inicio, fecha_finalizacion
    FROM inscripcion i
    ${where}
    ORDER BY fecha_inicio DESC NULLS LAST
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total FROM inscripcion i
    ${where}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...values, limitNum, offset]),
    pool.query(countQuery, values),
  ]);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0]?.total ?? '0', 10),
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total ?? '0', 10) / limitNum),
  };
};

export const findById = async (id_inscripcion) => {
  const query = `
    SELECT id_inscripcion, id_curso, id_usuario, fecha_inicio, fecha_finalizacion
    FROM inscripcion
    WHERE id_inscripcion = $1
  `;
  const result = await pool.query(query, [id_inscripcion]);
  return result.rows[0] ?? null;
};

export const exists = async (id_curso, id_usuario) => {
  const query = `
    SELECT 1 FROM inscripcion WHERE id_curso = $1 AND id_usuario = $2 LIMIT 1
  `;
  const result = await pool.query(query, [id_curso, id_usuario]);
  return result.rows.length > 0;
};

export const create = async ({ id_curso, id_usuario, fecha_inicio, fecha_finalizacion }) => {
  const query = `
    INSERT INTO inscripcion (id_curso, id_usuario, fecha_inicio, fecha_finalizacion)
    VALUES ($1, $2, $3, $4)
    RETURNING id_inscripcion, id_curso, id_usuario, fecha_inicio, fecha_finalizacion
  `;
  const result = await pool.query(query, [id_curso, id_usuario, fecha_inicio ?? null, fecha_finalizacion ?? null]);
  return result.rows[0];
};

export const update = async (id_inscripcion, { fecha_inicio, fecha_finalizacion }) => {
  const fields = [];
  const values = [];

  if (fecha_inicio !== undefined)       { values.push(fecha_inicio);       fields.push(`fecha_inicio = $${values.length}`); }
  if (fecha_finalizacion !== undefined) { values.push(fecha_finalizacion); fields.push(`fecha_finalizacion = $${values.length}`); }

  if (fields.length === 0) return null;

  values.push(id_inscripcion);
  const query = `
    UPDATE inscripcion SET ${fields.join(', ')}
    WHERE id_inscripcion = $${values.length}
    RETURNING id_inscripcion, id_curso, id_usuario, fecha_inicio, fecha_finalizacion
  `;
  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
};

export const remove = async (id_inscripcion) => {
  const query = `
    DELETE FROM inscripcion WHERE id_inscripcion = $1 RETURNING id_inscripcion
  `;
  const result = await pool.query(query, [id_inscripcion]);
  return result.rows[0] ?? null;
};

