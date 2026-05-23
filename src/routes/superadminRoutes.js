import { Router } from 'express';
import { 
  getUsersView,
  getResumenView,
  getCoursesView,
  getDashboardControl
} from '../controllers/superadminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizePermissions } from '../middleware/permissionMiddleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/superadmin/usuariosView:
 *   get:
 *     summary: Obtiene vista consolidada de usuarios y roles (SuperAdmin)
 *     tags: [SuperAdmin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo]
 *         description: Filtra por estado del usuario
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *         description: Filtra por nombre de rol (ej. estudiante, docente)
 *     responses:
 *       200:
 *         description: Vista de usuarios con estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         usuariosActivos:
 *                           type: integer
 *                         estudiantes:
 *                           type: integer
 *                         docentes:
 *                           type: integer
 *                     usuarios:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           nombre:
 *                             type: string
 *                           correo:
 *                             type: string
 *                           rol:
 *                             type: string
 *                           estado:
 *                             type: string
 *                           ultimoAcceso:
 *                             type: string
 *                             format: date-time
 *       403:
 *         description: Sin permisos
 */
router.get('/usuariosView', authorizePermissions(['usuarios.ver']), getUsersView);

/**
 * @openapi
 * /api/superadmin/resumenView:
 *   get:
 *     summary: Obtiene resumen y métricas del dashboard (SuperAdmin)
 *     tags: [SuperAdmin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen del dashboard con métricas y comparativas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     metricasActuales:
 *                       type: object
 *                       properties:
 *                         sesionesTotales:
 *                           type: integer
 *                         tiempoPromedioTerminacion:
 *                           type: number
 *                           description: En minutos
 *                         certificadosEmitidos:
 *                           type: integer
 *                         cursosCompletados:
 *                           type: integer
 *                         nuevosUsuarios:
 *                           type: integer
 *                         cursossinInscripcion:
 *                           type: integer
 *                     tendenciaSesionesDias:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           dia:
 *                             type: string
 *                           sesiones:
 *                             type: integer
 *                     sesionesxDia:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           diaSemana:
 *                             type: string
 *                           total:
 *                             type: integer
 *                     comparativasMensual:
 *                       type: object
 *                       properties:
 *                         sesionesTotales:
 *                           type: object
 *                           properties:
 *                             estesMes:
 *                               type: integer
 *                             mesAnterior:
 *                               type: integer
 *                             variacion:
 *                               type: number
 *                               description: Porcentaje de variación
 *       403:
 *         description: Sin permisos
 */
router.get('/resumenView', authorizePermissions(['usuarios.ver']), getResumenView);

/**
 * @openapi
 * /api/superadmin/cursosView:
 *   get:
 *     summary: Obtiene vista consolidada de cursos (SuperAdmin)
 *     tags: [SuperAdmin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo]
 *         description: Filtra por estado del curso
 *       - in: query
 *         name: contenido
 *         schema:
 *           type: string
 *           enum: [con_contenido, sin_contenido]
 *         description: Filtra por disponibilidad de contenido
 *       - in: query
 *         name: inscripciones
 *         schema:
 *           type: string
 *           enum: [con_inscripciones, sin_inscripciones]
 *         description: Filtra por inscripciones de estudiantes
 *     responses:
 *       200:
 *         description: Vista de cursos con estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         cursosActivos:
 *                           type: integer
 *                         conContenido:
 *                           type: integer
 *                         sinContenido:
 *                           type: integer
 *                         sinInscripciones:
 *                           type: integer
 *                     cursos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           titulo:
 *                             type: string
 *                           docente:
 *                             type: string
 *                           modulos:
 *                             type: integer
 *                           estudiantes:
 *                             type: integer
 *                           estado:
 *                             type: string
 *                           contenido:
 *                             type: string
 *                           inscripciones:
 *                             type: string
 *       403:
 *         description: Sin permisos
 */
router.get('/cursosView', authorizePermissions(['usuarios.ver']), getCoursesView);

/**
 * @openapi
 * /api/superadmin/dashboardControl:
 *   get:
 *     summary: Obtiene datos completos del Panel de Control (SuperAdmin)
 *     tags: [SuperAdmin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del panel de control con KPIs, elementos de atención y gráficos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     tarjetas:
 *                       type: object
 *                       properties:
 *                         estudiantes:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             variacion:
 *                               type: number
 *                         docentes:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             inactivos:
 *                               type: integer
 *                         cursos:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             variacion:
 *                               type: number
 *                         contenidos:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             variacion:
 *                               type: number
 *                     elementosAtencion:
 *                       type: object
 *                       properties:
 *                         docentesInactivos:
 *                           type: integer
 *                         cursosSinInscripciones:
 *                           type: integer
 *                         cursosSinContenido:
 *                           type: integer
 *                     graficos:
 *                       type: object
 *                       properties:
 *                         sesionesSemana:
 *                           type: array
 *                         contenidoPorTipo:
 *                           type: array
 *                         topCursos:
 *                           type: array
 *                         topDocentes:
 *                           type: array
 *       403:
 *         description: Sin permisos
 */
router.get('/dashboardControl', authorizePermissions(['usuarios.ver']), getDashboardControl);

export default router;

