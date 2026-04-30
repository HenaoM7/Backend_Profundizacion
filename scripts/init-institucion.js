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
      CREATE TABLE IF NOT EXISTS institucion (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        logo_url TEXT,
        primary_color VARCHAR(7),
        secondary_color VARCHAR(7),
        background_color VARCHAR(7),
        text_primary VARCHAR(7),
        text_secondary VARCHAR(7),
        text_tertiary VARCHAR(7),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Crear la función del trigger
    await client.query(`
      CREATE OR REPLACE FUNCTION update_institucion_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Crear el trigger
    await client.query(`
      DROP TRIGGER IF EXISTS institucion_set_updated_at ON institucion;
      CREATE TRIGGER institucion_set_updated_at
      BEFORE UPDATE ON institucion
      FOR EACH ROW
      EXECUTE FUNCTION update_institucion_updated_at_column();
    `);

    // Insertar la institución única si no existe
    await client.query(`
      INSERT INTO institucion (id, name, logo_url, primary_color, secondary_color, background_color, text_primary, text_secondary, text_tertiary)
      VALUES ($1, 'IUSH Principal', NULL, '#1F2937', '#3B82F6', '#F9FAFB', '#111827', '#6B7280', '#9CA3AF')
      ON CONFLICT (id) DO NOTHING;
    `, [INSTITUCION_ID]);

    const result = await client.query('SELECT * FROM institucion WHERE id = $1', [INSTITUCION_ID]);
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
