import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/db.js';

/**
 * Repository: MaestroDocumento
 * Tabla: maestro_documento
 *
 * Columnas:
 *   id_maestro_documento  uuid         PK  NOT NULL  default gen_random_uuid()
 *   numero_documento      varchar(20)      NOT NULL  → nombre original del archivo
 *   id_tipo_documento     uuid         FK  NOT NULL  → tipo_documento (define la extensión)
 *   ruta_documento        varchar(100)     NOT NULL  → fileId: "documentos/timestamp_nombre.pdf"
 *   fecha_creacion        timestamp        NOT NULL  default CURRENT_TIMESTAMP
 *   fecha_modifica        timestamp        nullable
 *   activo                bool             NOT NULL  default true
 *   tamanno               int4             NOT NULL  → bytes del archivo
 */
class MaestroDocumento {
  /**
   * @param {object} data
   * @param {string}  [data.id_maestro_documento]
   * @param {string}   data.numero_documento     - nombre original del archivo
   * @param {string}   data.id_tipo_documento    - FK tipo_documento (obligatorio)
   * @param {string}   data.ruta_documento       - "documentos/timestamp_nombre.pdf"
   * @param {Date}    [data.fecha_creacion]
   * @param {Date}    [data.fecha_modifica]
   * @param {boolean} [data.activo]
   * @param {number}   data.tamanno              - tamaño en bytes (obligatorio)
   */
  constructor(data = {}) {
    this.id_maestro_documento = data.id_maestro_documento || uuidv4();
    this.numero_documento     = data.numero_documento;
    this.id_tipo_documento    = data.id_tipo_documento;
    this.ruta_documento       = data.ruta_documento;
    this.fecha_creacion       = data.fecha_creacion || new Date();
    this.fecha_modifica       = data.fecha_modifica || null;
    this.activo               = data.activo !== undefined ? data.activo : true;
    this.tamanno              = data.tamanno;
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
        tamanno
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
    ];
    const { rows } = await query(sql, values);
    return MaestroDocumento.fromRow(rows[0]);
  }

  // ----------------------------------------------------------------
  // READ
  // ----------------------------------------------------------------

  /**
   * Busca por PK con JOIN a tipo_documento para obtener la extensión.
   * ruta_documento es el fileId listo para usar en localFileService.
   */
  static async findById(id) {
    const { rows } = await query(
        `SELECT
          md.id_maestro_documento,
          md.numero_documento,
          md.id_tipo_documento,
          md.ruta_documento,
          md.fecha_creacion,
          md.fecha_modifica,
          md.activo,
          md.tamanno,
          td.nombre AS tipo_extension
       FROM maestro_documento md
       LEFT JOIN tipo_documento td
         ON td.id_tipo_documento = md.id_tipo_documento
       WHERE md.id_maestro_documento = $1`,
        [id]
    );
    return rows.length ? rows[0] : null;
  }

  static async findAllActive() {
    const { rows } = await query(
        `SELECT
          md.id_maestro_documento,
          md.numero_documento,
          md.id_tipo_documento,
          md.ruta_documento,
          md.fecha_creacion,
          md.fecha_modifica,
          md.activo,
          md.tamanno,
          td.nombre AS tipo_extension
       FROM maestro_documento md
       LEFT JOIN tipo_documento td
         ON td.id_tipo_documento = md.id_tipo_documento
       WHERE md.activo = true
       ORDER BY md.fecha_creacion DESC`
    );
    return rows;
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
        tamanno           = $6
      WHERE id_maestro_documento = $7
      RETURNING *;
    `;
    const values = [
      this.numero_documento,
      this.id_tipo_documento,
      this.ruta_documento,
      this.fecha_modifica,
      this.activo,
      this.tamanno,
      this.id_maestro_documento,
    ];
    const { rows } = await query(sql, values);
    return MaestroDocumento.fromRow(rows[0]);
  }

  // ----------------------------------------------------------------
  // DELETE lógico
  // ----------------------------------------------------------------
  static async delete(id) {
    const { rowCount } = await query(
        'DELETE FROM maestro_documento WHERE id_maestro_documento = $1',
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
    };
  }
}

export default MaestroDocumento;