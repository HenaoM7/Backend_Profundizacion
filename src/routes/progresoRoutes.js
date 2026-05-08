import { Router } from 'express';
import * as progresoController from '../controllers/grades/ProgresoController.js';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';

const router = Router();

// POST /progreso/contenido/:id_contenido/completar
// Estudiante completa un contenido → actualiza % → si 100%: nota + certificado automático
router.post(
  '/contenido/:id_contenido/completar',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  progresoController.completarContenido
);

// GET /progreso/mis-cursos
// Estudiante ve su progreso en todos sus cursos
router.get(
  '/mis-cursos',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  progresoController.getMisCursos
);

// GET /progreso/curso/:id_curso?userId=uuid
// Progreso de un estudiante específico en un curso
// ESTUDIANTE → solo el suyo | DOCENTE/ADMIN → cualquiera vía ?userId
router.get(
  '/curso/:id_curso',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  progresoController.getProgresoCurso
);

// GET /progreso/curso/:id_curso/todos
// Progreso de TODOS los estudiantes en un curso — ADMIN / SUPER_ADMIN / DOCENTE
router.get(
  '/curso/:id_curso/todos',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  progresoController.getProgresoCursoTodos
);

export default router;
