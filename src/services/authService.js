import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { readJwtConfig } from '../config/auth.js';
import { findUserByCorreo, findUserById, sanitizeUser } from './userService.js';
import { query } from '../database/db.js';

const buildTokenPayload = (user) => {
  const sanitizedUser = sanitizeUser(user);

  return {
    sub: sanitizedUser.id,
    correo: sanitizedUser.correo,
    nombre: sanitizedUser.nombre,
    roles: sanitizedUser.roles,
    permisos: sanitizedUser.permisos,
  };
};

export const login = async ({ correo, contrasena }) => {
  const user = await findUserByCorreo(correo);

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(contrasena, user.contrasena);

  if (!passwordMatches) {
    return null;
  }

  // Registrar último acceso
  await query('UPDATE usuario SET ultimo_acceso = NOW() WHERE id_usuario = $1', [user.id_usuario]);

  // Recuperar usuario actualizado para incluir ultimo_acceso
  const updatedUser = await findUserById(user.id_usuario);

  const { secret, expiresIn } = readJwtConfig();
  const token = jwt.sign(buildTokenPayload(updatedUser), secret, { expiresIn });
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  return {
    token,
    token_expires: expiresAt.toISOString(),
    user: sanitizeUser(updatedUser),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    return null;
  }

  return sanitizeUser(user);
};