import { Router } from "express";
import multer from "multer";
import ctrl from "../../controllers/archivos/documentoController.js";

const router = Router();

// multer en memoria — no toca el disco hasta que el servicio lo decide
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB máximo por archivo
    },
});

/**
 * @swagger
 * /api/documentos:
 *   get:
 *     summary: Lista archivos de una carpeta
 *     tags: [Documentos]
 *     parameters:
 *       - in: query
 *         name: carpeta
 *         schema:
 *           type: string
 *           enum: [documentos, imagenes, reportes]
 *           default: documentos
 *     responses:
 *       200:
 *         description: Lista de archivos
 */
router.get("/", ctrl.listar.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}/descargar:
 *   get:
 *     summary: Descarga un archivo
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo (ej. "documentos/1234_archivo.pdf")
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
router.get("/:id/descargar", ctrl.descargar.bind(ctrl));

/**
 * @swagger
 * /api/documentos:
 *   post:
 *     summary: Sube un archivo
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
 *               carpeta:
 *                 type: string
 *                 enum: [documentos, imagenes, reportes]
 *                 default: documentos
 *             required:
 *               - archivo
 *     responses:
 *       201:
 *         description: Archivo subido exitosamente
 *       400:
 *         description: No se envió archivo
 */
router.post("/", upload.single("archivo"), ctrl.subir.bind(ctrl));

/**
 * @swagger
 * /api/documentos/{id}:
 *   delete:
 *     summary: Elimina un archivo
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo (ej. "documentos/1234_archivo.pdf")
 *     responses:
 *       200:
 *         description: Archivo eliminado
 *       404:
 *         description: Archivo no encontrado
 */
router.delete("/:id", ctrl.eliminar.bind(ctrl));

export default router;
