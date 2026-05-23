-- Vista Docente (Equipo 6): inscritos por curso del docente.
CREATE OR REPLACE VIEW v_docente_inscritos_por_curso AS
SELECT
  c.id_usuario AS id_docente,
  c.id_curso,
  c.titulo,
  COUNT(DISTINCT i.id_usuario)::bigint AS total_inscritos
FROM curso c
LEFT JOIN inscripcion i ON i.id_curso = c.id_curso
WHERE c.eliminacion IS NULL
GROUP BY c.id_usuario, c.id_curso, c.titulo;
