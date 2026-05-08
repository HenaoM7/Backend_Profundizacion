-- Tabla de configuración visual de la institución
CREATE TABLE IF NOT EXISTS configuracion_tema (
  id_configuracion_tema UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  url_logo TEXT,
  color_primario VARCHAR(7),
  color_secundario VARCHAR(7),
  color_terciario VARCHAR(7),
  color_fondo VARCHAR(7),
  texto_primario VARCHAR(7),
  texto_secundario VARCHAR(7),
  texto_terciario VARCHAR(7),
  color_muted VARCHAR(7),
  color_borde VARCHAR(7),
  color_input VARCHAR(7),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar el timestamp de actualizacion
CREATE OR REPLACE FUNCTION update_configuracion_tema_actualizado_en_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS configuracion_tema_set_actualizado_en ON configuracion_tema;
CREATE TRIGGER configuracion_tema_set_actualizado_en
BEFORE UPDATE ON configuracion_tema
FOR EACH ROW
EXECUTE FUNCTION update_configuracion_tema_actualizado_en_column();

-- Insertar la institución única si no existe
INSERT INTO configuracion_tema (id_configuracion_tema, nombre, url_logo, color_primario, color_secundario, color_terciario, color_muted, color_fondo, texto_primario, texto_secundario, texto_terciario, color_borde, color_input)
VALUES ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'IUSH Principal', NULL, '#1E40AF', '#0891B2', '#7C3AED', '#AEEDF2', '#F8FAFC', '#0F172A', '#475569', '#64748B', '#E2E8F0', '#FFFFFF')
ON CONFLICT (id_configuracion_tema) DO NOTHING