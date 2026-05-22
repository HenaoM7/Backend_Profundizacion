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

export const obtenerTotalEstudiantesMatriculados = async (idDocente) => {
  const { rows } = await query(
    `
    SELECT total_estudiantes_matriculados
    FROM v_docente_total_estudiantes
    WHERE id_docente = $1
    `,
    [idDocente],
  );

  return {
    total_estudiantes_matriculados: rows[0]
      ? Number(rows[0].total_estudiantes_matriculados)
      : 0,
  };
};

const TOP_CURSOS_POR_INSCRITOS = 5;
const ULTIMOS_ESTUDIANTES_INSCRITOS = 10;

export const obtenerCursosConMasCompletados = async (idDocente) => {
  const { rows } = await query(
    `
    SELECT id_curso, titulo, total_completados
    FROM v_docente_completados_por_curso
    WHERE id_docente = $1
      AND total_completados > 0
    ORDER BY total_completados DESC, titulo ASC
    LIMIT $2
    `,
    [idDocente, TOP_CURSOS_POR_INSCRITOS],
  );

  return {
    cursos: rows.map((r) => ({
      id_curso: r.id_curso,
      titulo: r.titulo,
      total_completados: Number(r.total_completados),
    })),
  };
};

export const obtenerCursosConMasInscritos = async (idDocente) => {
  const { rows } = await query(
    `
    SELECT id_curso, titulo, total_inscritos
    FROM v_docente_inscritos_por_curso
    WHERE id_docente = $1
      AND total_inscritos > 0
    ORDER BY total_inscritos DESC, titulo ASC
    LIMIT $2
    `,
    [idDocente, TOP_CURSOS_POR_INSCRITOS],
  );

  return {
    cursos: rows.map((r) => ({
      id_curso: r.id_curso,
      titulo: r.titulo,
      total_inscritos: Number(r.total_inscritos),
    })),
  };
};

export const obtenerCursosConMenosInscritos = async (idDocente) => {
  const { rows } = await query(
    `
    SELECT id_curso, titulo, total_inscritos
    FROM v_docente_inscritos_por_curso
    WHERE id_docente = $1
    ORDER BY total_inscritos ASC, titulo ASC
    LIMIT $2
    `,
    [idDocente, TOP_CURSOS_POR_INSCRITOS],
  );

  return {
    cursos: rows.map((r) => ({
      id_curso: r.id_curso,
      titulo: r.titulo,
      total_inscritos: Number(r.total_inscritos),
    })),
  };
};

export const obtenerUltimosEstudiantesInscritos = async (idDocente) => {
  const { rows } = await query(
    `
    SELECT
      id_inscripcion,
      id_estudiante,
      nombre_estudiante,
      id_curso,
      titulo_curso,
      fecha_inicio,
      porcentaje
    FROM v_docente_ultimas_inscripciones
    WHERE id_docente = $1
    ORDER BY fecha_inicio DESC
    LIMIT $2
    `,
    [idDocente, ULTIMOS_ESTUDIANTES_INSCRITOS],
  );

  return {
    estudiantes: rows.map((r) => ({
      id_inscripcion: r.id_inscripcion,
      id_estudiante: r.id_estudiante,
      nombre_estudiante: r.nombre_estudiante,
      id_curso: r.id_curso,
      titulo_curso: r.titulo_curso,
      fecha_inicio: r.fecha_inicio,
      porcentaje: Number(r.porcentaje),
    })),
  };
};

export const obtenerCursosEnConstruccionDocente = async (idDocente) => {
  const { rows } = await query(
    `
    SELECT id_curso, titulo, cantidad_modulos, cantidad_contenidos
    FROM v_docente_cursos_en_construccion
    WHERE id_docente = $1
    ORDER BY titulo
    `,
    [idDocente],
  );

  return {
    cursos: rows.map((r) => ({
      id_curso: r.id_curso,
      titulo: r.titulo,
      cantidad_modulos: Number(r.cantidad_modulos),
      cantidad_contenidos: Number(r.cantidad_contenidos),
    })),
  };
};
