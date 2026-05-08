export const errorHandler = (err, req, res, next) => {
  const status  = err.status  || 500;
  const message = err.message || 'Error interno del servidor';

  if (status === 500) {
    console.error('[ErrorHandler]', err.stack);
  }

  res.status(status).json({ success: false, message });
};
