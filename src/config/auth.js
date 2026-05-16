export const readJwtConfig = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const error = new Error('Falta configurar JWT_SECRET en el entorno.');
    error.statusCode = 401;
    throw error;
  }

  const defaultExpiresInSeconds = 24 * 60 * 60; // 24 horas
  const expiresInEnv = process.env.JWT_EXPIRES_IN;
  const expiresIn = expiresInEnv && !Number.isNaN(Number(expiresInEnv))
    ? Number(expiresInEnv)
    : defaultExpiresInSeconds;

  return {
    secret,
    expiresIn,
  };
};