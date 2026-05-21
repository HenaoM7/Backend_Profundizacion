import { query } from '../database/db.js';

/**
 * Repository: TipoDocumento
 * Tabla: tipo_documento
 *
 * Columnas:
 *   id_tipo_documento  uuid          PK  NOT NULL  default gen_random_uuid()
 *   nombre             varchar(30)       NOT NULL  → extensión normalizada (sin punto): "pdf", "docx", etc.
 *   fecha_creacion     timestamp         NOT NULL  default CURRENT_TIMESTAMP
 *   estado             bool              NOT NULL  default true
 */
class TipoDocumento {

  /**
   * Busca el tipo_documento por extensión del archivo.
   * La extensión se normaliza: ".PDF" → "pdf"
   *
   * Si la extensión no existe en la tabla, retorna el registro "desconocido".
   *
   * @param {string} extension - Extensión con o sin punto: ".pdf" | "pdf"
   * @returns {Promise<{id_tipo_documento: string, nombre: string}>}
   */
  static async findByExtension(extension) {
    // Normalizar: quitar punto y pasar a minúsculas → "pdf"
    const nombreBuscado = extension.replace(/^\./, '').toLowerCase().trim();

    const { rows } = await query(
        `SELECT id_tipo_documento, nombre, estado
         FROM tipo_documento
        WHERE nombre = $1
          AND estado = true
        LIMIT 1`,
        [nombreBuscado]
    );

    if (rows.length) return rows[0];

    // Extensión desconocida → retornar el tipo reservado "desconocido"
    const { rows: fallback } = await query(
        `SELECT id_tipo_documento, nombre, estado
         FROM tipo_documento
        WHERE nombre = 'desconocido'
          AND estado = true
        LIMIT 1`
    );

    if (!fallback.length) {
      throw new Error(
          'No existe el tipo "desconocido" en tipo_documento. Ejecuta el seed 010_seed_tipo_documento.sql'
      );
    }

    return fallback[0];
  }

  /**
   * Retorna todos los tipos activos.
   * @returns {Promise<Array>}
   */
  static async findAll() {
    const { rows } = await query(
        `SELECT id_tipo_documento, nombre, fecha_creacion, estado
         FROM tipo_documento
        WHERE estado = true
        ORDER BY nombre`
    );
    return rows;
  }

  /**
   * Busca un tipo por su PK.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const { rows } = await query(
        'SELECT * FROM tipo_documento WHERE id_tipo_documento = $1',
        [id]
    );
    return rows.length ? rows[0] : null;
  }
}

export default TipoDocumento;