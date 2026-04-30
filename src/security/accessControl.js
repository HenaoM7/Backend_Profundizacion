export const rolePermissions = {
  SuperAdmin: [
    'usuarios.ver',
    'usuarios.crear',
    'usuarios.asignarRoles',
    'roles.ver',
    'permisos.ver',
    'sistema.personalizar',
    'competencias.gestionar',
    'parametros.globales.gestionar',
  ],
  Admin: ['usuarios.ver', 'usuarios.crear', 'roles.ver', 'permisos.ver'],
  Docente: ['contenido.crear', 'cursos.crear', 'cursos.asignar'],
  Estudiante: ['contenido.consumir', 'certificados.obtener'],
};

export const getPermissionsForRoles = (roles = []) => {
  return [...new Set(roles.flatMap((role) => rolePermissions[role] || []))].sort();
};