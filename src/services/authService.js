import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { readJwtConfig } from '../config/auth.js';
import { findUserByCorreo, findUserById, sanitizeUser } from './userService.js';

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

  const { secret, expiresIn } = readJwtConfig();
  const token = jwt.sign(buildTokenPayload(user), secret, { expiresIn });
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  return {
    token,
    token_expires: expiresAt.toISOString(),
    user: sanitizeUser(user),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    return null;
  }

  return sanitizeUser(user);
};