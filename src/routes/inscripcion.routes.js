// src/routes/inscripcion.routes.js
import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';
import * as InscripcionController from '../controllers/inscripcion.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Inscripciones
 *   description: CRUD de inscripciones
 */

/**
 * @swagger
 * /api/inscripciones:
 *   get:
 *     summary: Listar inscripciones
 *     tags: [Inscripciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_curso
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: id_usuario
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista paginada de inscripciones
 */
router.get('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE), InscripcionController.getAll);

/**
 * @swagger
 * /api/inscripciones/validar:
 *   get:
 *     summary: Verificar si un usuario está inscrito en un curso
 *     tags: [Inscripciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_curso
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: id_usuario
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 enrolled: { type: boolean }
 */
router.get('/validar', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE), InscripcionController.validate);

/**
 * @swagger
 * /api/inscripciones/{id}:
 *   get:
 *     summary: Obtener inscripción por id
 *     tags: [Inscripciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Inscripción encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE), InscripcionController.getById);

/**
 * @swagger
 * /api/inscripciones:
 *   post:
 *     summary: Crear una nueva inscripción
 *     tags: [Inscripciones]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_curso, id_usuario]
 *             properties:
 *               id_curso: { type: string, format: uuid }
 *               id_usuario: { type: string, format: uuid }
 *               fecha_inicio: { type: string, format: date-time }
 *               fecha_finalizacion: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Inscripción creada
 */
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE), InscripcionController.create);

/**
 * @swagger
 * /api/inscripciones/{id}:
 *   put:
 *     summary: Actualizar fechas de una inscripción
 *     tags: [Inscripciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_inicio: { type: string, format: date-time }
 *               fecha_finalizacion: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Inscripción actualizada
 */
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE), InscripcionController.update);

/**
 * @swagger
 * /api/inscripciones/{id}:
 *   delete:
 *     summary: Eliminar una inscripción
 *     tags: [Inscripciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Inscripción eliminada
 */
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), InscripcionController.remove);

/**
 * @swagger
 * /api/inscripciones/mis-cursos/{id_usuario}:
 *   get:
 *     summary: Obtener todos los cursos en los que un usuario está inscrito (incluyendo su progreso)
 *     tags: [Inscripciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de cursos inscritos con su progreso
 *       400:
 *         description: El id_usuario es requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/mis-cursos/:id_usuario',
    authenticate,
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
    InscripcionController.getMisCursosInscritos
);

export default router;

