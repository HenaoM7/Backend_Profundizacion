import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { MOCK_TOKENS } from '../config/constants.js';
import {
  getTotalUsuarios,
  getUsuariosActivos,
  getUsuariosPorRol,
  getEstudiantesInscritos,
  getEstudiantesCompletados,
  getTopCursosInscritos,
  getTopCursosCompletados,
} from '../controllers/adminDashboardController.js';

const router = Router();

const hybridAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const mockUser = MOCK_TOKENS[token];

    if (mockUser) {
      req.user = mockUser;
      return next();
    }
  }

  return authMiddleware(req, res, next);
};

const authorizeAdminDashboard = (req, res, next) => {
  const roles = Array.isArray(req.auth?.roles) ? req.auth.roles : [];
  const mockRole = req.user?.role;
  const allowed =
    roles.includes('Admin') ||
    roles.includes('SuperAdmin') ||
    mockRole === 'Admin' ||
    mockRole === 'SuperAdmin';

  if (!allowed) {
    return res.status(403).json({
      message: 'Acceso denegado. Rol requerido: Admin o SuperAdmin.',
    });
  }

  return next();
};

/**
 * @openapi
 * /api/admin/dashboard/usuarios-total:
 *   get:
 *     summary: Total de usuarios creados por el admin autenticado
 *     tags: [Admin Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Total de usuarios registrados
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 totalUsuarios: 12
 *       401:
 *         description: Token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/usuarios-total', hybridAuth, authorizeAdminDashboard, getTotalUsuarios);

/**
 * @openapi
 * /api/admin/dashboard/usuarios-activos:
 *   get:
 *     summary: Usuarios activos creados por el admin autenticado
 *     tags: [Admin Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Total de usuarios activos
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 usuariosActivos: 8
 *       401:
 *         description: Token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/usuarios-activos', hybridAuth, authorizeAdminDashboard, getUsuariosActivos);

/**
 * @openapi
 * /api/admin/dashboard/usuarios-por-rol:
 *   get:
 *     summary: Distribución de usuarios por rol creados por el admin autenticado
 *     tags: [Admin Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Distribución por rol
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 distribucion:
 *                   - rol: Docente
 *                     total: 2
 *                   - rol: Estudiante
 *                     total: 1
 *       401:
 *         description: Token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/usuarios-por-rol', hybridAuth, authorizeAdminDashboard, getUsuariosPorRol);

/**
 * @openapi
 * /api/admin/dashboard/estudiantes-inscritos:
 *   get:
 *     summary: Total de estudiantes inscritos en cursos del admin o sus docentes
 *     tags: [Admin Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Total de estudiantes inscritos
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 totalInscritos: 5
 *       401:
 *         description: Token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estudiantes-inscritos', hybridAuth, authorizeAdminDashboard, getEstudiantesInscritos);

/**
 * @openapi
 * /api/admin/dashboard/estudiantes-completados:
 *   get:
 *     summary: Total de estudiantes que completaron cursos del admin o sus docentes
 *     tags: [Admin Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Total de estudiantes que completaron
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 totalCompletados: 3
 *       401:
 *         description: Token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estudiantes-completados', hybridAuth, authorizeAdminDashboard, getEstudiantesCompletados);

/**
 * @openapi
 * /api/admin/dashboard/top-cursos-inscritos:
 *   get:
 *     summary: Top 5 cursos con más estudiantes inscritos
 *     tags: [Admin Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Top 5 cursos por inscritos
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 topCursos:
 *                   - idCurso: uuid
 *                     titulo: Curso React
 *                     total: 10
 *                   - idCurso: uuid
 *                     titulo: Curso Node
 *                     total: 7
 *       401:
 *         description: Token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/top-cursos-inscritos', hybridAuth, authorizeAdminDashboard, getTopCursosInscritos);

/**
 * @openapi
 * /api/admin/dashboard/top-cursos-completados:
 *   get:
 *     summary: Top 5 cursos con más estudiantes que completaron
 *     tags: [Admin Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Top 5 cursos por completados
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 topCursos:
 *                   - idCurso: uuid
 *                     titulo: Curso React
 *                     total: 8
 *                   - idCurso: uuid
 *                     titulo: Curso Node
 *                     total: 5
 *       401:
 *         description: Token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/top-cursos-completados', hybridAuth, authorizeAdminDashboard, getTopCursosCompletados);

export default router;