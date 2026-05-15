-- Se retira el FK a modulo porque la tabla la gestiona otro equipo
-- y aún no tiene datos. El campo id_modulo conserva tipo UUID.
-- Cuando modulo tenga datos se puede reactivar el constraint.
ALTER TABLE nota DROP CONSTRAINT IF EXISTS fk_nota_modulo;
