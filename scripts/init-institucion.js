import pool from '../src/database/db.js';

// UUID fija para la institución única
const INSTITUCION_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * Script para inicializar la tabla de institución
 * Ejecuta el schema SQL de institución
 */
async function initInstitucion() {
  const client = await pool.connect();

  try {
    console.log('🔧 Inicializando tabla de institución...');

    // Crear la tabla y el trigger
    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracion_tema (
        id_configuracion_tema UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        url_logo TEXT,
        color_primario VARCHAR(7),
        color_secundario VARCHAR(7),
        color_muted VARCHAR(7),
        color_fondo VARCHAR(7),
        texto_primario VARCHAR(7),
        texto_secundario VARCHAR(7),
        texto_muted VARCHAR(7),
        color_borde VARCHAR(7),
        color_input VARCHAR(7),
        creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Crear la función del trigger
    await client.query(`
      CREATE OR REPLACE FUNCTION update_configuracion_tema_actualizado_en_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.actualizado_en = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Crear el trigger
    await client.query(`
      DROP TRIGGER IF EXISTS configuracion_tema_set_actualizado_en ON configuracion_tema;
      CREATE TRIGGER configuracion_tema_set_actualizado_en
      BEFORE UPDATE ON configuracion_tema
      FOR EACH ROW
      EXECUTE FUNCTION update_configuracion_tema_actualizado_en_column();
    `);

    // Insertar la institución única si no existe
    await client.query(`
      INSERT INTO configuracion_tema (id_configuracion_tema, nombre, url_logo, color_primario, color_secundario, color_muted, color_fondo, texto_primario, texto_secundario, texto_muted, color_borde, color_input)
      VALUES ($1, 'IUSH Principal', NULL, '#1E40AF', '#0891B2', '#AEEDF2', '#F8FAFC', '#0F172A', '#475569', '#94A3B8', '#E2E8F0', '#FFFFFF')
      ON CONFLICT (id_configuracion_tema) DO NOTHING;
    `, [INSTITUCION_ID]);

    const result = await client.query('SELECT * FROM configuracion_tema WHERE id_configuracion_tema = $1', [INSTITUCION_ID]);
    console.log('✅ Tabla de institución inicializada correctamente.');
    console.log('📋 Registro:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error inicializando institución:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar
initInstitucion()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
