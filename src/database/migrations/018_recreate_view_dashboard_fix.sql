-- Migración: Recrear vista materializada de métricas mensuales con fix
-- Descripción: Recreate v_dashboard_metricas_mensuales con SUM para contar sesiones totales

CREATE MATERIALIZED VIEW v_dashboard_metricas_mensuales AS
WITH current_month_dates AS (
  SELECT 
    EXTRACT(YEAR FROM NOW())::int as year, 
    EXTRACT(MONTH FROM NOW())::int as month
),
prev_month_dates AS (
  SELECT 
    EXTRACT(YEAR FROM 
      (DATE_TRUNC('month', NOW()) - INTERVAL '1 month')
    )::int as year,
    EXTRACT(MONTH FROM 
      (DATE_TRUNC('month', NOW()) - INTERVAL '1 month')
    )::int as month
),
sesiones_mes AS (
  SELECT 
    SUM(jsonb_array_length(u.accesos_mes_actual))::int as este_mes
  FROM usuario u
  WHERE u.accesos_mes_actual IS NOT NULL 
    AND u.accesos_mes_actual::text != '[]'::text
),
sesiones_mes_anterior AS (
  SELECT 
    SUM(jsonb_array_length(u.accesos_mes_anterior))::int as mes_anterior
  FROM usuario u
  WHERE u.accesos_mes_anterior IS NOT NULL 
    AND u.accesos_mes_anterior::text != '[]'::text
),
mes_actual_limites AS (
  SELECT 
    DATE_TRUNC('month', MAKE_DATE(
      (SELECT year FROM current_month_dates), 
      (SELECT month FROM current_month_dates), 
      1
    ))::timestamp as inicio_mes,
    (DATE_TRUNC('month', MAKE_DATE(
      (SELECT year FROM current_month_dates), 
      (SELECT month FROM current_month_dates), 
      1
    )) + INTERVAL '1 month')::timestamp as fin_mes
),
mes_anterior_limites AS (
  SELECT 
    DATE_TRUNC('month', MAKE_DATE(
      (SELECT year FROM prev_month_dates), 
      (SELECT month FROM prev_month_dates), 
      1
    ))::timestamp as inicio_mes,
    (DATE_TRUNC('month', MAKE_DATE(
      (SELECT year FROM prev_month_dates), 
      (SELECT month FROM prev_month_dates), 
      1
    )) + INTERVAL '1 month')::timestamp as fin_mes
),
tiempo_promedio_mes AS (
  SELECT 
    ROUND(EXTRACT(EPOCH FROM AVG(
      LEAST(pc.fecha_completado, ml.fin_mes) - GREATEST(pc.fecha_inicio, ml.inicio_mes)
    )) / 60)::int as este_mes
  FROM progreso_curso pc, mes_actual_limites ml
  WHERE pc.completado = TRUE
    AND pc.fecha_completado IS NOT NULL
    AND pc.fecha_inicio < ml.fin_mes
    AND pc.fecha_completado > ml.inicio_mes
),
tiempo_promedio_mes_anterior AS (
  SELECT 
    ROUND(EXTRACT(EPOCH FROM AVG(
      LEAST(pc.fecha_completado, ml.fin_mes) - GREATEST(pc.fecha_inicio, ml.inicio_mes)
    )) / 60)::int as mes_anterior
  FROM progreso_curso pc, mes_anterior_limites ml
  WHERE pc.completado = TRUE
    AND pc.fecha_completado IS NOT NULL
    AND pc.fecha_inicio < ml.fin_mes
    AND pc.fecha_completado > ml.inicio_mes
),
certificados_mes AS (
  SELECT 
    COUNT(*)::int as este_mes
  FROM certificado
  WHERE EXTRACT(YEAR FROM certificado.emitido_en) = (SELECT year FROM current_month_dates)
    AND EXTRACT(MONTH FROM certificado.emitido_en) = (SELECT month FROM current_month_dates)
),
certificados_mes_anterior AS (
  SELECT 
    COUNT(*)::int as mes_anterior
  FROM certificado
  WHERE EXTRACT(YEAR FROM certificado.emitido_en) = (SELECT year FROM prev_month_dates)
    AND EXTRACT(MONTH FROM certificado.emitido_en) = (SELECT month FROM prev_month_dates)
),
cursos_completados_mes AS (
  SELECT 
    COUNT(DISTINCT pc.id_progreso_curso)::int as este_mes
  FROM progreso_curso pc
  WHERE pc.completado = TRUE
    AND EXTRACT(YEAR FROM pc.fecha_completado) = (SELECT year FROM current_month_dates)
    AND EXTRACT(MONTH FROM pc.fecha_completado) = (SELECT month FROM current_month_dates)
),
cursos_completados_mes_anterior AS (
  SELECT 
    COUNT(DISTINCT pc.id_progreso_curso)::int as mes_anterior
  FROM progreso_curso pc
  WHERE pc.completado = TRUE
    AND EXTRACT(YEAR FROM pc.fecha_completado) = (SELECT year FROM prev_month_dates)
    AND EXTRACT(MONTH FROM pc.fecha_completado) = (SELECT month FROM prev_month_dates)
),
nuevos_usuarios_mes AS (
  SELECT 
    COUNT(*)::int as este_mes
  FROM usuario u
  WHERE EXTRACT(YEAR FROM u.creacion) = (SELECT year FROM current_month_dates)
    AND EXTRACT(MONTH FROM u.creacion) = (SELECT month FROM current_month_dates)
),
nuevos_usuarios_mes_anterior AS (
  SELECT 
    COUNT(*)::int as mes_anterior
  FROM usuario u
  WHERE EXTRACT(YEAR FROM u.creacion) = (SELECT year FROM prev_month_dates)
    AND EXTRACT(MONTH FROM u.creacion) = (SELECT month FROM prev_month_dates)
),
cursos_sin_inscripcion_mes AS (
  SELECT 
    COUNT(DISTINCT c.id_curso)::int as este_mes
  FROM curso c
  WHERE c.activo = TRUE
    AND EXISTS (
      SELECT 1 FROM modulo m 
      WHERE m.id_curso = c.id_curso AND m.eliminacion IS NULL
      AND EXISTS (
        SELECT 1 FROM contenido con 
        WHERE con.id_modulo = m.id_modulo AND con.eliminacion IS NULL
      )
    )
    AND NOT EXISTS (
      SELECT 1 FROM inscripcion i WHERE i.id_curso = c.id_curso
    )
    AND c.eliminacion IS NULL
    AND EXTRACT(YEAR FROM c.creacion) = (SELECT year FROM current_month_dates)
    AND EXTRACT(MONTH FROM c.creacion) = (SELECT month FROM current_month_dates)
),
cursos_sin_inscripcion_mes_anterior AS (
  SELECT 
    COUNT(DISTINCT c.id_curso)::int as mes_anterior
  FROM curso c
  WHERE c.activo = TRUE
    AND EXISTS (
      SELECT 1 FROM modulo m 
      WHERE m.id_curso = c.id_curso AND m.eliminacion IS NULL
      AND EXISTS (
        SELECT 1 FROM contenido con 
        WHERE con.id_modulo = m.id_modulo AND con.eliminacion IS NULL
      )
    )
    AND NOT EXISTS (
      SELECT 1 FROM inscripcion i WHERE i.id_curso = c.id_curso
    )
    AND c.eliminacion IS NULL
    AND EXTRACT(YEAR FROM c.creacion) = (SELECT year FROM prev_month_dates)
    AND EXTRACT(MONTH FROM c.creacion) = (SELECT month FROM prev_month_dates)
),
accesos_expandidos AS (
  SELECT 
    u.id_usuario,
    (jsonb_array_elements(u.accesos_ultimos_7dias)::text)::date as dia
  FROM usuario u
  WHERE u.accesos_ultimos_7dias IS NOT NULL 
    AND u.accesos_ultimos_7dias::text != '[]'::text
),
tendencias_diarias AS (
  SELECT 
    dia::text as dia,
    COUNT(DISTINCT id_usuario)::int as sesiones
  FROM accesos_expandidos
  GROUP BY dia
  ORDER BY dia
),
tendencias_semana AS (
  SELECT 
    EXTRACT(DOW FROM dia)::int as dow,
    CASE EXTRACT(DOW FROM dia)
      WHEN 0 THEN 'Dom'
      WHEN 1 THEN 'Lun'
      WHEN 2 THEN 'Mar'
      WHEN 3 THEN 'Mié'
      WHEN 4 THEN 'Jue'
      WHEN 5 THEN 'Vie'
      WHEN 6 THEN 'Sáb'
    END as dia_semana,
    COUNT(DISTINCT id_usuario)::int as total
  FROM accesos_expandidos
  GROUP BY EXTRACT(DOW FROM dia)
)
SELECT
  (SELECT este_mes FROM sesiones_mes)::int as sesiones_este_mes,
  (SELECT mes_anterior FROM sesiones_mes_anterior)::int as sesiones_mes_anterior,
  (SELECT este_mes FROM tiempo_promedio_mes)::int as tiempo_este_mes,
  (SELECT mes_anterior FROM tiempo_promedio_mes_anterior)::int as tiempo_mes_anterior,
  (SELECT este_mes FROM certificados_mes)::int as cert_este_mes,
  (SELECT mes_anterior FROM certificados_mes_anterior)::int as cert_mes_anterior,
  (SELECT este_mes FROM cursos_completados_mes)::int as cursos_este_mes,
  (SELECT mes_anterior FROM cursos_completados_mes_anterior)::int as cursos_mes_anterior,
  (SELECT este_mes FROM nuevos_usuarios_mes)::int as usuarios_este_mes,
  (SELECT mes_anterior FROM nuevos_usuarios_mes_anterior)::int as usuarios_mes_anterior,
  (SELECT este_mes FROM cursos_sin_inscripcion_mes)::int as sin_insc_este_mes,
  (SELECT mes_anterior FROM cursos_sin_inscripcion_mes_anterior)::int as sin_insc_mes_anterior,
  COALESCE(
    (SELECT json_agg(json_build_object('dia', dia, 'sesiones', sesiones) ORDER BY dia)
     FROM tendencias_diarias),
    '[]'::json
  ) as tendencias_dias,
  COALESCE(
    (SELECT json_agg(json_build_object('diaSemana', dia_semana, 'total', total) ORDER BY dow)
     FROM tendencias_semana),
    '[]'::json
  ) as tendencias_semana
FROM (SELECT 1) dummy;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_usuario_accesos_ultimos_7dias 
  ON usuario (id_usuario) 
  WHERE accesos_ultimos_7dias IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_progreso_curso_completado_fecha 
  ON progreso_curso (completado, fecha_completado, fecha_inicio) 
  WHERE completado = TRUE;

CREATE INDEX IF NOT EXISTS idx_certificado_emitido_en 
  ON certificado (emitido_en);

CREATE INDEX IF NOT EXISTS idx_curso_creacion_activo 
  ON curso (creacion, activo) 
  WHERE activo = TRUE AND eliminacion IS NULL;
