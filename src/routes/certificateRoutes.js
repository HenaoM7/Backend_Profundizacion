import { Router } from 'express';
import * as certificateController from '../controllers/grades/CertificateController.js';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.DOCENTE, ROLES.ADMIN),
  certificateController.generateCertificate
);

router.get(
  '/:userId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  certificateController.getCertificatesByUser
);

router.get(
  '/:userId/course/:courseId/download',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  certificateController.downloadCertificate
);

export default router;
