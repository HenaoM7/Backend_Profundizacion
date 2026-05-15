import { Router } from 'express';
import { estadoVistaDocente, obtenerResumenDashboard } from '../controllers/teacher.controller.js';

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
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Error de validación
 */
router.get('/dashboard/summary', obtenerResumenDashboard);

export default router;
