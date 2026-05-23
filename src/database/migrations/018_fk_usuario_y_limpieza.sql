-- Eliminar registros huérfanos cuyo id_usuario no existe en usuario.
-- Estos surgieron de tokens de prueba con UUIDs inventados. Se purgan
-- antes de agregar las FK para que la constraint pase la validación.

DELETE FROM intento_validacion
  WHERE id_usuario NOT IN (SELECT id_usuario FROM usuario);

DELETE FROM progreso_estudiante
  WHERE id_usuario NOT IN (SELECT id_usuario FROM usuario);

DELETE FROM progreso_curso
  WHERE id_usuario NOT IN (SELECT id_usuario FROM usuario);

DELETE FROM certificado
  WHERE id_usuario NOT IN (SELECT id_usuario FROM usuario);

-- FK progreso_estudiante → usuario
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_progreso_est_usuario'
  ) THEN
    ALTER TABLE progreso_estudiante
      ADD CONSTRAINT fk_progreso_est_usuario
      FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);
  END IF;
END $$;

-- FK progreso_curso → usuario
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_progreso_curso_usuario'
  ) THEN
    ALTER TABLE progreso_curso
      ADD CONSTRAINT fk_progreso_curso_usuario
      FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);
  END IF;
END $$;

-- FK certificado → usuario
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_cert_usuario'
  ) THEN
    ALTER TABLE certificado
      ADD CONSTRAINT fk_cert_usuario
      FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);
  END IF;
END $$;

-- intento_validacion.id_usuario NO lleva FK: es tabla de historial/auditoría.
-- Si un usuario es eliminado sus intentos se conservan para estadísticas.
