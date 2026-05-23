import { Router } from 'express';
import * as validacionController from '../controllers/grades/ValidacionController.js';
import authenticate              from '../middleware/auth.js';
import { authorize, ROLES }      from '../middleware/roleGuard.js';

const router = Router();

router.post(
  '/contenido/:id',
  authenticate,
  authorize(ROLES.DOCENTE, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validacionController.crearOActualizarValidacion
);

router.get(
  '/contenido/:id',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.DOCENTE, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validacionController.getValidacion
);

export default router;
