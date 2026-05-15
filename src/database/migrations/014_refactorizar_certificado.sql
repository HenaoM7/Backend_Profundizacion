ALTER TABLE certificado
  ADD COLUMN IF NOT EXISTS codigo_verificacion UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS html_renderizado    TEXT;

UPDATE certificado SET codigo_verificacion = gen_random_uuid() WHERE codigo_verificacion IS NULL;

ALTER TABLE certificado ALTER COLUMN codigo_verificacion SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'certificado' AND indexname = 'uq_cert_codigo_verificacion'
  ) THEN
    CREATE UNIQUE INDEX uq_cert_codigo_verificacion ON certificado(codigo_verificacion);
  END IF;
END $$;

ALTER TABLE certificado DROP CONSTRAINT IF EXISTS certificado_id_maestro_documento_fkey;
ALTER TABLE certificado DROP CONSTRAINT IF EXISTS fk_cert_maestro_documento;

ALTER TABLE certificado DROP COLUMN IF EXISTS id_maestro_documento;
ALTER TABLE certificado DROP COLUMN IF EXISTS imagen_url;
