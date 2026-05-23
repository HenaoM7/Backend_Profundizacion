-- Vista Docente (Equipo 6): inscripciones recientes con avance del curso.
CREATE OR REPLACE VIEW v_docente_ultimas_inscripciones AS
SELECT
  c.id_usuario AS id_docente,
  i.id_inscripcion,
  i.id_usuario AS id_estudiante,
  u.nombre AS nombre_estudiante,
  i.id_curso,
  c.titulo AS titulo_curso,
  i.fecha_inicio,
  COALESCE(pc.porcentaje, 0)::numeric(5, 2) AS porcentaje
FROM inscripcion i
INNER JOIN curso c ON c.id_curso = i.id_curso
INNER JOIN usuario u ON u.id_usuario = i.id_usuario
LEFT JOIN progreso_curso pc
  ON pc.id_usuario = i.id_usuario AND pc.id_curso = i.id_curso
WHERE c.eliminacion IS NULL;
