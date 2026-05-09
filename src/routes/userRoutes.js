import { Router } from 'express';

import {
  listSystemUsers,
  registerUser,
  getUser,
  editUser,
  setUserActiveStatusEndpoint,
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizePermissions } from '../middleware/permissionMiddleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Lista los usuarios del sistema.
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtra usuarios por nombre parcial.
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha mínima de creación (inclusive).
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha máxima de creación (inclusive).
 *     responses:
 *       200:
 *         description: Usuarios cargados correctamente.
 *       403:
 *         description: El usuario no tiene permisos.
 */
router.get('/', authorizePermissions(['usuarios.ver']), listSystemUsers);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Crea un usuario con uno o varios roles permitidos.
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, contrasena, roles]
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *                 format: email
 *               contrasena:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *       400:
 *         description: Datos invalidos.
 *       403:
 *         description: Roles no autorizados.
 *       409:
 *         description: Correo duplicado.
 */
router.post('/', authorizePermissions(['usuarios.crear']), registerUser);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Obtiene un usuario específico por ID.
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *       404:
 *         description: Usuario no encontrado.
 */
router.get('/:id', authorizePermissions(['usuarios.ver']), getUser);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Edita un usuario (nombre y/o roles). SuperAdmin no puede ser editado.
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *       400:
 *         description: Datos invalidos.
 *       403:
 *         description: No tienes permisos o usuario es SuperAdmin.
 *       404:
 *         description: Usuario no encontrado.
 */
router.put('/:id', authorizePermissions(['usuarios.editar']), editUser);

/**
 * @openapi
 * /api/users/{id}/activo:
 *   patch:
 *     summary: Activa o desactiva un usuario según el valor de "activo".
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Estado de Usuario actualizado correctamente.
 *       400:
 *         description: Datos invalidos.
 *       403:
 *         description: No tienes permisos o usuario es SuperAdmin.
 *       404:
 *         description: Usuario no encontrado.
 */
router.patch('/:id/activo', authorizePermissions(['usuarios.eliminar']), setUserActiveStatusEndpoint);

export default router;