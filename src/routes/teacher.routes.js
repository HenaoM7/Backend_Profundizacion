import { Router } from 'express';
import { estadoVistaDocente, obtenerResumenDashboard } from '../controllers/teacher.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getPermissionsForRoles } from '../security/accessControl.js';

const router = Router();

const permisoResumenDocente = (req, res, next) => {
  const grantedPermissions = req.auth?.permisos?.length
    ? req.auth.permisos
    : getPermissionsForRoles(req.auth?.roles || []);

  const ok =
    grantedPermissions.includes('cursos.asignados.ver') ||
    grantedPermissions.includes('cursos.ver');

  if (!ok) {
    return res.status(403).json({
      message: 'No tienes permisos para realizar esta accion.',
    });
  }

  req.auth.permisos = grantedPermissions;
  next();
};

/**
 * @openapi
 * /api/teacher/health:
 *   get:
 *     tags: [Teacher]
 *     summary: Estado del módulo Vista Docente
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/health', estadoVistaDocente);

/**
 * @openapi
 * /api/teacher/dashboard/summary:
 *   get:
 *     tags: [Teacher]
 *     summary: Resumen docente (totales y lista de cursos)
 *     description: JWT de POST /api/auth/login. Requiere cursos.asignados.ver (Docente) o cursos.ver (Admin/SuperAdmin). Roles en req.auth.roles; permisos en req.auth.permisos.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Obligatorio si el JWT es Admin o SuperAdmin. Con rol Docente se usa el sub del JWT.
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Falta teacher_id para administradores
 *       401:
 *         description: Sin JWT o token inválido/expirado
 *       403:
 *         description: Sin permiso (cursos.asignados.ver / cursos.ver) o rol no autorizado en controlador
 */
router.get(
  '/dashboard/summary',
  authMiddleware,
  permisoResumenDocente,
  obtenerResumenDashboard,
);

export default router;
