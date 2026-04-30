-- Tabla de configuración visual de la institución
CREATE TABLE IF NOT EXISTS institucion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  tertiary_color VARCHAR(7),
  background_color VARCHAR(7),
  text_primary VARCHAR(7),
  text_secondary VARCHAR(7),
  text_tertiary VARCHAR(7),
  border_color VARCHAR(7),
  input_color VARCHAR(7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar el timestamp de actualizacion
CREATE OR REPLACE FUNCTION update_institucion_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS institucion_set_updated_at ON institucion;
CREATE TRIGGER institucion_set_updated_at
BEFORE UPDATE ON institucion
FOR EACH ROW
EXECUTE FUNCTION update_institucion_updated_at_column();

-- Insertar la institución única si no existe
INSERT INTO institucion (id, name, logo_url, primary_color, secondary_color, tertiary_color, background_color, text_primary, text_secondary, text_tertiary, border_color, input_color)
VALUES ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'IUSH Principal', NULL, '#1E40AF', '#0891B2', '#AEEDF2', '#F8FAFC', '#0F172A', '#475569', '#94A3B8', '#E2E8F0', '#FFFFFF')
ON CONFLICT (id) DO NOTHING;
