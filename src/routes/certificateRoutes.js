import { Router } from 'express';
import * as certController from '../controllers/grades/CertificateController.js';
import authenticate        from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';

const router = Router();

router.post(
  '/plantilla/:courseId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  certController.registrarPlantilla
);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  certController.generarCertificado
);

router.get(
  '/verificar/:codigo',
  certController.verificarCertificado
);

router.get(
  '/usuario/:userId',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.DOCENTE, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  certController.getCertificadosByUser
);

router.get(
  '/:id/preview',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.DOCENTE, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  certController.previewCertificado
);

router.get(
  '/:id/descargar',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.DOCENTE, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  certController.descargarCertificado
);

export default router;
