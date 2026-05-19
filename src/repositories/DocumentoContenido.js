import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/db.js';

/**
 * Modelo: DocumentoContenido
 * Tabla:  documento_contenido
 *
 * Columnas:
 *   id_documento_contenido  uuid        PK  NOT NULL
 *   id_contenido            uuid        FK  NOT NULL
 *   id_maestro_documento    uuid        FK  NOT NULL  → maestro_documento
 *   id_usuario              uuid        FK  NOT NULL
 *   esdescargable           bool            NOT NULL  default false
 *   descripcion_documento   varchar         nullable
 */
class DocumentoContenido {
  constructor(data = {}) {
    this.id_documento_contenido = data.id_documento_contenido || uuidv4();
    this.id_contenido           = data.id_contenido           || null;
    this.id_maestro_documento   = data.id_maestro_documento;
    this.id_usuario             = data.id_usuario             || null;
    this.esdescargable          = data.esdescargable !== undefined ? data.esdescargable : false;
    this.descripcion_documento  = data.descripcion_documento  || null;
  }

  // ----------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------
  async insert() {
    const sql = `
      INSERT INTO documento_contenido (
        id_documento_contenido,
        id_contenido,
        id_maestro_documento,
        id_usuario,
        esdescargable,
        descripcion_documento
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      this.id_documento_contenido,
      this.id_contenido,
      this.id_maestro_documento,
      this.id_usuario,
      this.esdescargable,
      this.descripcion_documento,
    ];

    const { rows } = await query(sql, values);
    return DocumentoContenido.fromRow(rows[0]);
  }

  // ----------------------------------------------------------------
  // READ
  // ----------------------------------------------------------------
  static async findById(id) {
    const { rows } = await query(
      `SELECT dc.*, md.numero_documento, md.ruta_documento,
              md.extension, md.tamanno, md.activo, md.fecha_creacion
         FROM documento_contenido dc
         JOIN maestro_documento md
           ON md.id_maestro_documento = dc.id_maestro_documento
        WHERE dc.id_documento_contenido = $1`,
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  static async findByMaestro(idMaestroDocumento) {
    const { rows } = await query(
      `SELECT * FROM documento_contenido
        WHERE id_maestro_documento = $1`,
      [idMaestroDocumento]
    );
    return rows.map(DocumentoContenido.fromRow);
  }

  static async findByUsuario(idUsuario) {
    const { rows } = await query(
      `SELECT dc.*, md.numero_documento, md.ruta_documento,
              md.extension, md.tamanno, md.fecha_creacion
         FROM documento_contenido dc
         JOIN maestro_documento md
           ON md.id_maestro_documento = dc.id_maestro_documento
        WHERE dc.id_usuario = $1
          AND md.activo = true
        ORDER BY md.fecha_creacion DESC`,
      [idUsuario]
    );
    return rows;
  }

  // ----------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------
  async update() {
    const sql = `
      UPDATE documento_contenido SET
        id_contenido          = $1,
        id_maestro_documento  = $2,
        id_usuario            = $3,
        esdescargable         = $4,
        descripcion_documento = $5
      WHERE id_documento_contenido = $6
      RETURNING *;
    `;

    const values = [
      this.id_contenido,
      this.id_maestro_documento,
      this.id_usuario,
      this.esdescargable,
      this.descripcion_documento,
      this.id_documento_contenido,
    ];

    const { rows } = await query(sql, values);
    return DocumentoContenido.fromRow(rows[0]);
  }

  // ----------------------------------------------------------------
  // DELETE físico
  // ----------------------------------------------------------------
  static async delete(id) {
    const { rowCount } = await query(
      'DELETE FROM documento_contenido WHERE id_documento_contenido = $1',
      [id]
    );
    return rowCount > 0;
  }

  static async deleteByMaestro(idMaestroDocumento) {
    const { rowCount } = await query(
      'DELETE FROM documento_contenido WHERE id_maestro_documento = $1',
      [idMaestroDocumento]
    );
    return rowCount > 0;
  }

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------
  static fromRow(row) {
    return new DocumentoContenido({
      id_documento_contenido : row.id_documento_contenido,
      id_contenido           : row.id_contenido,
      id_maestro_documento   : row.id_maestro_documento,
      id_usuario             : row.id_usuario,
      esdescargable          : row.esdescargable,
      descripcion_documento  : row.descripcion_documento,
    });
  }

  toJSON() {
    return {
      id_documento_contenido : this.id_documento_contenido,
      id_contenido           : this.id_contenido,
      id_maestro_documento   : this.id_maestro_documento,
      id_usuario             : this.id_usuario,
      esdescargable          : this.esdescargable,
      descripcion_documento  : this.descripcion_documento,
    };
  }
}

export default DocumentoContenido;
