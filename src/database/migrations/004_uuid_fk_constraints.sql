-- Limpiar datos de prueba (los IDs no son UUIDs válidos)
TRUNCATE TABLE certificado;
TRUNCATE TABLE nota;

-- =============================================
-- TABLA nota: cambiar columnas FK a tipo UUID
-- =============================================
ALTER TABLE nota
  ALTER COLUMN id_usuario TYPE UUID USING id_usuario::UUID,
  ALTER COLUMN id_curso   TYPE UUID USING id_curso::UUID,
  ALTER COLUMN id_modulo  TYPE UUID USING id_modulo::UUID;

-- =============================================
-- TABLA certificado: cambiar columnas FK a UUID
-- =============================================
ALTER TABLE certificado DROP CONSTRAINT IF EXISTS uq_cert_usuario_curso;

ALTER TABLE certificado
  ALTER COLUMN id_usuario TYPE UUID USING id_usuario::UUID,
  ALTER COLUMN id_curso   TYPE UUID USING id_curso::UUID;

ALTER TABLE certificado
  ADD CONSTRAINT uq_cert_usuario_curso UNIQUE (id_usuario, id_curso);

-- =============================================
-- FOREIGN KEY constraints — tabla nota
-- =============================================
ALTER TABLE nota
  ADD CONSTRAINT fk_nota_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  ADD CONSTRAINT fk_nota_curso   FOREIGN KEY (id_curso)   REFERENCES curso(id_curso),
  ADD CONSTRAINT fk_nota_modulo  FOREIGN KEY (id_modulo)  REFERENCES modulo(id_modulo);

-- =============================================
-- FOREIGN KEY constraints — tabla certificado
-- =============================================
ALTER TABLE certificado
  ADD CONSTRAINT fk_cert_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  ADD CONSTRAINT fk_cert_curso   FOREIGN KEY (id_curso)   REFERENCES curso(id_curso);
