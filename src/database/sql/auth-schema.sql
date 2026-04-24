CREATE OR REPLACE FUNCTION update_actualizacion_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(32) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_correo_unique_idx
  ON usuarios ((LOWER(correo)));

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(32) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios_roles (
  id_usuario VARCHAR(32) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_rol VARCHAR(32) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (id_usuario, id_rol)
);

DROP TRIGGER IF EXISTS usuarios_set_actualizacion ON usuarios;
CREATE TRIGGER usuarios_set_actualizacion
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_actualizacion_column();

DROP TRIGGER IF EXISTS roles_set_actualizacion ON roles;
CREATE TRIGGER roles_set_actualizacion
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION update_actualizacion_column();