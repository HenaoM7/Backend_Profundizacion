import { query, getClient } from '../database/db.js';
import { ProgresoEstudiante } from '../models/ProgresoEstudiante.js';
import { ProgresoCurso }      from '../models/ProgresoCurso.js';

// ── Contenido ────────────────────────────────────────────────────────────────

export const findContenidoConContexto = async (idContenido) => {
  const result = await query(
    `SELECT c.id_contenido, c.id_modulo, c.activo,
            m.id_curso, m.titulo AS titulo_modulo,
            cu.titulo AS titulo_curso
     FROM contenido c
     JOIN modulo m  ON c.id_modulo  = m.id_modulo
     JOIN curso  cu ON m.id_curso   = cu.id_curso
     WHERE c.id_contenido = $1`,
    [idContenido]
  );
  return result.rows[0] ?? null;
};

export const yaCompleto = async (idUsuario, idContenido) => {
  const result = await query(
    'SELECT id_progreso FROM progreso_estudiante WHERE id_usuario = $1 AND id_contenido = $2 AND completado = true',
    [idUsuario, idContenido]
  );
  return result.rows.length > 0;
};

export const saveProgresoContenido = async (idUsuario, idCurso, idContenido) => {
  const result = await query(
    `INSERT INTO progreso_estudiante (id_usuario, id_curso, id_contenido, completado, completado_en)
     VALUES ($1, $2, $3, true, NOW())
     ON CONFLICT (id_usuario, id_contenido)
     DO UPDATE SET completado = true, completado_en = NOW()
     RETURNING *`,
    [idUsuario, idCurso, idContenido]
  );
  return ProgresoEstudiante.fromRow(result.rows[0]);
};

// ── Cálculo de progreso ───────────────────────────────────────────────────────

export const contarContenidos = async (idUsuario, idCurso) => {
  const total = await query(
    `SELECT COUNT(c.id_contenido)::int AS total
     FROM contenido c
     JOIN modulo m ON c.id_modulo = m.id_modulo
     WHERE m.id_curso = $1 AND c.activo = true`,
    [idCurso]
  );

  const completados = await query(
    `SELECT COUNT(pe.id_progreso)::int AS completados
     FROM progreso_estudiante pe
     JOIN contenido c ON pe.id_contenido = c.id_contenido
     JOIN modulo m    ON c.id_modulo     = m.id_modulo
     WHERE pe.id_usuario = $1 AND m.id_curso = $2 AND pe.completado = true`,
    [idUsuario, idCurso]
  );

  return {
    total:       total.rows[0].total,
    completados: completados.rows[0].completados,
  };
};

// ── Progreso por curso ────────────────────────────────────────────────────────

export const upsertProgresoCurso = async (client, {
  idUsuario, idCurso, porcentaje, completados, total, completado, aprobado,
}) => {
  const fechaCompletado = completado ? 'NOW()' : 'NULL';
  const result = await client.query(
    `INSERT INTO progreso_curso
       (id_usuario, id_curso, porcentaje, contenidos_completados, total_contenidos,
        completado, aprobado, fecha_completado)
     VALUES ($1, $2, $3, $4, $5, $6, $7, ${completado ? 'NOW()' : 'NULL'})
     ON CONFLICT (id_usuario, id_curso) DO UPDATE SET
       porcentaje             = EXCLUDED.porcentaje,
       contenidos_completados = EXCLUDED.contenidos_completados,
       total_contenidos       = EXCLUDED.total_contenidos,
       completado             = EXCLUDED.completado,
       aprobado               = EXCLUDED.aprobado,
       fecha_completado       = ${completado ? 'NOW()' : 'progreso_curso.fecha_completado'}
     RETURNING *`,
    [idUsuario, idCurso, porcentaje, completados, total, completado, aprobado]
  );
  return ProgresoCurso.fromRow(result.rows[0]);
};

export const findProgresoCurso = async (idUsuario, idCurso) => {
  const result = await query(
    'SELECT * FROM progreso_curso WHERE id_usuario = $1 AND id_curso = $2',
    [idUsuario, idCurso]
  );
  return result.rows[0] ? ProgresoCurso.fromRow(result.rows[0]) : null;
};

export const findProgresoCursoTodos = async (idCurso) => {
  const result = await query(
    `SELECT pc.*,
            u.nombre AS nombre_estudiante
     FROM progreso_curso pc
     JOIN usuario u ON pc.id_usuario = u.id_usuario
     WHERE pc.id_curso = $1
     ORDER BY pc.porcentaje DESC`,
    [idCurso]
  );
  return result.rows;
};

export const findMisCursos = async (idUsuario) => {
  const result = await query(
    `SELECT pc.*,
            cu.titulo AS titulo_curso
     FROM progreso_curso pc
     JOIN curso cu ON pc.id_curso = cu.id_curso
     WHERE pc.id_usuario = $1
     ORDER BY pc.porcentaje DESC`,
    [idUsuario]
  );
  return result.rows;
};

// Datos de estudiante y curso para el certificado
export const findDatosParaCertificado = async (idUsuario, idCurso) => {
  const result = await query(
    `SELECT u.nombre AS nombre_estudiante, cu.titulo AS nombre_curso
     FROM usuario u, curso cu
     WHERE u.id_usuario = $1 AND cu.id_curso = $2`,
    [idUsuario, idCurso]
  );
  return result.rows[0] ?? null;
};

