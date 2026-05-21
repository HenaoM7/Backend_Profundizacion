-- Migración: Crear vista materializada de contenido por tipo
-- Descripción: Precalcula el conteo y porcentaje de contenidos agrupados por tipo

CREATE MATERIALIZED VIEW v_contenido_por_tipo AS
SELECT
  con.tipo,
  COUNT(*)::int as cantidad,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER ())::int as porcentaje
FROM contenido con
WHERE con.eliminacion IS NULL
GROUP BY con.tipo
ORDER BY cantidad DESC;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_mv_contenido_tipo 
  ON v_contenido_por_tipo (tipo);

CREATE INDEX IF NOT EXISTS idx_mv_contenido_cantidad 
  ON v_contenido_por_tipo (cantidad DESC);
