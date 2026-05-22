-- Migración: Crear vista materializada de usuarios consolidados
-- Descripción: Precalcula datos consolidados de usuarios con sus roles para mejorar performance

CREATE MATERIALIZED VIEW v_usuarios_consolidado AS
SELECT DISTINCT
  u.id_usuario,
  u.nombre,
  u.correo,
  u.activo,
  u.ultimo_acceso,
  u.creacion,
  STRING_AGG(DISTINCT r.nombre, ', ' ORDER BY r.nombre) as roles
FROM usuario u
LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
LEFT JOIN rol r ON r.id_rol = ur.id_rol AND r.activo = TRUE
GROUP BY u.id_usuario, u.nombre, u.correo, u.activo, u.ultimo_acceso, u.creacion;

-- Crear índices para mejorar la performance de las queries
CREATE INDEX IF NOT EXISTS idx_mv_usuarios_activo 
  ON v_usuarios_consolidado (activo);

CREATE INDEX IF NOT EXISTS idx_mv_usuarios_correo 
  ON v_usuarios_consolidado (correo);

CREATE INDEX IF NOT EXISTS idx_mv_usuarios_creacion 
  ON v_usuarios_consolidado (creacion DESC);

CREATE INDEX IF NOT EXISTS idx_mv_usuarios_roles 
  ON v_usuarios_consolidado USING GIN (to_tsvector('spanish', roles));
