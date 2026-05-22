import jwt from 'jsonwebtoken';
import { readJwtConfig } from '../config/auth.js';

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido. Formato: Bearer <token>',
    });
  }

  const token = authHeader.slice(7).trim();

  try {
    const { secret } = readJwtConfig();
    const decoded = jwt.verify(token, secret);

    // req.auth: payload completo del JWT (compatible con authMiddleware del equipo de auth)
    req.auth = decoded;

    // req.user: estructura normalizada que consumen nuestros controladores
    req.user = {
      userId: decoded.sub,
      name:   decoded.nombre,
      role:   decoded.roles?.[0] ?? '',
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado.',
    });
  }
};

export default authenticate;
