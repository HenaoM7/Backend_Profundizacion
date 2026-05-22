// src/routes/curso.routes.js
import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';
import * as CursoController from '../controllers/curso.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cursos
 *   description: Gestión de cursos — Equipo 1
 */

/**
 * @swagger
 * /api/cursos:
 *   get:
 *     summary: Listar todos los cursos
 *     tags: [Cursos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: id_usuario
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por UUID del docente
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Lista paginada de cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Curso'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:      { type: integer, example: 25 }
 *                     page:       { type: integer, example: 1 }
 *                     limit:      { type: integer, example: 10 }
 *                     totalPages: { type: integer, example: 3 }
 */
router.get(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  CursoController.getAll
);

/**
 * @swagger
 * /api/cursos/{id}/detalle/{id_usuario}:
 *   get:
 *     summary: Detalle completo de un curso (módulos, contenidos, progreso del usuario)
 *     tags: [Cursos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del curso (id_curso)
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario (para ver su progreso)
 *     responses:
 *       200:
 *         description: Curso con módulos, contenidos y progreso del usuario especificado
 *       403:
 *         description: El usuario no está inscrito en el curso o no tiene permisos
 *       404:
 *         description: Curso no encontrado
 */
router.get(
  '/:id/detalle/:id_usuario',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  CursoController.getDetalleCompleto
);

/**
 * @swagger
 * /api/cursos/{id}:
 *   get:
 *     summary: Detalle de un curso con sus módulos
 *     tags: [Cursos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del curso (id_curso)
 *     responses:
 *       200:
 *         description: Curso con módulos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/CursoDetalle'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  CursoController.getById
);

/**
 * @swagger
 * /api/cursos:
 *   post:
 *     summary: Crear un nuevo curso
 *     tags: [Cursos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, id_usuario]
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Introducción a Node.js
 *               descripcion:
 *                 type: string
 *                 example: Curso básico de desarrollo backend
 *               id_usuario:
 *                 type: string
 *                 format: uuid
 *                 example: c98d3456-0899-4ce7-ad4d-ed3f69095c77
 *     responses:
 *       201:
 *         description: Curso creado con activo = false
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Curso'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  CursoController.create
);

/**
 * @swagger
 * /api/cursos/{id}:
 *   put:
 *     summary: Actualizar datos de un curso
 *     tags: [Cursos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *               id_usuario:  { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Curso actualizado
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  CursoController.update
);

/**
 * @swagger
 * /api/cursos/{id}/activo:
 *   patch:
 *     summary: Activar o desactivar un curso
 *     tags: [Cursos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *               activo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Estado actualizado
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
  CursoController.toggleActivo
);

/**
 * @swagger
 * /api/cursos/{id}:
 *   delete:
 *     summary: Eliminar un curso (soft delete + cascada)
 *     tags: [Cursos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Curso eliminado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  CursoController.remove
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Curso:
 *       type: object
 *       properties:
 *         idCurso:       { type: string, format: uuid }
 *         idUsuario:     { type: string, format: uuid }
 *         titulo:        { type: string }
 *         descripcion:   { type: string, nullable: true }
 *         activo:        { type: boolean }
 *         modulosCount:  { type: integer }
 *         creacion:      { type: string, format: date-time }
 *         actualizacion: { type: string, format: date-time }
 *
 *     CursoDetalle:
 *       allOf:
 *         - $ref: '#/components/schemas/Curso'
 *         - type: object
 *           properties:
 *             modulos:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idModulo:        { type: string, format: uuid }
 *                   titulo:          { type: string }
 *                   descripcion:     { type: string, nullable: true }
 *                   activo:          { type: boolean }
 *                   orden:           { type: integer }
 *                   contenidosCount: { type: integer }
 *                   creacion:        { type: string, format: date-time }
 */

export default router;