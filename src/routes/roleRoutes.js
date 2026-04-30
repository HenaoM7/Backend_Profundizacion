import { Router } from 'express';

import { listAvailableRoles } from '../controllers/roleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizePermissions } from '../middleware/permissionMiddleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: Lista los roles del sistema y si el actor puede asignarlos.
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Roles cargados correctamente.
 *       403:
 *         description: El usuario no tiene permisos.
 */
router.get('/', authorizePermissions(['roles.ver']), listAvailableRoles);

export default router;