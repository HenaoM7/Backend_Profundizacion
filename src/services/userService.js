import bcrypt from 'bcryptjs';

import { findActiveRolesByNames } from '../models/roleModel.js';
import {
  createUser as createUserRecord,
  findUserByCorreo as findUserByCorreoRecord,
  findUserById as findUserByIdRecord,
  listUsers as listUserRecords,
  updateUser as updateUserRecord,
  deactivateUser as deactivateUserRecord,
  activateUser as activateUserRecord,
} from '../models/userModel.js';
import { getPermissionsForRoles } from '../security/accessControl.js';
import { generateEntityId } from '../utils/idGenerator.js';
import { canAssignAllRoles } from './roleService.js';

export const sanitizeUser = (user) => {
  const roles = user.roles || [];

  return {
    id: user.id_usuario,
    nombre: user.nombre,
    correo: user.correo,
    activo: user.activo,
    creadoPor: user.creado_por || null,
    roles,
    permisos: getPermissionsForRoles(roles),
    creacion: user.creacion,
    actualizacion: user.actualizacion,
    ultimoAcceso: user.ultimo_acceso || null,
    accesosMesActual: user.accesos_mes_actual || [],
    accesosMesAnterior: user.accesos_mes_anterior || [],
    accesosUltimos7dias: user.accesos_ultimos_7dias || [],
  };
};

export const findUserByCorreo = async (correo, options) => {
  return findUserByCorreoRecord(correo, options);
};

export const findUserById = async (id, options) => {
  return findUserByIdRecord(id, options);
};

export const listUsers = async (filters = {}) => {
  const users = await listUserRecords(filters);
  return users.map(sanitizeUser);
};

export const createUser = async ({ nombre, correo, contrasena, roleNames, actorRoles, actorId }) => {
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
    createdBy: actorId,
    roleIds: roles.map((role) => role.id_rol),
  });

  const createdUser = await findUserById(userId, { onlyActive: false });

  return {
    user: sanitizeUser(createdUser),
  };
};

export const updateUser = async ({ id, nombre, roleNames, contrasena, actorRoles }) => {
  // Verificar que el actor es Admin o SuperAdmin
  const canModifyUser = actorRoles.includes('Admin') || actorRoles.includes('SuperAdmin');
  if (!canModifyUser) {
    return { errorCode: 'USER_EDIT_NOT_ALLOWED' };
  }

  // Verificar que el usuario existe
  const targetUser = await findUserById(id, { onlyActive: false });

  if (!targetUser) {
    return { errorCode: 'USER_NOT_FOUND' };
  }

  // PROTECCIÓN: No permitir editar SuperAdmin
  const isSuperAdmin = targetUser.roles && targetUser.roles.includes('SuperAdmin');
  if (isSuperAdmin) {
    return { errorCode: 'CANNOT_MODIFY_SUPERADMIN' };
  }

  let passwordHash;
  if (contrasena !== undefined) {
    passwordHash = await bcrypt.hash(contrasena, 10);
  }

  let roleIds;
  if (roleNames && roleNames.length > 0) {
    if (!canAssignAllRoles(actorRoles, roleNames)) {
      return { errorCode: 'ROLE_ASSIGNMENT_NOT_ALLOWED' };
    }

    const roles = await findActiveRolesByNames(roleNames);
    if (roles.length !== roleNames.length) {
      return { errorCode: 'INVALID_ROLES' };
    }

    roleIds = roles.map((role) => role.id_rol);
  }

  await updateUserRecord({
    id,
    nombre,
    roleIds,
    passwordHash,
  });

  const updatedUser = await findUserById(id, { onlyActive: false });

  return {
    user: sanitizeUser(updatedUser),
  };
};

export const deactivateUser = async (id) => {
  // Verificar que el usuario existe
  const targetUser = await findUserById(id, { onlyActive: false });

  if (!targetUser) {
    return { errorCode: 'USER_NOT_FOUND' };
  }

  // PROTECCIÓN: No permitir desactivar SuperAdmin
  const isSuperAdmin = targetUser.roles && targetUser.roles.includes('SuperAdmin');
  if (isSuperAdmin) {
    return { errorCode: 'CANNOT_DEACTIVATE_SUPERADMIN' };
  }

  await deactivateUserRecord(id);

  return { success: true };
};

export const activateUser = async (id) => {
  // Verificar que el usuario existe
  const targetUser = await findUserById(id, { onlyActive: false });

  if (!targetUser) {
    return { errorCode: 'USER_NOT_FOUND' };
  }

  // PROTECCIÓN: No permitir activar SuperAdmin (aunque técnicamente no debería estar desactivado)
  const isSuperAdmin = targetUser.roles && targetUser.roles.includes('SuperAdmin');
  if (isSuperAdmin) {
    return { errorCode: 'CANNOT_ACTIVATE_SUPERADMIN' };
  }

  await activateUserRecord(id);

  return { success: true };
};

export const setUserActiveStatus = async (id, activo, actorRoles = []) => {
  const canModifyUser = actorRoles.includes('Admin') || actorRoles.includes('SuperAdmin');
  if (!canModifyUser) {
    return { errorCode: 'USER_EDIT_NOT_ALLOWED' };
  }

  const targetUser = await findUserById(id, { onlyActive: false });

  if (!targetUser) {
    return { errorCode: 'USER_NOT_FOUND' };
  }

  const isSuperAdmin = targetUser.roles && targetUser.roles.includes('SuperAdmin');
  if (isSuperAdmin) {
    return { errorCode: activo ? 'CANNOT_ACTIVATE_SUPERADMIN' : 'CANNOT_DEACTIVATE_SUPERADMIN' };
  }

  if (activo) {
    await activateUserRecord(id);
    return { success: true, activo: true };
  }

  await deactivateUserRecord(id);
  return { success: true, activo: false };
};