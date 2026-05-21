-- Agregar id_modulo a progreso_estudiante para permitir
-- desglose de progreso por módulo sin JOIN adicional a contenido.
-- La columna es nullable para registros históricos; nuevas inserciones
-- siempre incluirán el valor.

ALTER TABLE progreso_estudiante ADD COLUMN IF NOT EXISTS id_modulo UUID;

-- Backfill: derivar id_modulo desde contenido para registros existentes
UPDATE progreso_estudiante pe
SET id_modulo = c.id_modulo
FROM contenido c
WHERE pe.id_contenido = c.id_contenido
  AND pe.id_modulo IS NULL;

-- FK hacia modulo (idempotente)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_progreso_est_modulo'
  ) THEN
    ALTER TABLE progreso_estudiante ADD CONSTRAINT fk_progreso_est_modulo
      FOREIGN KEY (id_modulo) REFERENCES modulo(id_modulo);
  END IF;
END $$;

-- Índice para acelerar queries de progreso por módulo
CREATE INDEX IF NOT EXISTS idx_progreso_est_modulo ON progreso_estudiante(id_modulo);
