import 'dotenv/config';
import driveService from '../../services/archivos/driveService.js';

class DocumentoController {
  // GET /api/documentos — lista archivos directo desde Drive
  async listar(req, res) {
    try {
      const archivos = await driveService.listarArchivos();
      res.json({ success: true, data: archivos, total: archivos.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/documentos/:id — metadata de un archivo por drive_id
  async obtener(req, res) {
    try {
      const archivo = await driveService.obtenerArchivo(req.params.id);
      if (!archivo) return res.status(404).json({ success: false, error: 'No encontrado' });
      res.json({ success: true, data: archivo });
    } catch (error) {
      // La API de Drive lanza error 404 si el archivo no existe
      const status = error?.code === 404 || error?.status === 404 ? 404 : 500;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  // GET /api/documentos/:id/descargar — stream directo Drive → cliente
  async descargar(req, res) {
    try {
      await driveService.streamArchivo(req.params.id, res);
    } catch (error) {
      // Solo responder si los headers aún no fueron enviados
      if (!res.headersSent) {
        const status = error?.code === 404 || error?.status === 404 ? 404 : 500;
        res.status(status).json({ success: false, error: error.message });
      }
    }
  }

  // POST /api/documentos — sube archivo a Drive
  async subir(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: 'No se envió archivo' });

      const { originalname, mimetype, buffer } = req.file;
      const { carpetaId } = req.body;

      const archivo = await driveService.subirArchivo({
        nombre: originalname,
        mimeType: mimetype,
        buffer,
        carpetaId,
      });

      res.status(201).json({ success: true, data: archivo });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE /api/documentos/:id — elimina de Drive
  async eliminar(req, res) {
    try {
      await driveService.eliminarArchivo(req.params.id);
      res.json({ success: true, mensaje: 'Archivo eliminado de Drive' });
    } catch (error) {
      const status = error?.code === 404 || error?.status === 404 ? 404 : 500;
      res.status(status).json({ success: false, error: error.message });
    }
  }
}

export default new DocumentoController();