import { Router } from 'express';
import { getConfig, updateConfig } from '../controllers/institucionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizePermissions } from '../middleware/permissionMiddleware.js';

const router = Router();

/**
 * @openapi
 * /api/institucion/config:
 *   get:
 *     summary: Obtiene la configuración visual de la institución
 *     tags: [Institución]
 *     responses:
 *       200:
 *         description: Configuración obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre:
 *                   type: string
 *                   example: "IUSH Principal"
 *                 url_logo:
 *                   type: string
 *                   nullable: true
 *                   example: "https://example.com/logo.png"
 *                 color_primario:
 *                   type: string
 *                   example: "#1F2937"
 *                 color_secundario:
 *                   type: string
 *                   example: "#3B82F6"
 *                 color_fondo:
 *                   type: string
 *                   example: "#F9FAFB"
 *                 texto_primario:
 *                   type: string
 *                   example: "#111827"
 *                 texto_secundario:
 *                   type: string
 *                   example: "#6B7280"
 *                 text_on_dark:
 *                   type: string
 *                   example: "#64748B"
 *                 color_muted:
 *                   type: string
 *                   example: "#9CA3AF"
 *             example:
 *               nombre: "IUSH Principal"
 *               url_logo: "https://example.com/logo.png"
 *               color_primario: "#1F2937"
 *               color_secundario: "#3B82F6"
 *               color_fondo: "#F9FAFB"
 *               texto_primario: "#111827"
 *               texto_secundario: "#6B7280"
 *               color_text_on_dark: "#64748B"
 *               color_muted: "#9CA3AF"
 */
router.get('/config', getConfig);

/**
 * @openapi
 * /api/institucion/config:
 *   put:
 *     summary: Actualiza la configuración visual de la institución
 *     description: Requiere rol SUPER_ADMIN. Todos los campos son opcionales.
 *     tags: [Institución]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url_logo:
 *                 type: string
 *                 description: URL del logo de la institución
 *                 example: "https://example.com/nuevo-logo.png"
 *               color_primario:
 *                 type: string
 *                 description: Color primario en formato HEX (#RRGGBB)
 *                 example: "#FF5733"
 *               color_secundario:
 *                 type: string
 *                 description: Color secundario en formato HEX (#RRGGBB)
 *                 example: "#33FF57"
 *               color_fondo:
 *                 type: string
 *                 description: Color de fondo en formato HEX (#RRGGBB)
 *                 example: "#FFFFFF"
 *               texto_primario:
 *                 type: string
 *                 description: Color de texto primario en formato HEX (#RRGGBB)
 *                 example: "#000000"
 *               texto_secundario:
 *                 type: string
 *                 description: Color de texto secundario en formato HEX (#RRGGBB)
 *                 example: "#4B5563"
 *               text_on_dark:
 *                 type: string
 *                 description: Color de texto en fondo oscuro (texto terciario) en formato HEX (#RRGGBB)
 *                 example: "#64748B"
 *               color_muted:
 *                 type: string
 *                 description: Color atenuado en formato HEX (#RRGGBB)
 *                 example: "#8B92A3"
 *           examples:
 *             actualizar_colores:
 *               summary: "Actualizar solo colores"
 *               value:
 *                 color_primario: "#FF5733"
 *                 color_secundario: "#33FF57"
 *                 color_fondo: "#FFFFFF"
 *             actualizar_logo:
 *               summary: "Actualizar solo el logo"
 *               value:
 *                 url_logo: "https://cdn.example.com/logo-institucional.png"
 *             actualizar_colores_texto:
 *               summary: "Actualizar colores de texto"
 *               value:
 *                 texto_primario: "#000000"
 *                 texto_secundario: "#4B5563"
 *                 color_muted: "#8B92A3"
 *             actualizar_todo:
 *               summary: "Actualizar todo (completo)"
 *               value:
 *                 url_logo: "https://cdn.example.com/logo.png"
 *                 color_primario: "#1E40AF"
 *                 color_secundario: "#0891B2"
 *                 color_fondo: "#F8FAFC"
 *                 texto_primario: "#0F172A"
 *                 texto_secundario: "#475569"
 *                 text_on_dark: "#64748B"
 *                 color_muted: "#94A3B8"
 *     responses:
 *       200:
 *         description: Configuración actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre:
 *                   type: string
 *                   example: "IUSH Principal"
 *                 url_logo:
 *                   type: string
 *                   example: "https://cdn.example.com/logo.png"
 *                 color_primario:
 *                   type: string
 *                   example: "#1E40AF"
 *                 color_secundario:
 *                   type: string
 *                   example: "#0891B2"
 *                 color_fondo:
 *                   type: string
 *                   example: "#F8FAFC"
 *                 texto_primario:
 *                   type: string
 *                   example: "#0F172A"
 *                 texto_secundario:
 *                   type: string
 *                   example: "#475569"
 *                 text_on_dark:
 *                   type: string
 *                   example: "#64748B"
 *                 color_muted:
 *                   type: string
 *                   example: "#94A3B8"
 *       400:
 *         description: Datos inválidos (colores HEX, URL o campos vacíos)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             examples:
 *               color_invalido:
 *                 summary: "Color HEX inválido"
 *                 value:
 *                   error: "El campo \"color_primario\" debe ser un color HEX válido en formato #RRGGBB."
 *               url_invalida:
 *                 summary: "URL inválida"
 *                 value:
 *                   error: "El campo \"url_logo\" debe ser una URL válida."
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: El usuario no tiene permisos SUPER_ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               message: "No tienes permisos para realizar esta accion."
 */
router.put('/config', authMiddleware, authorizePermissions(['sistema.personalizar']), updateConfig);

export default router;
