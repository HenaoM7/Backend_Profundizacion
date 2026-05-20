import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { readJwtConfig } from '../config/auth.js';
import { findUserByCorreo, findUserById, sanitizeUser } from './userService.js';
import { query } from '../database/db.js';
import { processAccessArrays } from '../utils/accessTracking.js';

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

  // Procesar arrays de acceso: rotación, limpieza, y adición de nuevo timestamp
  const nuevosAccesos = processAccessArrays({
    accesos_mes_actual: user.accesos_mes_actual,
    accesos_mes_anterior: user.accesos_mes_anterior,
    accesos_ultimos_7dias: user.accesos_ultimos_7dias,
    ultimo_acceso: user.ultimo_acceso,
  });

  // Actualizar usuario con nuevo acceso y arrays actualizados
  await query(
    `UPDATE usuario 
     SET ultimo_acceso = NOW(),
         accesos_mes_actual = $1::jsonb,
         accesos_mes_anterior = $2::jsonb,
         accesos_ultimos_7dias = $3::jsonb,
         actualizacion = NOW()
     WHERE id_usuario = $4`,
    [
      JSON.stringify(nuevosAccesos.accesos_mes_actual),
      JSON.stringify(nuevosAccesos.accesos_mes_anterior),
      JSON.stringify(nuevosAccesos.accesos_ultimos_7dias),
      user.id_usuario,
    ]
  );

  // Recuperar usuario actualizado para incluir todos los datos
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