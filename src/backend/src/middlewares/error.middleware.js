const env = require("../config/env");

// Clase para errores esperados (4xx) que los servicios/controladores pueden lanzar directamente.
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: "Ruta no encontrada" });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: statusCode === 500 ? "Error interno del servidor" : err.message,
    // El stack solo se expone en desarrollo, nunca en producción.
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
