import { listRoles as listRoleRows } from '../models/roleModel.js';
import { rolePermissions } from '../security/accessControl.js';

const assignableRolesByActor = {
  SuperAdmin: ['Admin', 'Docente', 'Estudiante'],
  Admin: ['Admin','Docente', 'Estudiante'],
};

export const getAssignableRoleNames = (actorRoles = []) => {
  return [...new Set(actorRoles.flatMap((role) => assignableRolesByActor[role] || []))].sort();
};

export const canAssignAllRoles = (actorRoles = [], requestedRoleNames = []) => {
  if (requestedRoleNames.length === 0) {
    return false;
  }

  const assignableRoleNames = getAssignableRoleNames(actorRoles);

  return requestedRoleNames.every((roleName) => assignableRoleNames.includes(roleName));
};

export const listRoles = async (actorRoles = []) => {
  const assignableRoleNames = getAssignableRoleNames(actorRoles);
  const roles = await listRoleRows();

  return roles.map((role) => ({
    ...role,
    permisos: rolePermissions[role.nombre] || [],
    sePuedeAsignar: assignableRoleNames.includes(role.nombre),
  }));
};