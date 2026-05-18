-- =============================================
-- Report views — Module Reportes (Team 9)
-- Run this file to create or update all views.
-- Views only query these tables (no direct JOINs
-- in the endpoints): progreso_curso, curso,
-- modulo, contenido, intento_validacion, certificado
-- =============================================

-- View 1: Most popular courses by enrollments (inscripcion table, non-deleted courses only)
DROP VIEW IF EXISTS v_cursos_populares;
CREATE VIEW v_cursos_populares AS
SELECT
  c.id_curso                        AS curso_id,
  c.titulo                          AS curso_titulo,
  COUNT(DISTINCT i.id_usuario)      AS total_inscritos
FROM curso c
LEFT JOIN inscripcion i ON i.id_curso = c.id_curso
WHERE c.eliminacion IS NULL
GROUP BY c.id_curso, c.titulo
ORDER BY total_inscritos DESC;

-- View 2: Raw enrollments from the inscripcion table — grouping and
-- period generation are done dynamically in the service based on the
-- agrupacion param (mensual / trimestral / semestral / anual / custom)
DROP VIEW IF EXISTS v_inscripciones_por_periodo;
CREATE VIEW v_inscripciones_por_periodo AS
SELECT
  id_curso    AS curso_id,
  fecha_inicio AS fecha_inscripcion
FROM inscripcion;

-- View 3: Average attempts to pass per module
DROP VIEW IF EXISTS v_intentos_por_modulo;
CREATE VIEW v_intentos_por_modulo AS
SELECT
  m.id_modulo,
  m.titulo                                              AS modulo_titulo,
  c.id_curso                                            AS curso_id,
  COUNT(DISTINCT iv.id_usuario)                         AS total_estudiantes,
  ROUND(
    COUNT(iv.id_intento)::NUMERIC
    / NULLIF(COUNT(DISTINCT iv.id_usuario), 0),
    2
  )                                                     AS promedio_intentos,
  MAX(iv.intentado_en)::DATE                            AS fecha
FROM modulo m
JOIN  curso      c  ON  c.id_curso      = m.id_curso
LEFT JOIN contenido ct ON ct.id_modulo  = m.id_modulo
                       AND ct.eliminacion IS NULL
LEFT JOIN intento_validacion iv ON iv.id_contenido = ct.id_contenido
WHERE m.eliminacion IS NULL
GROUP BY m.id_modulo, m.titulo, c.id_curso
ORDER BY m.titulo;

-- View 4: Completion rate per course
DROP VIEW IF EXISTS v_tasa_aprobacion;
CREATE VIEW v_tasa_aprobacion AS
SELECT
  c.id_curso                                                          AS curso_id,
  c.titulo                                                            AS curso_titulo,
  COUNT(pc.id_usuario)                                                AS total_inscritos,
  COUNT(CASE WHEN pc.fecha_completado IS NOT NULL THEN 1 END)         AS completados,
  COUNT(CASE WHEN pc.fecha_completado IS NULL     THEN 1 END)         AS no_completados,
  ROUND(
    COUNT(CASE WHEN pc.fecha_completado IS NOT NULL THEN 1 END)::NUMERIC
    / NULLIF(COUNT(pc.id_usuario), 0) * 100,
    2
  )                                                                   AS porcentaje_completados,
  MAX(pc.fecha_inicio)::DATE                                          AS fecha
FROM curso c
LEFT JOIN progreso_curso pc ON pc.id_curso = c.id_curso
WHERE c.eliminacion IS NULL
GROUP BY c.id_curso, c.titulo
ORDER BY c.titulo;

-- View 5: Active vs inactive courses — global summary
DROP VIEW IF EXISTS v_cursos_activos_inactivos;
CREATE VIEW v_cursos_activos_inactivos AS
SELECT
  COUNT(*)                                          AS total_cursos,
  COUNT(CASE WHEN activo = true  THEN 1 END)        AS activos,
  COUNT(CASE WHEN activo = false THEN 1 END)        AS inactivos
FROM curso
WHERE eliminacion IS NULL;

-- View 6: Certificates issued vs downloaded — global summary
DROP VIEW IF EXISTS v_certificados_emitidos_vs_descargados;
DROP VIEW IF EXISTS v_certificados_por_periodo;
CREATE VIEW v_certificados_emitidos_vs_descargados AS
SELECT
  COUNT(*)                                               AS total_emitidos,
  COUNT(CASE WHEN descargado = true THEN 1 END)          AS total_descargados,
  ROUND(
    COUNT(CASE WHEN descargado = true THEN 1 END)::NUMERIC
    / NULLIF(COUNT(*), 0) * 100,
    1
  )                                                      AS porcentaje_descarga
FROM certificado;
