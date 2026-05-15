-- =============================================
-- Tabla de respuestas del estudiante
-- =============================================
CREATE TABLE IF NOT EXISTS respuesta_usuario (
  id_respuesta   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_evaluacion  INTEGER     NOT NULL REFERENCES evaluacion(id_evaluacion),
  id_usuario     UUID        NOT NULL REFERENCES usuario(id_usuario),
  id_opcion      INTEGER     NOT NULL REFERENCES opcion_evaluacion(id_opcion),
  respondido_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_respuesta_usuario_evaluacion UNIQUE (id_evaluacion, id_usuario)
);

CREATE INDEX IF NOT EXISTS idx_respuesta_usuario  ON respuesta_usuario(id_usuario);
CREATE INDEX IF NOT EXISTS idx_respuesta_evaluacion ON respuesta_usuario(id_evaluacion);

-- =============================================
-- nota: referencia opcional a la evaluacion que la generó
-- =============================================
ALTER TABLE nota
  ADD COLUMN IF NOT EXISTS id_evaluacion INTEGER REFERENCES evaluacion(id_evaluacion);

-- =============================================
-- certificado: referencia al documento generado
-- =============================================
ALTER TABLE certificado
  ADD COLUMN IF NOT EXISTS id_maestro_documento INTEGER REFERENCES maestro_documento(id_maestro_documento);
