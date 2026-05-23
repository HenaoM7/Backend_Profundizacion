import { query } from '../database/db.js';
import { ValidacionContenido } from '../models/ValidacionContenido.js';
import { IntentoValidacion }   from '../models/IntentoValidacion.js';

export const findByContenido = async (idContenido) => {
  const result = await query(
    'SELECT * FROM validacion_contenido WHERE id_contenido = $1 AND activo = true',
    [idContenido]
  );
  return result.rows[0] ? ValidacionContenido.fromRow(result.rows[0]) : null;
};

export const upsert = async (idContenido, { pregunta, respuestaCorrecta }) => {
  const result = await query(
    `INSERT INTO validacion_contenido (id_contenido, pregunta, respuesta_correcta)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_contenido) DO UPDATE SET
       pregunta           = EXCLUDED.pregunta,
       respuesta_correcta = EXCLUDED.respuesta_correcta,
       activo             = true
     RETURNING *`,
    [idContenido, pregunta, respuestaCorrecta]
  );
  return ValidacionContenido.fromRow(result.rows[0]);
};

export const saveIntento = async ({ idContenido, idUsuario, respuesta, fueCorrector }) => {
  const result = await query(
    `INSERT INTO intento_validacion (id_contenido, id_usuario, respuesta, fue_correcto)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [idContenido, idUsuario, respuesta, fueCorrector]
  );
  return IntentoValidacion.fromRow(result.rows[0]);
};

export const findTasaFalloByCurso = async (idCurso) => {
  const result = await query(
    `SELECT
       iv.id_contenido,
       c.titulo,
       COUNT(*)::int                                                                    AS total_intentos,
       COUNT(CASE WHEN NOT iv.fue_correcto THEN 1 END)::int                            AS total_fallos,
       ROUND(
         (COUNT(CASE WHEN NOT iv.fue_correcto THEN 1 END)::decimal
          / NULLIF(COUNT(*), 0)) * 100,
         2
       )::float                                                                         AS tasa_fallo
     FROM intento_validacion iv
     JOIN contenido c ON iv.id_contenido = c.id_contenido
     JOIN modulo    m ON c.id_modulo     = m.id_modulo
     WHERE m.id_curso = $1
     GROUP BY iv.id_contenido, c.titulo
     ORDER BY tasa_fallo DESC NULLS LAST`,
    [idCurso]
  );
  return result.rows;
};
