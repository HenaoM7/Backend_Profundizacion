import jwt from 'jsonwebtoken';

import { readJwtConfig } from '../config/auth.js';

const unauthorizedResponse = (res, message) => {
  return res.status(401).json({ message });
};

export const authMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.toLowerCase().startsWith('bearer ')) {
    return unauthorizedResponse(res, 'Se requiere un token Bearer.');
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  try {
    const { secret } = readJwtConfig();
    req.auth = jwt.verify(token, secret);
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'El token es invalido o ya expiro.');
    }

    return next(error);
  }
};