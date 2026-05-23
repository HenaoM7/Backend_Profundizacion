CREATE TABLE IF NOT EXISTS plantilla_certificado (
  id_plantilla  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_curso      UUID        NOT NULL UNIQUE REFERENCES curso(id_curso),
  html_template TEXT        NOT NULL,
  activo        BOOLEAN     NOT NULL DEFAULT true,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_plantilla_curso ON plantilla_certificado(id_curso);
