import { getCurrentUser, login } from '../services/authService.js';
import { isValidEmail } from '../utils/validation.js';

export const loginUser = async (req, res, next) => {
  try {
    const correo = typeof req.body.correo === 'string' ? req.body.correo.trim() : '';
    const contrasena = typeof req.body.contrasena === 'string' ? req.body.contrasena : '';

    if (!correo || !contrasena) {
      return res.status(400).json({
        message: 'Correo y contrasena son obligatorios.',
      });
    }

    if (!isValidEmail(correo)) {
      return res.status(400).json({
        message: 'Correo debe tener un formato valido.',
      });
    }

    const session = await login({ correo, contrasena });

    if (!session) {
      return res.status(401).json({
        message: 'Credenciales invalidas.',
      });
    }

    return res.status(200).json(session);
  } catch (error) {
    return next(error);
  }
};

export const getAuthenticatedUser = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.auth.sub);

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};