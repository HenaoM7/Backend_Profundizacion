import { Router } from 'express';
import {
  estadoVistaDocente,
  obtenerResumenDashboard,
  obtenerCursosEnConstruccion,
  obtenerTotalEstudiantes,
  obtenerTopCursosPorInscritos,
  obtenerCursosConMenosInscritosHandler,
  obtenerUltimosEstudiantesInscritosHandler,
} from '../controllers/teacher.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @openapi
 * /api/teacher/health:
 *   get:
 *     tags: [Teacher]
 *     summary: Estado del módulo Vista Docente
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/health', estadoVistaDocente);

/**
 * @openapi
 * /api/teacher/dashboard/summary:
 *   get:
 *     tags: [Teacher]
 *     summary: Resumen docente (totales y lista de cursos)
 *     description: JWT de POST /api/auth/login. Roles permitidos en el controlador Docente, Admin o SuperAdmin (Admin/SuperAdmin deben enviar teacher_id).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Obligatorio si el JWT es Admin o SuperAdmin. Con rol Docente se usa el sub del JWT.
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Falta teacher_id para administradores
 *       401:
 *         description: Sin JWT o token inválido/expirado
 *       403:
 *         description: Rol no autorizado (solo Docente, Admin o SuperAdmin)
 */
router.get(
  '/dashboard/summary',
  authMiddleware,
  obtenerResumenDashboard,
);

/**
 * @openapi
 * /api/teacher/dashboard/courses/in-progress:
 *   get:
 *     tags: [Teacher]
 *     summary: Cursos en proceso de creación
 *     description: |
 *       Cursos del docente donde cantidad_modulos = 0 o cantidad_contenidos = 0.
 *       Misma autenticación y query teacher_id que /dashboard/summary.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Obligatorio si el JWT es Admin o SuperAdmin.
 *     responses:
 *       200:
 *         description: Lista de cursos en construcción
 *       400:
 *         description: Falta teacher_id para administradores
 *       401:
 *         description: Sin JWT o token inválido/expirado
 *       403:
 *         description: Rol no autorizado
 */
router.get(
  '/dashboard/courses/in-progress',
  authMiddleware,
  obtenerCursosEnConstruccion,
);

/**
 * @openapi
 * /api/teacher/dashboard/students/total:
 *   get:
 *     tags: [Teacher]
 *     summary: Total de estudiantes matriculados en mis cursos (punto 6)
 *     description: |
 *       Cuenta estudiantes distintos (inscripcion.id_usuario) en cursos del docente (curso.id_usuario).
 *       Misma autenticación y teacher_id que los demás endpoints del dashboard.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Total de estudiantes matriculados
 *       400:
 *         description: Falta teacher_id para administradores
 *       401:
 *         description: Sin JWT
 *       403:
 *         description: Rol no autorizado
 */
router.get(
  '/dashboard/students/total',
  authMiddleware,
  obtenerTotalEstudiantes,
);

/**
 * @openapi
 * /api/teacher/dashboard/courses/top-enrolled:
 *   get:
 *     tags: [Teacher]
 *     summary: Cursos con más estudiantes inscritos (punto 4)
 *     description: |
 *       Los 5 cursos del docente con más estudiantes inscritos (orden descendente).
 *       Misma autenticación y teacher_id que el resto del dashboard.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ranking de cursos por inscripciones
 *       400:
 *         description: Falta teacher_id para administradores
 *       401:
 *         description: Sin JWT
 *       403:
 *         description: Rol no autorizado
 */
router.get(
  '/dashboard/courses/top-enrolled',
  authMiddleware,
  obtenerTopCursosPorInscritos,
);

/**
 * @openapi
 * /api/teacher/dashboard/courses/lowest-enrolled:
 *   get:
 *     tags: [Teacher]
 *     summary: Cursos con menos estudiantes inscritos (punto 5)
 *     description: |
 *       Los 5 cursos del docente con menos estudiantes inscritos (orden ascendente).
 *       Misma autenticación y teacher_id que el resto del dashboard.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ranking de cursos con menos inscripciones
 *       400:
 *         description: Falta teacher_id para administradores
 *       401:
 *         description: Sin JWT
 *       403:
 *         description: Rol no autorizado
 */
router.get(
  '/dashboard/courses/lowest-enrolled',
  authMiddleware,
  obtenerCursosConMenosInscritosHandler,
);

/**
 * @openapi
 * /api/teacher/dashboard/students/recent:
 *   get:
 *     tags: [Teacher]
 *     summary: Últimos 10 estudiantes inscritos con avance (punto 10)
 *     description: |
 *       Inscripciones en cursos del docente, ordenadas por fecha_inicio descendente.
 *       porcentaje desde progreso_curso (0 si aún no hay registro de progreso).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de inscripciones recientes
 *       400:
 *         description: Falta teacher_id para administradores
 *       401:
 *         description: Sin JWT
 *       403:
 *         description: Rol no autorizado
 */
router.get(
  '/dashboard/students/recent',
  authMiddleware,
  obtenerUltimosEstudiantesInscritosHandler,
);

export default router;
