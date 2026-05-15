-- =============================================
-- certificado: registro de descarga
-- =============================================
ALTER TABLE certificado
  ADD COLUMN IF NOT EXISTS descargado    BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS descargado_en TIMESTAMPTZ;

-- =============================================
-- nota: número de intento por estudiante/módulo
-- =============================================
ALTER TABLE nota
  ADD COLUMN IF NOT EXISTS numero_intento INTEGER NOT NULL DEFAULT 1;
