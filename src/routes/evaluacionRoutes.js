import { Router } from 'express';
import * as evaluacionController from '../controllers/grades/EvaluacionController.js';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';

const router = Router();

router.post(
  '/contenido/:id_contenido/responder',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN),
  evaluacionController.responderEvaluacion
);

router.get(
  '/contenido/:id_contenido/resultado/:userId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  evaluacionController.getResultado
);

export default router;
