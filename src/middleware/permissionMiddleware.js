import { getPermissionsForRoles } from '../security/accessControl.js';

export const authorizePermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const grantedPermissions = req.auth?.permisos?.length
      ? req.auth.permisos
      : getPermissionsForRoles(req.auth?.roles || []);

    const hasAllPermissions = requiredPermissions.every((permission) => {
      return grantedPermissions.includes(permission);
    });

    if (!hasAllPermissions) {
      return res.status(403).json({
        message: 'No tienes permisos para realizar esta accion.',
      });
    }

    req.auth.permisos = grantedPermissions;
    return next();
  };
};
