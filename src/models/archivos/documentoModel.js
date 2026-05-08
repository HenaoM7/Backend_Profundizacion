import { query } from '../../database/db.js';

class DocumentoModel {

  // Obtener todos los documentos
  static async getAll() {
    const sql = `
      SELECT id, nombre, drive_id, mime_type, tamanio, carpeta_id, creado_en
      FROM documentos
      WHERE activo = true
      ORDER BY creado_en DESC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Obtener documento por ID interno (PostgreSQL)
  static async getById(id) {
    const sql = `
      SELECT id, nombre, drive_id, mime_type, tamanio, carpeta_id, creado_en
      FROM documentos
      WHERE id = $1 AND activo = true
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Obtener documento por drive_id
  static async getByDriveId(driveId) {
    const sql = `
      SELECT id, nombre, drive_id, mime_type, tamanio, carpeta_id, creado_en
      FROM documentos
      WHERE drive_id = $1 AND activo = true
    `;
    const result = await query(sql, [driveId]);
    return result.rows[0] || null;
  }

  // Guardar registro de documento nuevo
  static async create({ nombre, driveId, mimeType, tamanio, carpetaId }) {
    const sql = `
      INSERT INTO documentos (nombre, drive_id, mime_type, tamanio, carpeta_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, drive_id, creado_en
    `;
    const result = await query(sql, [nombre, driveId, mimeType, tamanio, carpetaId]);
    return result.rows[0];
  }

  // Eliminar (soft delete)
  static async delete(id) {
    const sql = `
      UPDATE documentos SET activo = false
      WHERE id = $1
      RETURNING id
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Buscar por nombre
  static async search(termino) {
    const sql = `
      SELECT id, nombre, drive_id, mime_type, tamanio, creado_en
      FROM documentos
      WHERE activo = true AND nombre ILIKE $1
      ORDER BY nombre
    `;
    const result = await query(sql, [`%${termino}%`]);
    return result.rows;
  }
}

export default DocumentoModel;