import { Router } from 'express';
import * as evaluacionController from '../controllers/grades/EvaluacionController.js';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';

const router = Router();

// POST /evaluaciones/contenido/:id_contenido/responder
// Estudiante envía sus respuestas → se calcula puntaje → se crea nota automáticamente
router.post(
  '/contenido/:id_contenido/responder',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN),
  evaluacionController.responderEvaluacion
);

// GET /evaluaciones/contenido/:id_contenido/resultado/:userId
// Consultar el resultado de un estudiante en una evaluación
router.get(
  '/contenido/:id_contenido/resultado/:userId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  evaluacionController.getResultado
);

export default router;
