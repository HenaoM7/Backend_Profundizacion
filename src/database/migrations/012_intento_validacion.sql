CREATE TABLE IF NOT EXISTS intento_validacion (
  id_intento    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_contenido  UUID        NOT NULL REFERENCES contenido(id_contenido),
  id_usuario    UUID        NOT NULL,
  respuesta     BOOLEAN     NOT NULL,
  fue_correcto  BOOLEAN     NOT NULL,
  intentado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_intento_contenido          ON intento_validacion(id_contenido);
CREATE INDEX IF NOT EXISTS idx_intento_usuario            ON intento_validacion(id_usuario);
CREATE INDEX IF NOT EXISTS idx_intento_contenido_correcto ON intento_validacion(id_contenido, fue_correcto);
