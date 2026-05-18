import { Router } from 'express';
import * as reportesController from '../controllers/reportesController.js';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';

const router = Router();

const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/cursos-populares',           ...adminOnly, reportesController.getCursosPopulares);
router.get('/inscripciones-por-periodo',  ...adminOnly, reportesController.getInscripcionesPorPeriodo);
router.get('/intentos-por-modulo',        ...adminOnly, reportesController.getIntentosPorModulo);
router.get('/tasa-aprobacion',            ...adminOnly, reportesController.getTasaAprobacion);
router.get('/cursos-activos-vs-inactivos',...adminOnly, reportesController.getCursosActivosVsInactivos);
router.get('/certificados',               ...adminOnly, reportesController.getCertificados);

export default router;
