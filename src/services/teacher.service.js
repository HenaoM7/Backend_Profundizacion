import { query } from '../database/db.js';

export const obtenerResumenTotalesDocente = async (idDocente) => {
  const [lista, totales, enProceso] = await Promise.all([
    query(
      `
      SELECT id_curso, titulo
      FROM curso
      WHERE id_usuario = $1
        AND eliminacion IS NULL
      ORDER BY titulo
      `,
      [idDocente],
    ),
    query(
      `
      SELECT total_cursos, total_modulos, total_contenidos
      FROM v_docente_totales_cursos_modulos
      WHERE id_docente = $1
      `,
      [idDocente],
    ),
    query(
      `
      SELECT id_curso, titulo, total_modulos, total_contenidos
      FROM v_docente_metricas_por_curso
      WHERE id_docente = $1
        AND total_modulos = 0
        AND total_contenidos = 0
      ORDER BY titulo
      `,
      [idDocente],
    ),
  ]);

  const fila = totales.rows[0];

  return {
    total_cursos: fila ? Number(fila.total_cursos) : 0,
    total_modulos: fila ? Number(fila.total_modulos) : 0,
    total_contenidos: fila ? Number(fila.total_contenidos) : 0,
    cursos_en_proceso: enProceso.rows,
    cursos: lista.rows,
  };
};
