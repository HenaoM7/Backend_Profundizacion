-- Migración: Crear vista materializada de top docentes por estudiantes
-- Descripción: Precalcula los 5 docentes con más estudiantes inscritos

CREATE MATERIALIZED VIEW v_top_docentes_ranking AS
SELECT
  u.id_usuario,
  u.nombre,
  COUNT(DISTINCT i.id_usuario)::int as estudiantes_inscritos,
  COUNT(DISTINCT c.id_curso)::int as cursos_creados,
  u.creacion
FROM usuario u
LEFT JOIN curso c ON c.id_usuario = u.id_usuario AND c.eliminacion IS NULL
LEFT JOIN inscripcion i ON i.id_curso = c.id_curso
WHERE EXISTS (
  SELECT 1 FROM usuario_rol ur 
  JOIN rol r ON r.id_rol = ur.id_rol 
  WHERE ur.id_usuario = u.id_usuario 
  AND LOWER(r.nombre) = 'docente'
)
GROUP BY u.id_usuario, u.nombre, u.creacion
ORDER BY estudiantes_inscritos DESC
LIMIT 5;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_mv_top_docentes_estudiantes 
  ON v_top_docentes_ranking (estudiantes_inscritos DESC);

CREATE INDEX IF NOT EXISTS idx_mv_top_docentes_cursos 
  ON v_top_docentes_ranking (cursos_creados DESC);
