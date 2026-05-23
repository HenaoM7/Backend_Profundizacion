-- Vista Docente (Equipo 6): estudiantes distintos matriculados en cursos del docente.
CREATE OR REPLACE VIEW v_docente_total_estudiantes AS
SELECT
  c.id_usuario AS id_docente,
  COUNT(DISTINCT i.id_usuario)::bigint AS total_estudiantes_matriculados
FROM curso c
INNER JOIN inscripcion i ON i.id_curso = c.id_curso
WHERE c.eliminacion IS NULL
GROUP BY c.id_usuario;
