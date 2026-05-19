import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/db.js';

/**
 * Modelo: MaestroDocumento
 * Tabla:  maestro_documento
 *
 * Columnas:
 *   id_maestro_documento  uuid         PK  NOT NULL  default gen_random_uuid()
 *   numero_documento      varchar(20)      NOT NULL  → nombre del archivo
 *   id_tipo_documento     uuid         FK  NOT NULL
 *   ruta_documento        varchar(100)     NOT NULL  → {id_maestro}/{ruta_local}
 *   fecha_creacion        timestamp        NOT NULL  default CURRENT_TIMESTAMP
 *   fecha_modifica        timestamp        nullable
 *   activo                bool             NOT NULL  default true
 *   tamanno               int4             nullable  → bytes del archivo
 *   extension             varchar          nullable  → .pdf / .docx / etc.
 */
class MaestroDocumento {
  constructor(data = {}) {
    this.id_maestro_documento = data.id_maestro_documento || uuidv4();
    this.numero_documento     = data.numero_documento;        // nombre del archivo
    this.id_tipo_documento    = data.id_tipo_documento || null;
    this.ruta_documento       = data.ruta_documento;          // uuid + ruta local
    this.fecha_creacion       = data.fecha_creacion   || new Date();
    this.fecha_modifica       = data.fecha_modifica   || null;
    this.activo               = data.activo !== undefined ? data.activo : true;
    this.tamanno              = data.tamanno           || null;
    this.extension            = data.extension         || null;
  }

  // ----------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------
  async insert() {
    const sql = `
      INSERT INTO maestro_documento (
        id_maestro_documento,
        numero_documento,
        id_tipo_documento,
        ruta_documento,
        fecha_creacion,
        fecha_modifica,
        activo,
        tamanno,
        extension
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      this.id_maestro_documento,
      this.numero_documento,
      this.id_tipo_documento,
      this.ruta_documento,
      this.fecha_creacion,
      this.fecha_modifica,
      this.activo,
      this.tamanno,
      this.extension,
    ];

    const { rows } = await query(sql, values);
    return MaestroDocumento.fromRow(rows[0]);
  }

  // ----------------------------------------------------------------
  // READ
  // ----------------------------------------------------------------
  static async findById(id) {
    const { rows } = await query(
      'SELECT * FROM maestro_documento WHERE id_maestro_documento = $1',
      [id]
    );
    return rows.length ? MaestroDocumento.fromRow(rows[0]) : null;
  }

  static async findAllActive() {
    const { rows } = await query(
      `SELECT * FROM maestro_documento
        WHERE activo = true
        ORDER BY fecha_creacion DESC`
    );
    return rows.map(MaestroDocumento.fromRow);
  }

  // ----------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------
  async update() {
    this.fecha_modifica = new Date();

    const sql = `
      UPDATE maestro_documento SET
        numero_documento  = $1,
        id_tipo_documento = $2,
        ruta_documento    = $3,
        fecha_modifica    = $4,
        activo            = $5,
        tamanno           = $6,
        extension         = $7
      WHERE id_maestro_documento = $8
      RETURNING *;
    `;

    const values = [
      this.numero_documento,
      this.id_tipo_documento,
      this.ruta_documento,
      this.fecha_modifica,
      this.activo,
      this.tamanno,
      this.extension,
      this.id_maestro_documento,
    ];

    const { rows } = await query(sql, values);
    return MaestroDocumento.fromRow(rows[0]);
  }

  // ----------------------------------------------------------------
  // DELETE lógico
  // ----------------------------------------------------------------
  static async softDelete(id) {
    const { rowCount } = await query(
      `UPDATE maestro_documento
          SET activo = false, fecha_modifica = NOW()
        WHERE id_maestro_documento = $1`,
      [id]
    );
    return rowCount > 0;
  }

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------
  static fromRow(row) {
    return new MaestroDocumento({
      id_maestro_documento : row.id_maestro_documento,
      numero_documento     : row.numero_documento,
      id_tipo_documento    : row.id_tipo_documento,
      ruta_documento       : row.ruta_documento,
      fecha_creacion       : row.fecha_creacion,
      fecha_modifica       : row.fecha_modifica,
      activo               : row.activo,
      tamanno              : row.tamanno,
      extension            : row.extension,
    });
  }

  toJSON() {
    return {
      id_maestro_documento : this.id_maestro_documento,
      numero_documento     : this.numero_documento,
      id_tipo_documento    : this.id_tipo_documento,
      ruta_documento       : this.ruta_documento,
      fecha_creacion       : this.fecha_creacion,
      fecha_modifica       : this.fecha_modifica,
      activo               : this.activo,
      tamanno              : this.tamanno,
      extension            : this.extension,
    };
  }
}

export default MaestroDocumento;
