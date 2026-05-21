DROP VIEW IF EXISTS v_docente_cursos_sin_modulos;

CREATE OR REPLACE VIEW v_docente_cursos_activos AS
SELECT
  id_usuario AS id_docente,
  id_curso,
  titulo
FROM curso
WHERE eliminacion IS NULL;

CREATE OR REPLACE VIEW v_docente_totales AS
SELECT
  c.id_usuario AS id_docente,
  COUNT(DISTINCT c.id_curso)::bigint AS total_cursos,
  COUNT(DISTINCT m.id_modulo)::bigint AS total_modulos,
  COUNT(DISTINCT ct.id_contenido)::bigint AS total_contenidos
FROM curso c
LEFT JOIN modulo m ON m.id_curso = c.id_curso
LEFT JOIN contenido ct ON ct.id_modulo = m.id_modulo
WHERE c.eliminacion IS NULL
GROUP BY c.id_usuario;
