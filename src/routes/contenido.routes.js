// src/routes/contenido.routes.js
import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roleGuard.js';
import * as ContenidoController from '../controllers/contenido.controller.js';

// mergeParams: true para acceder a :moduloId desde el controller
const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Contenidos
 *   description: Gestión de contenidos dentro de un módulo — Equipo 1
 */

/**
 * @swagger
 * /api/modulos/{moduloId}/contenidos:
 *   get:
 *     summary: Listar contenidos de un módulo
 *     tags: [Contenidos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduloId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por activo/inactivo
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [video, texto, archivo, imagen]
 *         description: Filtrar por tipo de contenido
 *     responses:
 *       200:
 *         description: Lista de contenidos ordenados por orden ASC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contenido'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  ContenidoController.getAll
);

/**
 * @swagger
 * /api/modulos/{moduloId}/contenidos/{id}:
 *   get:
 *     summary: Detalle de un contenido
 *     tags: [Contenidos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduloId
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
 *         description: Detalle del contenido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Contenido'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ESTUDIANTE),
  ContenidoController.getById
);

/**
 * @swagger
 * /api/modulos/{moduloId}/contenidos:
 *   post:
 *     summary: Crear un contenido dentro de un módulo
 *     tags: [Contenidos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduloId
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
 *             required: [titulo, tipo, url_o_texto, orden]
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Video introductorio
 *               descripcion:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [video, texto, archivo, imagen]
 *                 example: video
 *               url_o_texto:
 *                 type: string
 *                 example: https://youtube.com/watch?v=ejemplo
 *               orden:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Contenido creado con activo = true
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
  ContenidoController.create
);

/**
 * @swagger
 * /api/modulos/{moduloId}/contenidos/{id}:
 *   put:
 *     summary: Actualizar un contenido
 *     tags: [Contenidos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduloId
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
 *               tipo:        { type: string, enum: [video, texto, archivo, imagen] }
 *               url_o_texto: { type: string }
 *               orden:       { type: integer }
 *               activo:      { type: boolean }
 *     responses:
 *       200:
 *         description: Contenido actualizado
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
  ContenidoController.update
);

/**
 * @swagger
 * /api/modulos/{moduloId}/contenidos/reorder:
 *   patch:
 *     summary: Reordenar contenidos de un módulo
 *     tags: [Contenidos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduloId
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
 *                   required: [id_contenido, orden]
 *                   properties:
 *                     id_contenido: { type: string, format: uuid }
 *                     orden:        { type: integer, example: 1 }
 *                 example:
 *                   - id_contenido: "c1000000-0000-0000-0000-000000000001"
 *                     orden: 2
 *                   - id_contenido: "c1000000-0000-0000-0000-000000000002"
 *                     orden: 1
 *     responses:
 *       200:
 *         description: Contenidos reordenados
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  '/reorder',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  ContenidoController.reorder
);

/**
 * @swagger
 * /api/modulos/{moduloId}/contenidos/{id}:
 *   delete:
 *     summary: Eliminar un contenido (soft delete)
 *     tags: [Contenidos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduloId
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
 *         description: Contenido eliminado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCENTE),
  ContenidoController.remove
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Contenido:
 *       type: object
 *       properties:
 *         idContenido:   { type: string, format: uuid }
 *         idModulo:      { type: string, format: uuid }
 *         titulo:        { type: string }
 *         descripcion:   { type: string, nullable: true }
 *         tipo:          { type: string, enum: [video, texto, archivo, imagen] }
 *         urlOTexto:     { type: string }
 *         orden:         { type: integer }
 *         activo:        { type: boolean }
 *         creacion:      { type: string, format: date-time }
 *         actualizacion: { type: string, format: date-time }
 */

export default router;