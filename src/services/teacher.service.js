import { query } from '../database/db.js';

export const obtenerResumenTotalesDocente = async (idDocente) => {
  const [lista, totales] = await Promise.all([
    query(
      `
      SELECT id_curso, titulo
      FROM v_docente_cursos_activos
      WHERE id_docente = $1
      ORDER BY titulo
      `,
      [idDocente],
    ),
    query(
      `
      SELECT total_cursos, total_modulos, total_contenidos
      FROM v_docente_totales
      WHERE id_docente = $1
      `,
      [idDocente],
    ),
  ]);

  const fila = totales.rows[0];

  return {
    total_cursos: fila ? Number(fila.total_cursos) : 0,
    total_modulos: fila ? Number(fila.total_modulos) : 0,
    total_contenidos: fila ? Number(fila.total_contenidos) : 0,
    cursos: lista.rows,
  };
};
