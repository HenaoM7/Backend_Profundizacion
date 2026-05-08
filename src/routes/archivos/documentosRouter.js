import { Router } from 'express';
import multer from 'multer';
import ctrl from '../../controllers/archivos/documentoController.js';

const router = Router();

// multer en memoria (no guarda en disco)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/documentos:
 *   get:
 *     summary: Lista todos los documentos
 *     tags: [Documentos]
 *     responses:
 *       200:
 *         description: Lista de documentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Documento'
 */
router.get('/', ctrl.listar.bind(ctrl));

/**
 * @swagger
 * /api/documentos/buscar:
 *   get:
 *     summary: Busca documentos
 *     tags: [Documentos]
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Documento'
 */
router.get('/buscar', ctrl.buscar.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}:
 *   get:
 *     summary: Obtiene un documento por ID
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del documento
 *     responses:
 *       200:
 *         description: Documento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Documento'
 *       404:
 *         description: Documento no encontrado
 */
router.get('/:id', ctrl.obtener.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}/descargar:
 *   get:
 *     summary: Descarga un documento
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del documento a descargar
 *     responses:
 *       200:
 *         description: Archivo descargado
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Documento no encontrado
 */
router.get('/:id/descargar', ctrl.descargar.bind(ctrl));

/**
 * @swagger
 * /api/documentos:
 *   post:
 *     summary: Sube un nuevo documento
 *     tags: [Documentos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *             required:
 *               - archivo
 *     responses:
 *       201:
 *         description: Documento subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Documento'
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', upload.single('archivo'), ctrl.subir.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}:
 *   delete:
 *     summary: Elimina un documento
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del documento a eliminar
 *     responses:
 *       204:
 *         description: Documento eliminado exitosamente
 *       404:
 *         description: Documento no encontrado
 */
router.delete('/:id', ctrl.eliminar.bind(ctrl));

export default router;