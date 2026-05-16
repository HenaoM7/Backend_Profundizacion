-- Renombrar tablas
ALTER TABLE grades       RENAME TO notas;
ALTER TABLE certificates RENAME TO certificados;

-- Renombrar columnas: notas
ALTER TABLE notas RENAME COLUMN user_id    TO usuario_id;
ALTER TABLE notas RENAME COLUMN course_id  TO curso_id;
ALTER TABLE notas RENAME COLUMN module_id  TO modulo_id;
ALTER TABLE notas RENAME COLUMN score      TO calificacion;
ALTER TABLE notas RENAME COLUMN created_at TO creado_en;

-- Renombrar columnas: certificados
ALTER TABLE certificados RENAME COLUMN user_id    TO usuario_id;
ALTER TABLE certificados RENAME COLUMN course_id  TO curso_id;
ALTER TABLE certificados RENAME COLUMN issued_at  TO emitido_en;

-- Renombrar índices: notas
ALTER INDEX idx_grades_user_id    RENAME TO idx_notas_usuario_id;
ALTER INDEX idx_grades_course_id  RENAME TO idx_notas_curso_id;
ALTER INDEX idx_grades_user_course RENAME TO idx_notas_usuario_curso;

-- Renombrar índices: certificados
ALTER INDEX idx_certificates_user_id RENAME TO idx_certificados_usuario_id;

-- Renombrar constraint de unicidad
ALTER TABLE certificados
  RENAME CONSTRAINT uq_cert_user_course TO uq_cert_usuario_curso;
