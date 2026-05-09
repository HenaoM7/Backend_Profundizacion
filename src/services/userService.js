import bcrypt from 'bcryptjs';

import { findActiveRolesByNames } from '../models/roleModel.js';
import {
  createUser as createUserRecord,
  findUserByCorreo as findUserByCorreoRecord,
  findUserById as findUserByIdRecord,
  listUsers as listUserRecords,
} from '../models/userModel.js';
import { getPermissionsForRoles } from '../security/accessControl.js';
import { generateEntityId } from '../utils/idGenerator.js';
import { canAssignAllRoles } from './roleService.js';

export const sanitizeUser = (user) => {
  const roles = user.roles || [];

  return {
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    activo: user.activo,
    roles,
    permisos: getPermissionsForRoles(roles),
    creacion: user.creacion,
    actualizacion: user.actualizacion,
  };
};

export const findUserByCorreo = async (correo, options) => {
  return findUserByCorreoRecord(correo, options);
};

export const findUserById = async (id, options) => {
  return findUserByIdRecord(id, options);
};

export const listUsers = async () => {
  const users = await listUserRecords();
  return users.map(sanitizeUser);
};

export const createUser = async ({ nombre, correo, contrasena, roleNames, actorRoles }) => {
  if (!canAssignAllRoles(actorRoles, roleNames)) {
    return { errorCode: 'ROLE_ASSIGNMENT_NOT_ALLOWED' };
  }

  const duplicatedUser = await findUserByCorreo(correo, { onlyActive: false });

  if (duplicatedUser) {
    return { errorCode: 'EMAIL_ALREADY_EXISTS' };
  }

  const roles = await findActiveRolesByNames(roleNames);

  if (roles.length !== roleNames.length) {
    return { errorCode: 'INVALID_ROLES' };
  }

  const userId = generateEntityId('USR');
  const passwordHash = await bcrypt.hash(contrasena, 10);

  await createUserRecord({
    id: userId,
    nombre,
    correo,
    passwordHash,
    roleIds: roles.map((role) => role.id),
  });

  const createdUser = await findUserById(userId, { onlyActive: false });

  return {
    user: sanitizeUser(createdUser),
  };
};