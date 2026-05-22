import { ROLES } from '../config/constants.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }

    // Soporta roles como array (JWT real) o string singular (compatibilidad)
    const userRoles = Array.isArray(req.auth?.roles) ? req.auth.roles : [req.user.role];
    const hasRole   = allowedRoles.some(r => userRoles.includes(r));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Rol requerido: ${allowedRoles.join(' o ')}.`,
      });
    }
    next();
  };
};

export { ROLES };
