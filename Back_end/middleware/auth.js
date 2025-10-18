const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware d'authentification JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token d\'accès requis. Veuillez vous connecter.' 
      });
    }

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours en base
    const userResult = await db.query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé. Token invalide.'
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = userResult.rows[0];
    next();
    
  } catch (error) {
    console.error('Erreur d\'authentification:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Token invalide.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Token expiré. Veuillez vous reconnecter.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du token.'
    });
  }
};

// Middleware pour vérifier la propriété du projet
const checkProjectOwnership = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const userId = req.user.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'ID du projet requis.'
      });
    }

    // Vérifier que l'utilisateur est bien propriétaire du projet
    const projectResult = await db.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Projet non trouvé ou accès non autorisé.'
      });
    }

    req.projectId = projectId;
    next();
    
  } catch (error) {
    console.error('Erreur vérification propriété projet:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification des droits d\'accès.'
    });
  }
};

// Middleware pour les rôles administrateur (extension future)
const requireAdmin = (req, res, next) => {
  // Pour l'instant, tous les utilisateurs authentifiés ont accès
  // Peut être étendu plus tard pour gérer les rôles
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Accès administrateur requis.'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  checkProjectOwnership,
  requireAdmin
};