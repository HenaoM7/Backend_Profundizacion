import { Router } from 'express';
import * as progresoController from '../controllers/grades/ProgresoController.js';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';

const router = Router();

router.post(
  '/contenido/:id_contenido/completar',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  progresoController.completarContenido
);

router.get(
  '/mis-cursos',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  progresoController.getMisCursos
);

router.get(
  '/curso/:id_curso',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  progresoController.getProgresoCurso
);


router.get(
  '/curso/:id_curso/todos',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  progresoController.getProgresoCursoTodos
);

export default router;
