import path from 'path';
import { randomUUID } from 'crypto';
import localFileService from '../../services/archivos/localFileService.js';
import MaestroDocumento from '../../repositories/MaestroDocumento.js';
import TipoDocumento from '../../repositories/TipoDocumento.js';

class DocumentoController {

    async listar(req, res) {
        try {
            const documentos = await MaestroDocumento.findAllActive();
            res.json({ success: true, data: documentos, total: documentos.length });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async obtener(req, res) {
        try {
            const { id } = req.params;

            const documento = await MaestroDocumento.findById(id);
            if (!documento) {
                return res.status(404).json({ success: false, error: 'Documento no encontrado' });
            }

            res.json({ success: true, data: documento });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async descargar(req, res) {
        try {
            const { id } = req.params;

            const documento = await MaestroDocumento.findById(id);
            if (!documento) {
                return res.status(404).json({
                    success: false,
                    error: 'Documento no encontrado en base de datos',
                });
            }

            // ruta_documento = "documentos/1747123456789_archivo.pdf"
            // Es exactamente el fileId que usa localFileService
            await localFileService.descargarArchivo(documento.ruta_documento, res);

        } catch (error) {
            if (!res.headersSent) {
                res.status(error.status || 500).json({ success: false, error: error.message });
            }
        }
    }

    async subir(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No se envió ningún archivo' });
            }

            const { originalname, mimetype, buffer, size } = req.file;
            const { carpeta = 'documentos' } = req.body;

            // 1. Detectar extensión → "pdf" | "docx" | etc.
            const extension = path.extname(originalname); // ".pdf"

            // 2. Resolver id_tipo_documento desde la tabla
            //    Si la extensión no existe → retorna el tipo "desconocido"
            const tipoDocumento = await TipoDocumento.findByExtension(extension);

            // 3. Subir archivo → fileId = "documentos/timestamp_nombre.pdf"
            const archivoLocal = await localFileService.subirArchivo({
                nombre  : originalname,
                mimeType: mimetype,
                buffer,
                carpeta,
            });

            // 4. Insertar en maestro_documento
            //    ruta_documento = fileId devuelto por el servicio (sin prefijos extra)
            const maestro = new MaestroDocumento({
                id_maestro_documento : randomUUID(),
                numero_documento     : originalname,
                id_tipo_documento    : tipoDocumento.id_tipo_documento,
                ruta_documento       : archivoLocal.id,   // "documentos/timestamp_nombre.pdf"
                tamanno              : size,
                activo               : true,
            });

            const maestroGuardado = await maestro.insert();

            res.status(201).json({
                success: true,
                data: {
                    ...maestroGuardado.toJSON(),
                    tipo_extension: tipoDocumento.nombre,   // "pdf" | "desconocido"
                    archivo       : archivoLocal,
                },
            });

        } catch (error) {
            console.error('Error subiendo documento:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async eliminar(req, res) {
        try {
            const { id } = req.params;

            const documento = await MaestroDocumento.findById(id);
            if (!documento) {
                return res.status(404).json({ success: false, error: 'Documento no encontrado' });
            }

            // 1. Borrado físico en BD
            await MaestroDocumento.delete(id);

            // 2. Eliminar archivo físico del disco
            try {
                await localFileService.eliminarArchivo(documento.ruta_documento);
            } catch (fsError) {
                console.warn('Aviso: no se pudo eliminar el archivo físico:', fsError.message);
            }

            res.json({ success: true, mensaje: 'Documento eliminado correctamente' });

        } catch (error) {
            res.status(error.status || 500).json({ success: false, error: error.message });
        }
    }
}

export default new DocumentoController();