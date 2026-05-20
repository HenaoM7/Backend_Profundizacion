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

-- Cursos del docente sin estructura completa: 0 módulos y/o 0 contenidos.
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

-- Punto 6: total de estudiantes distintos inscritos en cursos del docente.
CREATE OR REPLACE VIEW v_docente_total_estudiantes AS
SELECT
  c.id_usuario AS id_docente,
  COUNT(DISTINCT i.id_usuario)::bigint AS total_estudiantes_matriculados
FROM curso c
INNER JOIN inscripcion i ON i.id_curso = c.id_curso
WHERE c.eliminacion IS NULL
GROUP BY c.id_usuario;

-- Punto 4/5: inscritos por curso (para rankings).
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

-- Punto 10: inscripciones recientes con porcentaje de progreso_curso.
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
