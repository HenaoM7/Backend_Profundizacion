import { Router } from 'express';
import * as progresoController    from '../controllers/grades/ProgresoController.js';
import * as validacionController  from '../controllers/grades/ValidacionController.js';
import authenticate               from '../middleware/auth.js';
import { authorize, ROLES }       from '../middleware/roleGuard.js';
import * as ProgresoController from "../controllers/progreso.controller.js";

const router = Router();

router.post(
  '/contenido/:id/validar',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validacionController.validarRespuesta
);

router.get(
  '/mis-cursos',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  progresoController.getMisCursos
);

router.get(
  '/estadisticas/global',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  progresoController.getEstadisticasGlobal
);

router.get(
  '/estadisticas/curso/:id',
  authenticate,
  authorize(ROLES.DOCENTE, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  progresoController.getEstadisticasCurso
);

router.get(
  '/curso/:id_curso/todos',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  progresoController.getProgresoCursoTodos
);

router.get(
  '/curso/:id_curso/modulos',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  progresoController.getProgresoDetalleModulos
);

router.get(
  '/curso/:id_curso',
  authenticate,
  authorize(ROLES.ESTUDIANTE, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DOCENTE),
  progresoController.getProgresoCurso
);

/**
 * @swagger
 * /progreso/contenido/{idContenido}/completar:
 *   post:
 *     summary: Marca un contenido como completado y actualiza el progreso del curso
 *     tags: [Progreso]
 *     security:
 *       - BearerAuth: []
 * ...
 */
router.post(
    '/contenido/:idContenido/completar',
    authenticate,
    // ¡AQUÍ ESTÁ EL PERMISO DEL ESTUDIANTE!
    authorize(ROLES.ESTUDIANTE, ROLES.SUPER_ADMIN, ROLES.ADMIN),
    ProgresoController.completarContenido
);

export default router;
