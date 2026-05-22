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
 *     summary: Listar documentos activos
 *     tags: [Documentos]
 *     description: >
 *       Retorna todos los documentos activos desde `maestro_documento`.
 *       Cada documento incluye `urlPublica` para acceso directo al archivo.
 *     responses:
 *       200:
 *         description: Lista de documentos activos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 1
 *               data:
 *                 - id_maestro_documento: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   numero_documento: "mi_archivo.pdf"
 *                   id_tipo_documento: "c3d4e5f6-a1b2-3456-cdef-123456789012"
 *                   ruta_documento: "documentos/1747123456789_mi_archivo.pdf"
 *                   fecha_creacion: "2026-05-16T10:00:00.000Z"
 *                   fecha_modifica: null
 *                   activo: true
 *                   tamanno: 204800
 *                   tipo_extension: "pdf"
 *                   urlPublica: "http://localhost:3000/src/uploads/documentos/1747123456789_mi_archivo.pdf"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', ctrl.listar.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}:
 *   get:
 *     summary: Obtener metadata de un documento
 *     tags: [Documentos]
 *     description: >
 *       Retorna la metadata completa de un documento por `id_maestro_documento`,
 *       incluyendo `urlPublica` para acceso directo al archivo y `tipo_extension`
 *       obtenido del JOIN con `tipo_documento`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del documento (id_maestro_documento)
 *     responses:
 *       200:
 *         description: Metadata del documento
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id_maestro_documento: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                 numero_documento: "mi_archivo.pdf"
 *                 id_tipo_documento: "c3d4e5f6-a1b2-3456-cdef-123456789012"
 *                 ruta_documento: "documentos/1747123456789_mi_archivo.pdf"
 *                 fecha_creacion: "2026-05-16T10:00:00.000Z"
 *                 fecha_modifica: null
 *                 activo: true
 *                 tamanno: 204800
 *                 tipo_extension: "pdf"
 *                 urlPublica: "http://localhost:3000/src/uploads/documentos/1747123456789_mi_archivo.pdf"
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', ctrl.obtener.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}/descargar:
 *   get:
 *     summary: Descargar un archivo
 *     tags: [Documentos]
 *     description: >
 *       Descarga el archivo físico del servidor buscando por `id_maestro_documento`.
 *       El endpoint obtiene la `ruta_documento` desde BD y sirve el archivo directamente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del documento (id_maestro_documento)
 *     responses:
 *       200:
 *         description: Archivo descargado correctamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Documento no encontrado en BD o archivo no encontrado en disco
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/descargar', ctrl.descargar.bind(ctrl));

/**
 * @swagger
 * /api/documentos:
 *   post:
 *     summary: Subir un archivo
 *     tags: [Documentos]
 *     description: >
 *       Sube un archivo al servidor local y crea un registro en `maestro_documento`.
 *       El tipo de documento se detecta automáticamente por la extensión del archivo.
 *       Si la extensión no está registrada en `tipo_documento`, se asigna el tipo `desconocido`.
 *       Tamaño máximo: 50 MB.
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
 *                 description: Archivo a subir (máx. 50 MB)
 *               carpeta:
 *                 type: string
 *                 enum: [documentos, imagenes]
 *                 default: documentos
 *                 description: Carpeta destino (opcional)
 *     responses:
 *       201:
 *         description: Archivo subido y registro en maestro_documento creado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id_maestro_documento: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                 numero_documento: "mi_archivo.pdf"
 *                 id_tipo_documento: "c3d4e5f6-a1b2-3456-cdef-123456789012"
 *                 ruta_documento: "documentos/1747123456789_mi_archivo.pdf"
 *                 fecha_creacion: "2026-05-16T10:00:00.000Z"
 *                 fecha_modifica: null
 *                 activo: true
 *                 tamanno: 204800
 *                 tipo_extension: "pdf"
 *                 archivo:
 *                   id: "documentos/1747123456789_mi_archivo.pdf"
 *                   name: "1747123456789_mi_archivo.pdf"
 *                   originalName: "mi_archivo.pdf"
 *                   mimeType: "application/pdf"
 *                   size: 204800
 *                   carpeta: "documentos"
 *                   createdTime: "2026-05-16T10:00:00.000Z"
 *                   modifiedTime: "2026-05-16T10:00:00.000Z"
 *       400:
 *         description: No se envió archivo
 *       500:
 *         description: Error al guardar el archivo o insertar en BD
 */
router.post('/', upload.single('archivo'), ctrl.subir.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}:
 *   delete:
 *     summary: Eliminar un documento
 *     tags: [Documentos]
 *     description: >
 *       Elimina físicamente el registro en `maestro_documento` y el archivo en disco.
 *       Si el archivo físico no existe en disco, el registro de BD igual se elimina.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del documento a eliminar (id_maestro_documento)
 *     responses:
 *       200:
 *         description: Documento eliminado correctamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               mensaje: "Documento eliminado correctamente"
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', ctrl.eliminar.bind(ctrl));

export default router;