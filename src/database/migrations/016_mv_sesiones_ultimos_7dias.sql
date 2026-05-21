-- Migración: Crear vista materializada de sesiones últimos 7 días
-- Descripción: Precalcula sesiones diarias de los últimos 7 días

CREATE MATERIALIZED VIEW v_sesiones_ultimos_7dias AS
WITH accesos_expandidos AS (
  SELECT 
    u.id_usuario,
    (jsonb_array_elements(u.accesos_ultimos_7dias)::text)::date as dia
  FROM usuario u
  WHERE u.accesos_ultimos_7dias IS NOT NULL 
    AND u.accesos_ultimos_7dias::text != '[]'::text
)
SELECT 
  dia::text as dia,
  COUNT(DISTINCT id_usuario)::int as sesiones
FROM accesos_expandidos
GROUP BY dia
ORDER BY dia DESC;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_mv_sesiones_dia 
  ON v_sesiones_ultimos_7dias (dia);

CREATE INDEX IF NOT EXISTS idx_mv_sesiones_count 
  ON v_sesiones_ultimos_7dias (sesiones DESC);
