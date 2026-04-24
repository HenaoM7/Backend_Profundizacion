import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pool, { query } from '../src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDatabase = async () => {
  const filePath = path.join(__dirname, '..', 'src', 'database', 'sql', 'auth-schema.sql');
  const sql = await readFile(filePath, 'utf8');

  await query(sql);
  console.log('Esquema de autenticacion creado o actualizado correctamente.');
};

initDatabase()
  .catch((error) => {
    console.error('No fue posible inicializar el esquema de autenticacion.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });