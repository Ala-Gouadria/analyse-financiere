// Middleware global de gestion des erreurs

/**
 * Classe d'erreur personnalisée pour l'application
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Gestionnaire d'erreurs global
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log l'erreur pour le développement
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Erreur:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  } else {
    console.error('🚨 Erreur:', err.message);
  }

  // Erreurs MongoDB/Mongoose (au cas où tu changes de BDD plus tard)
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée - ID invalide';
    error = new AppError(message, 404);
  }

  // Duplication de clé (violation d'unicité)
  if (err.code === '23505') {
    const message = 'Une ressource avec ces données existe déjà';
    error = new AppError(message, 400);
  }

  // Violation de contrainte de clé étrangère
  if (err.code === '23503') {
    const message = 'Référence à une ressource inexistante';
    error = new AppError(message, 400);
  }

  // Validation error (Joi ou autre)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = `Données d'entrée invalides: ${messages.join(', ')}`;
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token JWT invalide';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token JWT expiré';
    error = new AppError(message, 401);
  }

  // Erreur de syntaxe JSON
  if (err.type === 'entity.parse.failed') {
    const message = 'JSON mal formé dans le corps de la requête';
    error = new AppError(message, 400);
  }

  // Réponse à l'utilisateur
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: err.details
    })
  });
};

/**
 * Middleware pour les routes non trouvées
 */
const notFound = (req, res, next) => {
  const error = new AppError(
    `Route non trouvée - ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Wrapper async/await pour éviter les try/catch répétitifs
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  AppError
};