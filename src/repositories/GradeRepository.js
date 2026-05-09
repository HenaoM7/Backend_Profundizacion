import { query } from '../database/db.js';
import { Grade } from '../models/Grade.js';

export const save = async ({ userId, courseId, moduleId, score, evaluacionId = null }) => {
  // Calcular el número de intento automáticamente
  const intentoResult = await query(
    `SELECT COALESCE(MAX(numero_intento), 0) + 1 AS siguiente
     FROM nota
     WHERE id_usuario = $1 AND id_curso = $2 AND id_modulo = $3`,
    [userId, courseId, moduleId]
  );
  const numeroIntento = intentoResult.rows[0].siguiente;

  const result = await query(
    `INSERT INTO nota (id_usuario, id_curso, id_modulo, calificacion, id_evaluacion, numero_intento)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, courseId, moduleId, score, evaluacionId, numeroIntento]
  );
  return Grade.fromRow(result.rows[0]);
};

export const findByUserId = async (userId) => {
  const result = await query(
    'SELECT * FROM nota WHERE id_usuario = $1 ORDER BY creado_en DESC',
    [userId]
  );
  return result.rows.map(Grade.fromRow);
};

export const findByCourseId = async (courseId) => {
  const result = await query(
    'SELECT * FROM nota WHERE id_curso = $1 ORDER BY creado_en DESC',
    [courseId]
  );
  return result.rows.map(Grade.fromRow);
};

// Todos los intentos del estudiante en un curso
export const findByUserIdAndCourseId = async (userId, courseId) => {
  const result = await query(
    `SELECT * FROM nota
     WHERE id_usuario = $1 AND id_curso = $2
     ORDER BY id_modulo, numero_intento`,
    [userId, courseId]
  );
  return result.rows.map(Grade.fromRow);
};

// Último intento por módulo — usado para calcular el promedio del curso
export const findUltimoIntentoPorModulo = async (userId, courseId) => {
  const result = await query(
    `SELECT DISTINCT ON (id_modulo) *
     FROM nota
     WHERE id_usuario = $1 AND id_curso = $2
     ORDER BY id_modulo, numero_intento DESC`,
    [userId, courseId]
  );
  return result.rows.map(Grade.fromRow);
};

export const findCursoOwner = async (courseId) => {
  const result = await query(
    'SELECT id_usuario FROM curso WHERE id_curso = $1',
    [courseId]
  );
  return result.rows[0]?.id_usuario ?? null;
};

export const findCursosByDocente = async (docenteId) => {
  const result = await query(
    'SELECT id_curso FROM curso WHERE id_usuario = $1',
    [docenteId]
  );
  return result.rows.map(r => r.id_curso);
};

export const findByUserIdAndCourseIds = async (userId, courseIds) => {
  if (!courseIds.length) return [];
  const result = await query(
    `SELECT * FROM nota
     WHERE id_usuario = $1 AND id_curso = ANY($2)
     ORDER BY creado_en DESC`,
    [userId, courseIds]
  );
  return result.rows.map(Grade.fromRow);
};

export const getEstadisticas = async (courseId) => {
  const general = await query(
    `SELECT
       COUNT(DISTINCT id_usuario)::int                          AS total_estudiantes,
       ROUND(AVG(calificacion), 2)::float                      AS promedio_general,
       COUNT(CASE WHEN calificacion >= 60 THEN 1 END)::int     AS total_aprobados,
       COUNT(CASE WHEN calificacion  < 60 THEN 1 END)::int     AS total_reprobados,
       MAX(calificacion)::float                                 AS nota_maxima,
       MIN(calificacion)::float                                 AS nota_minima,
       ROUND(AVG(numero_intento), 2)::float                    AS promedio_intentos
     FROM nota
     WHERE id_curso = $1`,
    [courseId]
  );

  const porModulo = await query(
    `SELECT
       id_modulo,
       COUNT(DISTINCT id_usuario)::int        AS total_estudiantes,
       ROUND(AVG(calificacion), 2)::float     AS promedio,
       MAX(calificacion)::float               AS nota_maxima,
       MIN(calificacion)::float               AS nota_minima,
       ROUND(AVG(numero_intento), 2)::float   AS promedio_intentos,
       MAX(numero_intento)::int               AS max_intentos
     FROM nota
     WHERE id_curso = $1
     GROUP BY id_modulo
     ORDER BY id_modulo`,
    [courseId]
  );

  return {
    courseId,
    ...general.rows[0],
    por_modulo: porModulo.rows,
  };
};
