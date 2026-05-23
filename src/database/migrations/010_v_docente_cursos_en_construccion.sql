-- Vista Docente (Equipo 6): cursos con estructura incompleta (sin módulos y/o sin contenidos).
CREATE OR REPLACE VIEW v_docente_cursos_en_construccion AS
SELECT
  id_docente,
  id_curso,
  titulo,
  cantidad_modulos,
  cantidad_contenidos
FROM (
  SELECT
    c.id_usuario AS id_docente,
    c.id_curso,
    c.titulo,
    COUNT(DISTINCT m.id_modulo)::bigint AS cantidad_modulos,
    COUNT(DISTINCT ct.id_contenido)::bigint AS cantidad_contenidos
  FROM curso c
  LEFT JOIN modulo m ON m.id_curso = c.id_curso
  LEFT JOIN contenido ct ON ct.id_modulo = m.id_modulo
  WHERE c.eliminacion IS NULL
  GROUP BY c.id_usuario, c.id_curso, c.titulo
) t
WHERE t.cantidad_modulos = 0 OR t.cantidad_contenidos = 0;
