-- Migración: Crear vista materializada de top cursos por completitud
-- Descripción: Precalcula los 5 cursos con mayor completitud promedio

CREATE MATERIALIZED VIEW v_top_cursos_completitud AS
SELECT
  c.id_curso,
  c.titulo,
  u.nombre as nombre_docente,
  ROUND(AVG(COALESCE(pc.porcentaje, 0)))::int as promedio_completitud,
  COUNT(DISTINCT i.id_usuario)::int as estudiantes_inscritos,
  c.creacion
FROM curso c
LEFT JOIN usuario u ON u.id_usuario = c.id_usuario
LEFT JOIN inscripcion i ON i.id_curso = c.id_curso
LEFT JOIN progreso_curso pc ON pc.id_curso = c.id_curso
WHERE c.activo = TRUE AND c.eliminacion IS NULL
GROUP BY c.id_curso, c.titulo, u.nombre, c.creacion
ORDER BY promedio_completitud DESC
LIMIT 5;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_mv_top_cursos_completitud 
  ON v_top_cursos_completitud (promedio_completitud DESC);

CREATE INDEX IF NOT EXISTS idx_mv_top_cursos_estudiantes 
  ON v_top_cursos_completitud (estudiantes_inscritos DESC);
