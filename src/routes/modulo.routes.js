// src/routes/modulo.routes.js
import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';
import * as ModuloController from '../controllers/modulo.controller.js';

// mergeParams: true para acceder a :cursoId desde el controller
const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Modulos
 *   description: Gestión de módulos dentro de un curso — Equipo 1
 */

/**
 * @swagger
 * /api/cursos/{cursoId}/modulos:
 *   get:
 *     summary: Listar módulos de un curso
 *     tags: [Modulos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *     responses:
 *       200:
 *         description: Lista de módulos ordenados por orden ASC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Modulo'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  ModuloController.getAll
);

/**
 * @swagger
 * /api/cursos/{cursoId}/modulos/{id}:
 *   get:
 *     summary: Detalle de un módulo con sus contenidos
 *     tags: [Modulos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Módulo con contenidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/ModuloDetalle'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  ModuloController.getById
);

/**
 * @swagger
 * /api/cursos/{cursoId}/modulos:
 *   post:
 *     summary: Crear un módulo dentro de un curso
 *     tags: [Modulos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, orden]
 *             properties:
 *               titulo:      { type: string, example: Fundamentos de Node.js }
 *               descripcion: { type: string }
 *               orden:       { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Módulo creado con activo = false
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  ModuloController.create
);

/**
 * @swagger
 * /api/cursos/{cursoId}/modulos/{id}:
 *   put:
 *     summary: Actualizar datos de un módulo
 *     tags: [Modulos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:      { type: string }
 *               descripcion: { type: string }
 *               orden:       { type: integer }
 *     responses:
 *       200:
 *         description: Módulo actualizado
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  ModuloController.update
);

/**
 * @swagger
 * /api/cursos/{cursoId}/modulos/{id}/activo:
 *   patch:
 *     summary: Activar o desactivar un módulo
 *     tags: [Modulos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [activo]
 *             properties:
 *               activo: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Estado del módulo actualizado
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.patch(
  '/:id/activo',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  ModuloController.toggleActivo
);

/**
 * @swagger
 * /api/cursos/{cursoId}/modulos/reorder:
 *   patch:
 *     summary: Reordenar módulos de un curso
 *     tags: [Modulos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orden]
 *             properties:
 *               orden:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id_modulo, orden]
 *                   properties:
 *                     id_modulo: { type: string, format: uuid }
 *                     orden:     { type: integer, example: 1 }
 *                 example:
 *                   - id_modulo: "b1000000-0000-0000-0000-000000000001"
 *                     orden: 2
 *                   - id_modulo: "b1000000-0000-0000-0000-000000000002"
 *                     orden: 1
 *     responses:
 *       200:
 *         description: Módulos reordenados
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  '/reorder',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  ModuloController.reorder
);

/**
 * @swagger
 * /api/cursos/{cursoId}/modulos/{id}:
 *   delete:
 *     summary: Eliminar un módulo (soft delete + cascada a contenidos)
 *     tags: [Modulos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Módulo eliminado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  ModuloController.remove
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Modulo:
 *       type: object
 *       properties:
 *         idModulo:        { type: string, format: uuid }
 *         idCurso:         { type: string, format: uuid }
 *         titulo:          { type: string }
 *         descripcion:     { type: string, nullable: true }
 *         activo:          { type: boolean }
 *         orden:           { type: integer }
 *         contenidosCount: { type: integer }
 *         creacion:        { type: string, format: date-time }
 *         actualizacion:   { type: string, format: date-time }
 *
 *     ModuloDetalle:
 *       allOf:
 *         - $ref: '#/components/schemas/Modulo'
 *         - type: object
 *           properties:
 *             contenidos:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idContenido:  { type: string, format: uuid }
 *                   titulo:       { type: string }
 *                   descripcion:  { type: string, nullable: true }
 *                   tipo:         { type: string, enum: [video, texto, archivo, imagen] }
 *                   orden:        { type: integer }
 *                   activo:       { type: boolean }
 *                   creacion:     { type: string, format: date-time }
 */

export default router;