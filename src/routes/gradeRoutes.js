import { Router } from 'express';
import * as gradeController from '../controllers/grades/GradeController.js';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.DOCENTE, ROLES.ADMIN),
  gradeController.createGrade
);

router.get(
  '/student/:userId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  gradeController.getGradesByStudent
);

router.get(
  '/course/:courseId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DOCENTE),
  gradeController.getGradesByCourse
);

router.get(
  '/course/:courseId/average/:userId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  gradeController.getAverageByUserAndCourse
);

export default router;
