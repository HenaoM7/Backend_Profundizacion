-- Vista Docente (Equipo 6): estudiantes con certificado emitido por curso del docente.
CREATE OR REPLACE VIEW v_docente_completados_por_curso AS
SELECT
  c.id_usuario AS id_docente,
  c.id_curso,
  c.titulo,
  COUNT(DISTINCT cert.id_usuario)::bigint AS total_completados
FROM curso c
LEFT JOIN certificado cert ON cert.id_curso = c.id_curso
WHERE c.eliminacion IS NULL
GROUP BY c.id_usuario, c.id_curso, c.titulo;
