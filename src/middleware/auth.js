import { MOCK_TOKENS } from '../config/constants.js';

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido. Formato: Bearer <token>',
    });
  }

  const token = authHeader.slice(7).trim();
  const user  = MOCK_TOKENS[token];

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado.',
    });
  }

  req.user = user;
  next();
};

export default authenticate;
