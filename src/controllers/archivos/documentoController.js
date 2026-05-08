import driveService from '../../services/archivos/driveService.js';
import DocumentoModel from '../../models/archivos/documentoModel.js';

class DocumentoController {

  // GET /documentos — lista desde la BD
  async listar(req, res) {
    try {
      const documentos = await DocumentoModel.getAll();
      res.json({ success: true, data: documentos });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /documentos/:id — obtiene uno por ID de BD
  async obtener(req, res) {
    try {
      const doc = await DocumentoModel.getById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, error: 'No encontrado' });
      res.json({ success: true, data: doc });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /documentos/:id/descargar — stream directo desde Drive al cliente
  async descargar(req, res) {
    try {
      const doc = await DocumentoModel.getById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, error: 'No encontrado' });

      // Pipe: Drive → respuesta HTTP → navegador del usuario
      await driveService.streamArchivo(doc.drive_id, res);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /documentos/buscar?q=termino
  async buscar(req, res) {
    try {
      const { q } = req.query;
      if (!q) return res.status(400).json({ success: false, error: 'Falta el parámetro q' });

      const resultados = await DocumentoModel.search(q);
      res.json({ success: true, data: resultados, total: resultados.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /documentos — sube a Drive y registra en BD
  async subir(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: 'No se envió archivo' });

      const { originalname, mimetype, buffer, size } = req.file;
      const { carpetaId } = req.body;

      // 1. Subir a Drive
      const archivosDrive = await driveService.subirArchivo({
        nombre: originalname,
        mimeType: mimetype,
        buffer,
        carpetaId,
      });

      // 2. Registrar en PostgreSQL
      const doc = await DocumentoModel.create({
        nombre: originalname,
        driveId: archivosDrive.id,
        mimeType: mimetype,
        tamanio: size,
        carpetaId: carpetaId || null,
      });

      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE /documentos/:id
  async eliminar(req, res) {
    try {
      const doc = await DocumentoModel.delete(req.params.id);
      if (!doc) return res.status(404).json({ success: false, error: 'No encontrado' });
      res.json({ success: true, mensaje: 'Documento eliminado' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new DocumentoController();