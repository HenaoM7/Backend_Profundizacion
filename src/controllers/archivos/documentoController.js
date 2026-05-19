import path from 'path';
import localFileService from '../../services/archivos/localFileService.js';
import MaestroDocumento from '../../repositories/MaestroDocumento.js';
import DocumentoContenido from '../../repositories/DocumentoContenido.js';
import { getClient } from '../../database/db.js';

class DocumentoController {

    // ------------------------------------------------------------------
    // GET /api/documentos?carpeta=documentos
    // Lista archivos del sistema de archivos local
    // ------------------------------------------------------------------
    async listar(req, res) {
        try {
            const { carpeta = 'documentos' } = req.query;
            const archivos = await localFileService.listarArchivos(carpeta);

            res.json({
                success : true,
                data    : archivos,
                total   : archivos.length,
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // ------------------------------------------------------------------
    // GET /api/documentos/:id
    // Busca el documento por id_documento_contenido en BD y retorna metadata
    // ------------------------------------------------------------------
    async obtener(req, res) {
        try {
            const { id } = req.params;

            // Busca en BD (JOIN con maestro_documento)
            const documento = await DocumentoContenido.findById(id);

            if (!documento) {
                return res.status(404).json({
                    success : false,
                    error   : 'Documento no encontrado',
                });
            }

            res.json({ success: true, data: documento });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // ------------------------------------------------------------------
    // GET /api/documentos/:id/descargar
    // Busca el documento en BD por id_documento_contenido y lo descarga
    // ------------------------------------------------------------------
    async descargar(req, res) {
        try {
            const { id } = req.params;

            // 1. Buscar en BD para obtener la ruta_documento
            const documento = await DocumentoContenido.findById(id);

            if (!documento) {
                return res.status(404).json({
                    success : false,
                    error   : 'Documento no encontrado en base de datos',
                });
            }

            // 2. ruta_documento tiene el formato: "documentos/timestamp_nombre.ext"
            //    que es exactamente el fileId que espera localFileService
            const fileId = documento.ruta_documento;
            await localFileService.descargarArchivo(fileId, res);

        } catch (error) {
            if (!res.headersSent) {
                res.status(error.status || 500).json({
                    success : false,
                    error   : error.message,
                });
            }
        }
    }

    // ------------------------------------------------------------------
    // POST /api/documentos
    // Sube el archivo, crea registro en maestro_documento y documento_contenido
    // Body multipart/form-data:
    //   archivo           → file (requerido)
    //   carpeta           → string  (default: "documentos")
    //   id_tipo_documento → uuid    (opcional)
    //   id_contenido      → uuid    (opcional)
    //   id_usuario        → uuid    (opcional)
    //   esdescargable     → boolean (default: false)
    //   descripcion       → string  (opcional)
    // ------------------------------------------------------------------
    async subir(req, res) {
        // Usamos una transacción para garantizar consistencia
        const client = await getClient();

        try {
            if (!req.file) {
                return res.status(400).json({
                    success : false,
                    error   : 'No se envió ningún archivo',
                });
            }

            const { originalname, mimetype, buffer, size } = req.file;
            const {
                carpeta           = 'documentos',
                id_tipo_documento = null,
                id_contenido      = null,
                id_usuario        = null,
                esdescargable     = false,
                descripcion       = null,
            } = req.body;

            // --- Extraer extensión del archivo original ---
            const extension = path.extname(originalname).toLowerCase(); // ej: ".pdf"

            // --- 1. Generar el UUID del maestro antes de subir ---
            //        para usarlo en la ruta_documento
            const idMaestro = crypto.randomUUID
                ? crypto.randomUUID()
                : (await import('uuid')).v4();

            // --- 2. Subir archivo al sistema local ---
            //        El servicio devuelve id = "documentos/timestamp_nombre.pdf"
            const archivoLocal = await localFileService.subirArchivo({
                nombre   : originalname,
                mimeType : mimetype,
                buffer,
                carpeta,
            });

            // --- 3. Construir ruta_documento = uuid_maestro/carpeta/timestamp_nombre ---
            //        Esto permite localizar el archivo vinculado al registro
            const rutaDocumento = `${idMaestro}/${archivoLocal.id}`;

            await client.query('BEGIN');

            // --- 4. Insertar en maestro_documento ---
            const maestro = new MaestroDocumento({
                id_maestro_documento : idMaestro,
                numero_documento     : originalname,          // nombre del archivo
                id_tipo_documento,
                ruta_documento       : rutaDocumento,         // uuid_maestro/ruta_local
                tamanno              : size ?? archivoLocal.size,
                extension,
                activo               : true,
            });

            const { rows: rowsMaestro } = await client.query(
                `INSERT INTO maestro_documento
           (id_maestro_documento, numero_documento, id_tipo_documento,
            ruta_documento, fecha_creacion, activo, tamanno, extension)
         VALUES ($1,$2,$3,$4,NOW(),$5,$6,$7)
         RETURNING *`,
                [
                    maestro.id_maestro_documento,
                    maestro.numero_documento,
                    maestro.id_tipo_documento,
                    maestro.ruta_documento,
                    maestro.activo,
                    maestro.tamanno,
                    maestro.extension,
                ]
            );

            // --- 5. Insertar en documento_contenido ---
            const contenido = new DocumentoContenido({
                id_contenido        : id_contenido,
                id_maestro_documento: idMaestro,
                id_usuario,
                esdescargable       : esdescargable === 'true' || esdescargable === true,
                descripcion_documento: descripcion,
            });

            const { rows: rowsContenido } = await client.query(
                `INSERT INTO documento_contenido
           (id_documento_contenido, id_contenido, id_maestro_documento,
            id_usuario, esdescargable, descripcion_documento)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
                [
                    contenido.id_documento_contenido,
                    contenido.id_contenido,
                    contenido.id_maestro_documento,
                    contenido.id_usuario,
                    contenido.esdescargable,
                    contenido.descripcion_documento,
                ]
            );

            await client.query('COMMIT');

            res.status(201).json({
                success  : true,
                data     : {
                    archivo          : archivoLocal,
                    maestroDocumento : rowsMaestro[0],
                    contenido        : rowsContenido[0],
                },
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error subiendo documento:', error.message);
            res.status(500).json({ success: false, error: error.message });
        } finally {
            client.release();
        }
    }

    // ------------------------------------------------------------------
    // DELETE /api/documentos/:id
    // Elimina físicamente el archivo y hace soft-delete en BD
    // id = id_documento_contenido
    // ------------------------------------------------------------------
    async eliminar(req, res) {
        const client = await getClient();

        try {
            const { id } = req.params;

            // 1. Buscar el documento en BD
            const documento = await DocumentoContenido.findById(id);

            if (!documento) {
                return res.status(404).json({
                    success : false,
                    error   : 'Documento no encontrado',
                });
            }

            await client.query('BEGIN');

            // 2. Eliminar registro de documento_contenido
            await client.query(
                'DELETE FROM documento_contenido WHERE id_documento_contenido = $1',
                [id]
            );

            // 3. Soft-delete en maestro_documento
            await client.query(
                `UPDATE maestro_documento
            SET activo = false, fecha_modifica = NOW()
          WHERE id_maestro_documento = $1`,
                [documento.id_maestro_documento]
            );

            await client.query('COMMIT');

            // 4. Eliminar archivo físico
            //    ruta_documento = "uuid_maestro/documentos/timestamp_nombre.pdf"
            //    El fileId para el servicio es la parte después del primer "/"
            const fileId = documento.ruta_documento.split('/').slice(1).join('/');
            try {
                await localFileService.eliminarArchivo(fileId);
            } catch (fsError) {
                // El archivo puede ya no existir; se registra pero no falla la respuesta
                console.warn('Aviso: no se pudo eliminar el archivo físico:', fsError.message);
            }

            res.json({
                success : true,
                mensaje : 'Documento eliminado correctamente',
            });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(error.status || 500).json({
                success : false,
                error   : error.message,
            });
        } finally {
            client.release();
        }
    }
}

export default new DocumentoController();
