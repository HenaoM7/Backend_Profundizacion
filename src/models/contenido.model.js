// src/models/contenido.model.js
import pool from '../database/db.js';

const TIPOS_VALIDOS = ['video', 'texto', 'archivo', 'imagen'];

export const findAll = async ({ id_modulo, activo, tipo }) => {
  const values     = [id_modulo];
  const conditions = ['id_modulo = $1', 'eliminacion IS NULL'];

  if (activo !== undefined) { values.push(activo); conditions.push(`activo = $${values.length}`); }
  if (tipo)                 { values.push(tipo);   conditions.push(`tipo = $${values.length}`);   }

  const query = `
    SELECT id_contenido, id_modulo, titulo, descripcion, tipo,
           url_o_texto, orden, activo, creacion, actualizacion
    FROM contenido
    WHERE ${conditions.join(' AND ')}
    ORDER BY orden ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

export const findById = async (id_contenido) => {
  const result = await pool.query(
    `SELECT id_contenido, id_modulo, titulo, descripcion, tipo,
            url_o_texto, orden, activo, creacion, actualizacion
     FROM contenido WHERE id_contenido = $1 AND eliminacion IS NULL`,
    [id_contenido]
  );
  return result.rows[0] ?? null;
};

export const moduloExists = async (id_modulo) => {
  const result = await pool.query(
    `SELECT EXISTS (SELECT 1 FROM modulo WHERE id_modulo = $1 AND eliminacion IS NULL) AS exists`,
    [id_modulo]
  );
  return result.rows[0].exists;
};

export const ordenExists = async (id_modulo, orden, excludeId) => {
  const values = [id_modulo, orden];
  let query = `
    SELECT EXISTS (
      SELECT 1 FROM contenido
      WHERE id_modulo = $1 AND orden = $2 AND eliminacion IS NULL
  `;
  if (excludeId) {
    values.push(excludeId);
    query += ` AND id_contenido != $${values.length}`;
  }
  query += ') AS exists';
  const result = await pool.query(query, values);
  return result.rows[0].exists;
};

export const create = async ({ id_modulo, titulo, descripcion, tipo, url_o_texto, orden }) => {
  const query = `
    INSERT INTO contenido (id_modulo, titulo, descripcion, tipo, url_o_texto, orden, activo)
    VALUES ($1, $2, $3, $4, $5, $6, TRUE)
    RETURNING id_contenido, id_modulo, titulo, descripcion, tipo,
              url_o_texto, orden, activo, creacion, actualizacion
  `;
  const result = await pool.query(query, [id_modulo, titulo, descripcion ?? null, tipo, url_o_texto, orden]);
  return result.rows[0];
};

export const update = async (id_contenido, { titulo, descripcion, tipo, url_o_texto, orden, activo }) => {
  const fields = [];
  const values = [];

  if (titulo       !== undefined) { values.push(titulo);       fields.push(`titulo = $${values.length}`);       }
  if (descripcion  !== undefined) { values.push(descripcion);  fields.push(`descripcion = $${values.length}`);  }
  if (tipo         !== undefined) { values.push(tipo);         fields.push(`tipo = $${values.length}`);         }
  if (url_o_texto  !== undefined) { values.push(url_o_texto);  fields.push(`url_o_texto = $${values.length}`);  }
  if (orden        !== undefined) { values.push(orden);        fields.push(`orden = $${values.length}`);        }
  if (activo       !== undefined) { values.push(activo);       fields.push(`activo = $${values.length}`);       }

  if (fields.length === 0) return null;

  values.push(id_contenido);
  const query = `
    UPDATE contenido SET ${fields.join(', ')}
    WHERE id_contenido = $${values.length} AND eliminacion IS NULL
    RETURNING id_contenido, id_modulo, titulo, descripcion, tipo,
              url_o_texto, orden, activo, creacion, actualizacion
  `;
  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
};

export const reorder = async (id_modulo, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      await client.query(
        `UPDATE contenido SET orden = $1 WHERE id_contenido = $2 AND id_modulo = $3 AND eliminacion IS NULL`,
        [item.orden, item.id_contenido, id_modulo]
      );
    }
    const result = await client.query(
      `SELECT id_contenido, id_modulo, titulo, descripcion, tipo,
              url_o_texto, orden, activo, creacion, actualizacion
       FROM contenido WHERE id_modulo = $1 AND eliminacion IS NULL ORDER BY orden ASC`,
      [id_modulo]
    );
    await client.query('COMMIT');
    return result.rows;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const softDelete = async (id_contenido) => {
  const result = await pool.query(
    `UPDATE contenido SET eliminacion = NOW()
     WHERE id_contenido = $1 AND eliminacion IS NULL
     RETURNING id_contenido, eliminacion`,
    [id_contenido]
  );
  return result.rows[0] ?? null;
};