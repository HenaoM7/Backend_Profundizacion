import localFileService from "../../services/archivos/localFileService.js";

class DocumentoController {

    // GET /api/documentos?carpeta=documentos
    async listar(req, res) {
        try {
            const { carpeta = "documentos" } = req.query;
            const archivos = await localFileService.listarArchivos(carpeta);
            res.json({
                success: true,
                data: archivos,
                total: archivos.length,
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET /api/documentos/:id/descargar
    // id = "documentos/1234567890_archivo.pdf"
    async descargar(req, res) {
        try {
            const fileId = decodeURIComponent(req.params.id);
            await localFileService.descargarArchivo(fileId, res);
        } catch (error) {
            if (!res.headersSent) {
                res.status(error.status || 500).json({
                    success: false,
                    error: error.message,
                });
            }
        }
    }

    // POST /api/documentos
    // body: multipart/form-data { archivo, carpeta }
    async subir(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "No se envió ningún archivo",
                });
            }

            const { originalname, mimetype, buffer } = req.file;
            const { carpeta = "documentos" } = req.body;

            const archivo = await localFileService.subirArchivo({
                nombre: originalname,
                mimeType: mimetype,
                buffer,
                carpeta,
            });

            res.status(201).json({ success: true, data: archivo });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE /api/documentos/:id
    // id = "documentos/1234567890_archivo.pdf"
    async eliminar(req, res) {
        try {
            const fileId = decodeURIComponent(req.params.id);
            await localFileService.eliminarArchivo(fileId);
            res.json({
                success: true,
                mensaje: "Archivo eliminado correctamente",
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                error: error.message,
            });
        }
    }
}

export default new DocumentoController();
