import { query } from '../database/db.js';

export const obtenerResumenDashboard = async (idDocente) => {
  const resultado = await query(
    `SELECT COUNT(*)::int AS total_cursos
     FROM curso
     WHERE id_usuario = $1
       AND eliminacion IS NULL`,
    [idDocente]
  );

  return {
    total_cursos: resultado.rows[0].total_cursos,
    total_estudiantes: 0,
    alertas: 0,
  };
};

export const obtenerMisEstudiantes = async (idDocente) => {
  const resultado = await query(
    `SELECT DISTINCT u.id_usuario, u.nombre, u.correo
     FROM progreso_curso pc
     JOIN curso c ON c.id_curso = pc.id_curso
     JOIN usuario u ON u.id_usuario::text = pc.id_usuario::text
     WHERE c.id_usuario = $1
       AND c.eliminacion IS NULL
     ORDER BY u.nombre ASC`,
    [idDocente]
  );

  return resultado.rows;
};

export const validarNotaDocente = async (nota) => {
  const notaNumerica = Number(nota);

  if (Number.isNaN(notaNumerica)) {
    return {
      valid: false,
      message: 'La nota debe ser un número',
    };
  }

  if (notaNumerica < 0 || notaNumerica > 5) {
    return {
      valid: false,
      message: 'La nota debe estar entre 0.0 y 5.0',
    };
  }

  return {
    valid: true,
    message: 'Nota válida',
  };
};
