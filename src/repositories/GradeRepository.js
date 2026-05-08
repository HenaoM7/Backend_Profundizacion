import { query } from '../database/db.js';
import { Grade } from '../models/Grade.js';

export const save = async ({ userId, courseId, moduleId, score }) => {
  const result = await query(
    `INSERT INTO notas (usuario_id, curso_id, modulo_id, calificacion)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, courseId, moduleId, score]
  );
  return Grade.fromRow(result.rows[0]);
};

export const findByUserId = async (userId) => {
  const result = await query(
    'SELECT * FROM notas WHERE usuario_id = $1 ORDER BY creado_en DESC',
    [userId]
  );
  return result.rows.map(Grade.fromRow);
};

export const findByCourseId = async (courseId) => {
  const result = await query(
    'SELECT * FROM notas WHERE curso_id = $1 ORDER BY creado_en DESC',
    [courseId]
  );
  return result.rows.map(Grade.fromRow);
};

export const findByUserIdAndCourseId = async (userId, courseId) => {
  const result = await query(
    'SELECT * FROM notas WHERE usuario_id = $1 AND curso_id = $2',
    [userId, courseId]
  );
  return result.rows.map(Grade.fromRow);
};
