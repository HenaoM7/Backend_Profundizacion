import { query } from '../database/db.js';
import { Grade } from '../models/Grade.js';

export const save = async ({ userId, courseId, moduleId, score, evaluacionId = null }) => {
  const result = await query(
    `INSERT INTO nota (id_usuario, id_curso, id_modulo, calificacion, id_evaluacion)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, courseId, moduleId, score, evaluacionId]
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

// Notas de un estudiante filtradas solo a los cursos del docente
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

export const findByCourseId = async (courseId) => {
  const result = await query(
    'SELECT * FROM nota WHERE id_curso = $1 ORDER BY creado_en DESC',
    [courseId]
  );
  return result.rows.map(Grade.fromRow);
};

export const findByUserIdAndCourseId = async (userId, courseId) => {
  const result = await query(
    'SELECT * FROM nota WHERE id_usuario = $1 AND id_curso = $2',
    [userId, courseId]
  );
  return result.rows.map(Grade.fromRow);
};

// Verifica si un docente es propietario del curso
export const findCursoOwner = async (courseId) => {
  const result = await query(
    'SELECT id_usuario FROM curso WHERE id_curso = $1',
    [courseId]
  );
  return result.rows[0]?.id_usuario ?? null;
};

// Cursos que pertenecen a un docente
export const findCursosByDocente = async (docenteId) => {
  const result = await query(
    'SELECT id_curso FROM curso WHERE id_usuario = $1',
    [docenteId]
  );
  return result.rows.map(r => r.id_curso);
};

// Estadísticas completas de un curso (solo ADMIN / SUPER_ADMIN)
export const getEstadisticas = async (courseId) => {
  const general = await query(
    `SELECT
       COUNT(DISTINCT id_usuario)::int                          AS total_estudiantes,
       ROUND(AVG(calificacion), 2)::float                      AS promedio_general,
       COUNT(CASE WHEN calificacion >= 60 THEN 1 END)::int     AS total_aprobados,
       COUNT(CASE WHEN calificacion  < 60 THEN 1 END)::int     AS total_reprobados,
       MAX(calificacion)::float                                 AS nota_maxima,
       MIN(calificacion)::float                                 AS nota_minima
     FROM nota
     WHERE id_curso = $1`,
    [courseId]
  );

  const porModulo = await query(
    `SELECT
       id_modulo,
       COUNT(DISTINCT id_usuario)::int     AS total_estudiantes,
       ROUND(AVG(calificacion), 2)::float  AS promedio,
       MAX(calificacion)::float            AS nota_maxima,
       MIN(calificacion)::float            AS nota_minima
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
