import { createUser, listUsers } from '../services/userService.js';
import { isValidEmail } from '../utils/validation.js';

const normalizeRoleNames = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((role) => typeof role === 'string' && role.trim()))];
};

export const listSystemUsers = async (_req, res, next) => {
  try {
    const users = await listUsers();
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