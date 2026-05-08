import { Router } from 'express';
import {
  obtenerMisEstudiantes,
  obtenerResumenDashboard,
  validarNota,
} from '../controllers/teacher.controller.js';

const router = Router();

/**
 * @swagger
 * /api/teacher/dashboard/summary:
 *   get:
 *     summary: Obtener resumen del dashboard docente
 *     tags: [Vista Docente]
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario docente
 *     responses:
 *       200:
 *         description: Resumen del dashboard docente
 *       400:
 *         description: teacher_id es requerido
 */
router.get('/dashboard/summary', obtenerResumenDashboard);

/**
 * @swagger
 * /api/teacher/my-students:
 *   get:
 *     summary: Obtener estudiantes asociados al docente
 *     tags: [Vista Docente]
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario docente
 *     responses:
 *       200:
 *         description: Lista de estudiantes del docente
 *       400:
 *         description: teacher_id es requerido
 */
router.get('/my-students', obtenerMisEstudiantes);

/**
 * @swagger
 * /api/teacher/grades/validate:
 *   post:
 *     summary: Validar nota antes de enviarla al módulo de calificaciones
 *     tags: [Vista Docente]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               student_id:
 *                 type: string
 *                 format: uuid
 *                 example: 0b36846d-c1e9-4d67-a7b6-04363c000000
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               module_id:
 *                 type: string
 *                 format: uuid
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *     responses:
 *       200:
 *         description: Resultado de validación
 *       400:
 *         description: Nota inválida o datos faltantes
 */
router.post('/grades/validate', validarNota);

export default router;
