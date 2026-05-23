import { query }              from '../database/db.js';
import { Certificate }         from '../models/Certificate.js';
import { PlantillaCertificado } from '../models/PlantillaCertificado.js';

export const save = async ({ userId, courseId, url, nombreEstudiante, nombreCurso, htmlRenderizado, codigoVerificacion }) => {
  const result = await query(
    `INSERT INTO certificado
       (id_usuario, id_curso, url, nombre_estudiante, nombre_curso, html_renderizado, codigo_verificacion)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, courseId, url, nombreEstudiante ?? null, nombreCurso ?? null, htmlRenderizado ?? null, codigoVerificacion ?? null]
  );
  return Certificate.fromRow(result.rows[0]);
};

export const marcarDescargado = async (idCertificado) => {
  const result = await query(
    `UPDATE certificado
     SET descargado = true, descargado_en = NOW()
     WHERE id_certificado = $1 AND descargado = false
     RETURNING *`,
    [idCertificado]
  );
  return result.rows[0] ? Certificate.fromRow(result.rows[0]) : null;
};

export const findById = async (idCertificado) => {
  const result = await query(
    'SELECT * FROM certificado WHERE id_certificado = $1',
    [idCertificado]
  );
  return result.rows[0] ? Certificate.fromRow(result.rows[0]) : null;
};

export const findByUserId = async (userId) => {
  const result = await query(
    'SELECT * FROM certificado WHERE id_usuario = $1 ORDER BY emitido_en DESC',
    [userId]
  );
  return result.rows.map(Certificate.fromRow);
};

export const findByUserIdAndCourseId = async (userId, courseId) => {
  const result = await query(
    'SELECT * FROM certificado WHERE id_usuario = $1 AND id_curso = $2',
    [userId, courseId]
  );
  return result.rows[0] ? Certificate.fromRow(result.rows[0]) : null;
};

export const findByCodigoVerificacion = async (codigo) => {
  const result = await query(
    'SELECT * FROM certificado WHERE codigo_verificacion = $1',
    [codigo]
  );
  return result.rows[0] ? Certificate.fromRow(result.rows[0]) : null;
};

export const findDatosParaCertificado = async (userId, courseId) => {
  const result = await query(
    `SELECT
       u.nombre   AS nombre_estudiante,
       cu.titulo  AS nombre_curso,
       ud.nombre  AS nombre_docente
     FROM usuario u, curso cu
     LEFT JOIN usuario ud ON cu.id_usuario::text = ud.id_usuario::text
     WHERE u.id_usuario = $1 AND cu.id_curso = $2`,
    [userId, courseId]
  );
  return result.rows[0] ?? null;
};

export const findPlantillaByCurso = async (idCurso) => {
  const result = await query(
    'SELECT * FROM plantilla_certificado WHERE id_curso = $1 AND activo = true',
    [idCurso]
  );
  return result.rows[0] ? PlantillaCertificado.fromRow(result.rows[0]) : null;
};

export const upsertPlantilla = async (idCurso, htmlTemplate) => {
  const result = await query(
    `INSERT INTO plantilla_certificado (id_curso, html_template)
     VALUES ($1, $2)
     ON CONFLICT (id_curso) DO UPDATE SET
       html_template = EXCLUDED.html_template,
       activo        = true
     RETURNING *`,
    [idCurso, htmlTemplate]
  );
  return PlantillaCertificado.fromRow(result.rows[0]);
};
