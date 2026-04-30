export const readJwtConfig = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const error = new Error('Falta configurar JWT_SECRET en el entorno.');
    error.statusCode = 500;
    throw error;
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  };
};