import { query, getClient } from '../database/db.js';
import { RespuestaUsuario } from '../models/RespuestaUsuario.js';

export const yaRespondio = async (idEvaluacion, idUsuario) => {
  const result = await query(
    'SELECT id_respuesta FROM respuesta_usuario WHERE id_evaluacion = $1 AND id_usuario = $2',
    [idEvaluacion, idUsuario]
  );
  return result.rows.length > 0;
};

export const saveMany = async (respuestas) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const saved = [];
    for (const { idEvaluacion, idUsuario, idOpcion } of respuestas) {
      const r = await client.query(
        `INSERT INTO respuesta_usuario (id_evaluacion, id_usuario, id_opcion)
         VALUES ($1, $2, $3) RETURNING *`,
        [idEvaluacion, idUsuario, idOpcion]
      );
      saved.push(RespuestaUsuario.fromRow(r.rows[0]));
    }
    await client.query('COMMIT');
    return saved;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const findByUsuarioAndEvaluaciones = async (idUsuario, idsEvaluacion) => {
  const result = await query(
    `SELECT ru.*, oe.es_correcta, e.puntaje
     FROM respuesta_usuario ru
     JOIN opcion_evaluacion oe ON ru.id_opcion = oe.id_opcion
     JOIN evaluacion e ON ru.id_evaluacion = e.id_evaluacion
     WHERE ru.id_usuario = $1 AND ru.id_evaluacion = ANY($2)`,
    [idUsuario, idsEvaluacion]
  );
  return result.rows;
};
