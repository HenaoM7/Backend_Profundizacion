import { Router } from 'express';

import { getAuthenticatedUser, loginUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesion con correo y contrasena.
 *     tags: [Autenticacion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, contrasena]
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesion iniciada correctamente.
 *       401:
 *         description: Credenciales invalidas.
 */
router.post('/login', loginUser);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Devuelve el usuario autenticado.
 *     tags: [Autenticacion]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado.
 *       401:
 *         description: Token invalido o ausente.
 */
router.get('/me', authMiddleware, getAuthenticatedUser);

export default router;