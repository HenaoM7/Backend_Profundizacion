import { Router } from 'express';
import * as gradeController from '../controllers/grades/GradeController.js';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';

const router = Router();

// POST /grades — DOCENTE y ADMIN crean notas
router.post(
  '/',
  authenticate,
  authorize(ROLES.DOCENTE, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  gradeController.createGrade
);

// GET /grades/student/:userId
//   ESTUDIANTE → solo las suyas (validado en controller)
//   DOCENTE    → las del estudiante filtradas a sus cursos (validado en service)
//   ADMIN / SUPER_ADMIN → todas las notas del estudiante
router.get(
  '/student/:userId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  gradeController.getGradesByStudent
);

// GET /grades/course/:courseId
//   DOCENTE    → solo si es propietario del curso (validado en service)
//   ADMIN / SUPER_ADMIN → cualquier curso
router.get(
  '/course/:courseId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  gradeController.getGradesByCourse
);

// GET /grades/course/:courseId/average/:userId
//   ESTUDIANTE → solo su propio promedio (validado en controller)
//   DOCENTE    → solo si es propietario del curso (validado en service)
//   ADMIN / SUPER_ADMIN → cualquier promedio
router.get(
  '/course/:courseId/average/:userId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  gradeController.getAverageByUserAndCourse
);

// GET /grades/course/:courseId/estadisticas — exclusivo ADMIN y SUPER_ADMIN
router.get(
  '/course/:courseId/estadisticas',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  gradeController.getEstadisticasByCourse
);

export default router;
