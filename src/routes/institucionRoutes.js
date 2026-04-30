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
 *                 name:
 *                   type: string
 *                   example: "IUSH Principal"
 *                 logo_url:
 *                   type: string
 *                   nullable: true
 *                   example: "https://example.com/logo.png"
 *                 primary_color:
 *                   type: string
 *                   example: "#1F2937"
 *                 secondary_color:
 *                   type: string
 *                   example: "#3B82F6"
 *                 background_color:
 *                   type: string
 *                   example: "#F9FAFB"
 *                 text_primary:
 *                   type: string
 *                   example: "#111827"
 *                 text_secondary:
 *                   type: string
 *                   example: "#6B7280"
 *                 text_tertiary:
 *                   type: string
 *                   example: "#9CA3AF"
 *             example:
 *               name: "IUSH Principal"
 *               logo_url: "https://example.com/logo.png"
 *               primary_color: "#1F2937"
 *               secondary_color: "#3B82F6"
 *               background_color: "#F9FAFB"
 *               text_primary: "#111827"
 *               text_secondary: "#6B7280"
 *               text_tertiary: "#9CA3AF"
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
 *               logo_url:
 *                 type: string
 *                 description: URL del logo de la institución
 *                 example: "https://example.com/nuevo-logo.png"
 *               primary_color:
 *                 type: string
 *                 description: Color primario en formato HEX (#RRGGBB)
 *                 example: "#FF5733"
 *               secondary_color:
 *                 type: string
 *                 description: Color secundario en formato HEX (#RRGGBB)
 *                 example: "#33FF57"
 *               background_color:
 *                 type: string
 *                 description: Color de fondo en formato HEX (#RRGGBB)
 *                 example: "#FFFFFF"
 *               text_primary:
 *                 type: string
 *                 description: Color de texto primario en formato HEX (#RRGGBB)
 *                 example: "#000000"
 *               text_secondary:
 *                 type: string
 *                 description: Color de texto secundario en formato HEX (#RRGGBB)
 *                 example: "#4B5563"
 *               text_tertiary:
 *                 type: string
 *                 description: Color de texto terciario en formato HEX (#RRGGBB)
 *                 example: "#8B92A3"
 *           examples:
 *             actualizar_colores:
 *               summary: "Actualizar solo colores"
 *               value:
 *                 primary_color: "#FF5733"
 *                 secondary_color: "#33FF57"
 *                 background_color: "#FFFFFF"
 *             actualizar_logo:
 *               summary: "Actualizar solo el logo"
 *               value:
 *                 logo_url: "https://cdn.example.com/logo-institucional.png"
 *             actualizar_colores_texto:
 *               summary: "Actualizar colores de texto"
 *               value:
 *                 text_primary: "#000000"
 *                 text_secondary: "#4B5563"
 *                 text_tertiary: "#8B92A3"
 *             actualizar_todo:
 *               summary: "Actualizar todo (completo)"
 *               value:
 *                 logo_url: "https://cdn.example.com/logo.png"
 *                 primary_color: "#1E40AF"
 *                 secondary_color: "#0891B2"
 *                 background_color: "#F8FAFC"
 *                 text_primary: "#0F172A"
 *                 text_secondary: "#475569"
 *                 text_tertiary: "#94A3B8"
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
 *                 logo_url:
 *                   type: string
 *                   example: "https://cdn.example.com/logo.png"
 *                 primary_color:
 *                   type: string
 *                   example: "#1E40AF"
 *                 secondary_color:
 *                   type: string
 *                   example: "#0891B2"
 *                 background_color:
 *                   type: string
 *                   example: "#F8FAFC"
 *                 text_primary:
 *                   type: string
 *                   example: "#0F172A"
 *                 text_secondary:
 *                   type: string
 *                   example: "#475569"
 *                 text_tertiary:
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
 *                   error: "El campo \"primary_color\" debe ser un color HEX válido en formato #RRGGBB."
 *               url_invalida:
 *                 summary: "URL inválida"
 *                 value:
 *                   error: "El campo \"logo_url\" debe ser una URL válida."
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
