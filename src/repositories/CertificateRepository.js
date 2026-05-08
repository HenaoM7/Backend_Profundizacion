import { query } from '../database/db.js';
import { Certificate } from '../models/Certificate.js';
import { randomUUID } from 'crypto';

export const save = async ({ userId, courseId }) => {
  const url    = `https://certs.eduplatform.com/verify/${randomUUID()}`;
  const result = await query(
    `INSERT INTO certificados (usuario_id, curso_id, url)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, courseId, url]
  );
  return Certificate.fromRow(result.rows[0]);
};

export const findByUserId = async (userId) => {
  const result = await query(
    'SELECT * FROM certificados WHERE usuario_id = $1 ORDER BY emitido_en DESC',
    [userId]
  );
  return result.rows.map(Certificate.fromRow);
};

export const findByUserIdAndCourseId = async (userId, courseId) => {
  const result = await query(
    'SELECT * FROM certificados WHERE usuario_id = $1 AND curso_id = $2',
    [userId, courseId]
  );
  return result.rows[0] ? Certificate.fromRow(result.rows[0]) : null;
};
