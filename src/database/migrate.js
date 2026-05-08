import { readFile, readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname  = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = join(__dirname, 'migrations');

const run = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migraciones (
      nombre      VARCHAR(255) PRIMARY KEY,
      aplicada_en TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);

  const archivos = (await readdir(MIGRATIONS))
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const archivo of archivos) {
    const { rows } = await pool.query(
      'SELECT nombre FROM _migraciones WHERE nombre = $1',
      [archivo]
    );

    if (rows.length) {
      console.log(`⏭  ${archivo} ya aplicada.`);
      continue;
    }

    const sql = await readFile(join(MIGRATIONS, archivo), 'utf8');
    await pool.query(sql);
    await pool.query('INSERT INTO _migraciones (nombre) VALUES ($1)', [archivo]);
    console.log(`✅ ${archivo} aplicada.`);
  }
};

run()
  .then(() => { console.log('Migraciones completadas.'); process.exit(0); })
  .catch(err  => { console.error('❌', err.message);       process.exit(1); });
