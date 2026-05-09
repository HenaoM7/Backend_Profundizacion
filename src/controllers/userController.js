import { createUser, listUsers, findUserById, updateUser, setUserActiveStatus } from '../services/userService.js';
import { isValidEmail } from '../utils/validation.js';

const normalizeRoleNames = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((role) => typeof role === 'string' && role.trim()))];
};

export const listSystemUsers = async (req, res, next) => {
  try {
    const { nombre, fechaDesde, fechaHasta } = req.query;

    const filters = {
      nombre: typeof nombre === 'string' ? nombre.trim() : undefined,
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
    };

    const users = await listUsers(filters);
    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const nombre = typeof req.body.nombre === 'string' ? req.body.nombre.trim() : '';
    const correo = typeof req.body.correo === 'string' ? req.body.correo.trim() : '';
    const contrasena = typeof req.body.contrasena === 'string' ? req.body.contrasena : '';
    const roleNames = normalizeRoleNames(req.body.roles);

    if (!nombre || !correo || !contrasena || roleNames.length === 0) {
      return res.status(400).json({
        message: 'Nombre, correo, contrasena y al menos un rol son obligatorios.',
      });
    }

    if (!isValidEmail(correo)) {
      return res.status(400).json({
        message: 'Correo debe tener un formato valido.',
      });
    }

    if (contrasena.length < 8) {
      return res.status(400).json({
        message: 'Contrasena debe tener al menos 8 caracteres.',
      });
    }

    const result = await createUser({
      nombre,
      correo,
      contrasena,
      roleNames,
      actorRoles: req.auth.roles || [],
    });

    if (result.errorCode === 'ROLE_ASSIGNMENT_NOT_ALLOWED') {
      return res.status(403).json({
        message: 'No puedes asignar uno o mas roles seleccionados.',
      });
    }

    if (result.errorCode === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese correo.',
      });
    }

    if (result.errorCode === 'INVALID_ROLES') {
      return res.status(400).json({
        message: 'Uno o mas roles no existen o estan inactivos.',
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await findUserById(id, { onlyActive: false });

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });
    }

    // Importar sanitizeUser desde el servicio
    const { sanitizeUser: sanitize } = await import('../services/userService.js');
    return res.status(200).json({ user: sanitize(user) });
  } catch (error) {
    return next(error);
  }
};

export const editUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, roles } = req.body;

    // Validar que se proporcione algo
    if (!nombre && (!roles || roles.length === 0)) {
      return res.status(400).json({
        message: 'Debes proporcionar nombre o roles a actualizar.',
      });
    }

    // Validar nombre
    if (nombre && typeof nombre !== 'string') {
      return res.status(400).json({
        message: 'El nombre debe ser una cadena de texto.',
      });
    }

    if (nombre && !nombre.trim()) {
      return res.status(400).json({
        message: 'El nombre no puede estar vacío.',
      });
    }

    // Normalizar roles
    const roleNames = Array.isArray(roles)
      ? [...new Set(roles.filter((role) => typeof role === 'string' && role.trim()))]
      : [];

    const result = await updateUser({
      id,
      nombre: nombre ? nombre.trim() : undefined,
      roleNames,
      actorRoles: req.auth?.roles || [],
    });

    if (result.errorCode === 'USER_NOT_FOUND') {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });
    }

    if (result.errorCode === 'CANNOT_MODIFY_SUPERADMIN') {
      return res.status(403).json({
        message: 'No puedes editar el usuario SuperAdmin.',
      });
    }

    if (result.errorCode === 'ROLE_ASSIGNMENT_NOT_ALLOWED') {
      return res.status(403).json({
        message: 'No tienes permisos para asignar uno o más roles seleccionados.',
      });
    }

    if (result.errorCode === 'INVALID_ROLES') {
      return res.status(400).json({
        message: 'Uno o más roles no existen o están inactivos.',
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const setUserActiveStatusEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({
        message: 'El campo activo debe ser true o false.',
      });
    }

    const result = await setUserActiveStatus(id, activo);

    if (result.errorCode === 'USER_NOT_FOUND') {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });
    }

    if (result.errorCode === 'CANNOT_DEACTIVATE_SUPERADMIN') {
      return res.status(403).json({
        message: 'No puedes desactivar el usuario SuperAdmin.',
      });
    }

    if (result.errorCode === 'CANNOT_ACTIVATE_SUPERADMIN') {
      return res.status(403).json({
        message: 'No puedes activar el usuario SuperAdmin.',
      });
    }

    return res.status(200).json({
      message: result.activo ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.',
      activo: result.activo,
    });
  } catch (error) {
    return next(error);
  }
};