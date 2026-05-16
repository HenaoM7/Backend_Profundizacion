-- Renombrar PK y columnas en notas
ALTER TABLE notas RENAME COLUMN id_notas   TO id_nota;
ALTER TABLE notas RENAME COLUMN usuario_id TO id_usuario;
ALTER TABLE notas RENAME COLUMN curso_id   TO id_curso;
ALTER TABLE notas RENAME COLUMN modulo_id  TO id_modulo;

-- Renombrar PK y columnas en certificados
ALTER TABLE certificados RENAME COLUMN id_certificados TO id_certificado;
ALTER TABLE certificados RENAME COLUMN usuario_id      TO id_usuario;
ALTER TABLE certificados RENAME COLUMN curso_id        TO id_curso;

-- Renombrar tablas a singular
ALTER TABLE notas        RENAME TO nota;
ALTER TABLE certificados RENAME TO certificado;
