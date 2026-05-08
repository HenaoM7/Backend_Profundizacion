import { query } from '../database/db.js';

export const findById = async (idEvaluacion) => {
  const result = await query(
    'SELECT * FROM evaluacion WHERE id_evaluacion = $1',
    [idEvaluacion]
  );
  return result.rows[0] ?? null;
};

export const findByContenido = async (idContenido) => {
  const result = await query(
    'SELECT * FROM evaluacion WHERE id_contenido = $1 ORDER BY id_evaluacion',
    [idContenido]
  );
  return result.rows;
};

export const findOpciones = async (idEvaluacion) => {
  const result = await query(
    'SELECT * FROM opcion_evaluacion WHERE id_evaluacion = $1 ORDER BY orden',
    [idEvaluacion]
  );
  return result.rows;
};

export const findOpcionById = async (idOpcion) => {
  const result = await query(
    'SELECT * FROM opcion_evaluacion WHERE id_opcion = $1',
    [idOpcion]
  );
  return result.rows[0] ?? null;
};

// Obtiene id_modulo e id_curso desde el contenido de la evaluacion
export const findContextoByContenido = async (idContenido) => {
  const result = await query(
    `SELECT c.id_modulo, m.id_curso
     FROM contenido c
     JOIN modulo m ON c.id_modulo = m.id_modulo
     WHERE c.id_contenido = $1`,
    [idContenido]
  );
  return result.rows[0] ?? null;
};
