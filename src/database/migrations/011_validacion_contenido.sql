CREATE TABLE IF NOT EXISTS validacion_contenido (
  id_validacion      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_contenido       UUID        NOT NULL UNIQUE REFERENCES contenido(id_contenido),
  pregunta           TEXT        NOT NULL,
  respuesta_correcta BOOLEAN     NOT NULL,
  activo             BOOLEAN     NOT NULL DEFAULT true,
  creado_en          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_validacion_contenido ON validacion_contenido(id_contenido);
