export const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);

  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  res.status(statusCode).json({
    error: isServerError ? 'Error interno del servidor' : err.message,
    ...(isServerError && process.env.NODE_ENV !== 'production' && err.message
      ? { details: err.message }
      : {}),
  });
};