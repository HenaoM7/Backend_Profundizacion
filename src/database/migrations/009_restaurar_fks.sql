-- =============================================
-- Restaurar FKs perdidas cuando otros equipos
-- eliminaron y recrearon las tablas evaluacion
-- y opcion_evaluacion.
-- Nota: NO se agregan FKs a la tabla usuario
-- porque usa varchar IDs ('USR001') incompatible
-- con el sistema UUID que usa el proyecto general.
-- Idempotente: bloques DO verifican existencia.
-- =============================================

-- nota.id_evaluacion → evaluacion
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_nota_evaluacion'
  ) THEN
    ALTER TABLE nota ADD CONSTRAINT fk_nota_evaluacion
      FOREIGN KEY (id_evaluacion) REFERENCES evaluacion(id_evaluacion);
  END IF;
END $$;

-- respuesta_usuario.id_evaluacion → evaluacion
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_respuesta_evaluacion'
  ) THEN
    ALTER TABLE respuesta_usuario ADD CONSTRAINT fk_respuesta_evaluacion
      FOREIGN KEY (id_evaluacion) REFERENCES evaluacion(id_evaluacion);
  END IF;
END $$;

-- respuesta_usuario.id_opcion → opcion_evaluacion
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_respuesta_opcion'
  ) THEN
    ALTER TABLE respuesta_usuario ADD CONSTRAINT fk_respuesta_opcion
      FOREIGN KEY (id_opcion) REFERENCES opcion_evaluacion(id_opcion);
  END IF;
END $$;

-- UNIQUE (id_evaluacion, id_usuario) en respuesta_usuario
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'uq_respuesta_usuario_evaluacion'
  ) THEN
    ALTER TABLE respuesta_usuario
      ADD CONSTRAINT uq_respuesta_usuario_evaluacion
      UNIQUE (id_evaluacion, id_usuario);
  END IF;
END $$;
