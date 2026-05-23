import { Router } from 'express';
import * as reportesController from '../controllers/reportesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';

const router = Router();

// Translates the real JWT payload (req.auth.roles array) to the single
// req.user.role string that roleGuard expects. Picks the highest-privilege
// role so a user with multiple roles is never accidentally downgraded.
const ROLE_PRIORITY = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE];
const jwtToUser = (req, _res, next) => {
  if (req.auth) {
    const roles = Array.isArray(req.auth.roles) ? req.auth.roles : [req.auth.roles];
    req.user = {
      userId: req.auth.sub,
      name:   req.auth.nombre,
      role:   ROLE_PRIORITY.find(r => roles.includes(r)) ?? roles[0] ?? null,
    };
  }
  next();
};

const adminOnly = [authMiddleware, jwtToUser, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/cursos-populares',           ...adminOnly, reportesController.getCursosPopulares);
router.get('/inscripciones-por-periodo',  ...adminOnly, reportesController.getInscripcionesPorPeriodo);
router.get('/intentos-por-modulo',        ...adminOnly, reportesController.getIntentosPorModulo);
router.get('/tasa-aprobacion',            ...adminOnly, reportesController.getTasaAprobacion);
router.get('/cursos-activos-vs-inactivos',...adminOnly, reportesController.getCursosActivosVsInactivos);
router.get('/certificados',               ...adminOnly, reportesController.getCertificados);

export default router;
