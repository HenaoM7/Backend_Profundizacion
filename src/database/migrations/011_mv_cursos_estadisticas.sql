-- Migración: Crear vista materializada de estadísticas de cursos
-- Descripción: Precalcula estadísticas de cursos para mejorar performance del superadmin

CREATE MATERIALIZED VIEW v_cursos_estadisticas AS
SELECT
  c.id_curso,
  c.id_usuario,
  c.titulo,
  c.descripcion,
  c.activo,
  c.creacion,
  u.nombre as nombre_docente,
  COUNT(DISTINCT m.id_modulo)::int as total_modulos,
  COUNT(DISTINCT i.id_usuario)::int as total_estudiantes,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM modulo m 
      WHERE m.id_curso = c.id_curso 
      AND m.eliminacion IS NULL
      AND EXISTS (
        SELECT 1 FROM contenido con
        WHERE con.id_modulo = m.id_modulo
        AND con.eliminacion IS NULL
      )
    )
    THEN 'Con contenido'
    ELSE 'Sin contenido'
  END as tiene_contenido,
  CASE 
    WHEN EXISTS (SELECT 1 FROM inscripcion i2 WHERE i2.id_curso = c.id_curso)
    THEN 'Con inscripciones'
    ELSE 'Sin inscripciones'
  END as tiene_inscripciones,
  CASE WHEN c.activo THEN 'Activo' ELSE 'Inactivo' END as estado
FROM curso c
LEFT JOIN usuario u ON u.id_usuario = c.id_usuario
LEFT JOIN modulo m ON m.id_curso = c.id_curso AND m.eliminacion IS NULL
LEFT JOIN inscripcion i ON i.id_curso = c.id_curso
WHERE c.eliminacion IS NULL
GROUP BY c.id_curso, c.id_usuario, c.titulo, c.descripcion, c.activo, c.creacion, u.nombre;

-- Crear índices para mejorar la performance de las queries que usan esta vista
CREATE INDEX IF NOT EXISTS idx_mv_cursos_activo 
  ON v_cursos_estadisticas (activo);

CREATE INDEX IF NOT EXISTS idx_mv_cursos_tiene_contenido 
  ON v_cursos_estadisticas (tiene_contenido);

CREATE INDEX IF NOT EXISTS idx_mv_cursos_tiene_inscripciones 
  ON v_cursos_estadisticas (tiene_inscripciones);

CREATE INDEX IF NOT EXISTS idx_mv_cursos_docente 
  ON v_cursos_estadisticas (id_usuario);

CREATE INDEX IF NOT EXISTS idx_mv_cursos_creacion 
  ON v_cursos_estadisticas (creacion DESC);
