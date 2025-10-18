const express = require('express');
const router = express.Router();

// Import des routes
const authRoutes = require('./auth');
const projectRoutes = require('./projects');
const analysisRoutes = require('./analysis');
const reportRoutes = require('./reports');

/**
 * @route   GET /api/health
 * @desc    Vérifier l'état de l'API
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Analyse Financière est opérationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * @route   GET /api
 * @desc    Route racine de l'API
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API d\'Analyse Financière',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      analysis: '/api/analysis',
      reports: '/api/reports',
      health: '/api/health'
    },
    documentation: 'Voir la documentation pour plus de détails'
  });
});

// Utilisation des routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/analysis', analysisRoutes);
router.use('/reports', reportRoutes);

// Route fallback pour les endpoints non trouvés
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint non trouvé: ${req.method} ${req.originalUrl}`,
    suggestion: 'Vérifiez la documentation de l\'API'
  });
});

module.exports = router;