DO $$ BEGIN IF EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_nota_evaluacion') THEN ALTER TABLE nota DROP CONSTRAINT fk_nota_evaluacion; END IF; END $$;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_respuesta_evaluacion') THEN ALTER TABLE respuesta_usuario DROP CONSTRAINT fk_respuesta_evaluacion; END IF; END $$;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_respuesta_opcion') THEN ALTER TABLE respuesta_usuario DROP CONSTRAINT fk_respuesta_opcion; END IF; END $$;
DROP TABLE IF EXISTS respuesta_usuario CASCADE;
ALTER TABLE nota DROP CONSTRAINT IF EXISTS fk_nota_usuario;
ALTER TABLE nota DROP CONSTRAINT IF EXISTS fk_nota_curso;
DROP TABLE IF EXISTS nota CASCADE;
