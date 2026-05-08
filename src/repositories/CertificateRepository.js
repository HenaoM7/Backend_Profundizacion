import { query, getClient } from '../database/db.js';
import { Certificate } from '../models/Certificate.js';
import { randomUUID } from 'crypto';

const getOrCreateTipoDocumentoCertificado = async (client) => {
  const existing = await client.query(
    "SELECT id_tipo_documento FROM tipo_documento WHERE nombre = 'Certificado' LIMIT 1"
  );
  if (existing.rows.length) return existing.rows[0].id_tipo_documento;

  const inserted = await client.query(
    "INSERT INTO tipo_documento (nombre, estado) VALUES ('Certificado', 'S') RETURNING id_tipo_documento"
  );
  return inserted.rows[0].id_tipo_documento;
};

const createMaestroDocumento = async (client, { numeroCertificado, idTipoDoc, url }) => {
  const maxResult = await client.query(
    'SELECT COALESCE(MAX(id_maestro_documento), 0) + 1 AS next_id FROM maestro_documento FOR UPDATE'
  );
  const nextId = maxResult.rows[0].next_id;

  await client.query(
    `INSERT INTO maestro_documento (id_maestro_documento, numero_documento, id_tipo_documento, ruta_documento, activo)
     VALUES ($1, $2, $3, $4, 'S')`,
    [nextId, numeroCertificado, idTipoDoc, url]
  );
  return nextId;
};

export const save = async ({ userId, courseId, imagenUrl = null, nombreEstudiante = null, nombreCurso = null }) => {
  const verifyId   = randomUUID();
  const url        = `https://certs.eduplatform.com/verify/${verifyId}`;
  const numeroCert = `CERT-${Date.now()}`.slice(0, 20);
  const client     = await getClient();

  try {
    await client.query('BEGIN');

    const idTipoDoc    = await getOrCreateTipoDocumentoCertificado(client);
    const idMaestroDoc = await createMaestroDocumento(client, {
      numeroCertificado: numeroCert,
      idTipoDoc,
      url,
    });

    const result = await client.query(
      `INSERT INTO certificado
         (id_usuario, id_curso, url, id_maestro_documento, imagen_url, nombre_estudiante, nombre_curso)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, courseId, url, idMaestroDoc, imagenUrl, nombreEstudiante, nombreCurso]
    );

    await client.query('COMMIT');
    return Certificate.fromRow(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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
