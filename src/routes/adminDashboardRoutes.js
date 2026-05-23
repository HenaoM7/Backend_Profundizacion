import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
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

const authorizeAdminDashboard = (req, res, next) => {
  const roles = Array.isArray(req.auth?.roles) ? req.auth.roles : [];

  if (!roles.includes('Admin') && !roles.includes('SuperAdmin')) {
    return res.status(403).json({
      message: 'Acceso denegado. Rol requerido: Admin o SuperAdmin.',
    });
  }

  return next();
};

// @openapi docs omitidas por brevedad — déjalas igual que antes

router.get('/usuarios-total',        authMiddleware, authorizeAdminDashboard, getTotalUsuarios);
router.get('/usuarios-activos',      authMiddleware, authorizeAdminDashboard, getUsuariosActivos);
router.get('/usuarios-por-rol',      authMiddleware, authorizeAdminDashboard, getUsuariosPorRol);
router.get('/estudiantes-inscritos', authMiddleware, authorizeAdminDashboard, getEstudiantesInscritos);
router.get('/estudiantes-completados', authMiddleware, authorizeAdminDashboard, getEstudiantesCompletados);
router.get('/top-cursos-inscritos',  authMiddleware, authorizeAdminDashboard, getTopCursosInscritos);
router.get('/top-cursos-completados', authMiddleware, authorizeAdminDashboard, getTopCursosCompletados);

export default router;