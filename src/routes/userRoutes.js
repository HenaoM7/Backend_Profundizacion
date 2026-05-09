import { Router } from 'express';

import { listSystemUsers, registerUser } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizePermissions } from '../middleware/permissionMiddleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Lista los usuarios del sistema.
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuarios cargados correctamente.
 *       403:
 *         description: El usuario no tiene permisos.
 */
router.get('/', authorizePermissions(['usuarios.ver']), listSystemUsers);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Crea un usuario con uno o varios roles permitidos.
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, contrasena, roles]
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *                 format: email
 *               contrasena:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *       400:
 *         description: Datos invalidos.
 *       403:
 *         description: Roles no autorizados.
 *       409:
 *         description: Correo duplicado.
 */
router.post('/', authorizePermissions(['usuarios.crear']), registerUser);

export default router;