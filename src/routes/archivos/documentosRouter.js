import { Router } from 'express';
import multer from 'multer';
import ctrl from '../../controllers/archivos/documentoController.js';

const router = Router();

const upload = multer({
    storage : multer.memoryStorage(),
    limits  : { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

/**
 * @swagger
 * /api/documentos:
 *   get:
 *     summary: Lista archivos del sistema de archivos local
 *     tags: [Documentos]
 *     parameters:
 *       - in: query
 *         name: carpeta
 *         schema:
 *           type: string
 *           enum: [documentos, imagenes]
 *           default: documentos
 *     responses:
 *       200:
 *         description: Lista de archivos
 */
router.get('/', ctrl.listar.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}:
 *   get:
 *     summary: Obtiene metadata de un documento por id_documento_contenido
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: id_documento_contenido
 *     responses:
 *       200:
 *         description: Metadata del documento (JOIN con maestro_documento)
 *       404:
 *         description: Documento no encontrado
 */
router.get('/:id', ctrl.obtener.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}/descargar:
 *   get:
 *     summary: Descarga el archivo físico buscado por id_documento_contenido
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: id_documento_contenido
 *     responses:
 *       200:
 *         description: Archivo descargado
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Archivo no encontrado
 */
router.get('/:id/descargar', ctrl.descargar.bind(ctrl));

/**
 * @swagger
 * /api/documentos:
 *   post:
 *     summary: Sube un archivo y crea registros en BD (maestro + contenido)
 *     tags: [Documentos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [archivo]
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *               carpeta:
 *                 type: string
 *                 enum: [documentos, imagenes]
 *                 default: documentos
 *               id_tipo_documento:
 *                 type: string
 *                 format: uuid
 *               id_contenido:
 *                 type: string
 *                 format: uuid
 *               id_usuario:
 *                 type: string
 *                 format: uuid
 *               esdescargable:
 *                 type: boolean
 *                 default: false
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Archivo subido y registros BD creados
 *       400:
 *         description: No se envió archivo
 */
router.post('/', upload.single('archivo'), ctrl.subir.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}:
 *   delete:
 *     summary: Elimina archivo físico y registros en BD
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: id_documento_contenido
 *     responses:
 *       200:
 *         description: Documento eliminado
 *       404:
 *         description: Documento no encontrado
 */
router.delete('/:id', ctrl.eliminar.bind(ctrl));

export default router;
