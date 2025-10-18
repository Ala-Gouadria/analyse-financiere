const express = require('express');
const { validate, validateParams, schemas } = require('../middleware/validation');
const { authenticateToken, checkProjectOwnership } = require('../middleware/auth');
const {
  analyzeFinancialData,
  getAnalysisHistory,
  getAnalysis
} = require('../controllers/analysisController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/analysis/analyze
 * @desc    Lancer une analyse financière avec Gemini AI
 * @access  Private
 */
router.post('/analyze', validate(schemas.analysis), analyzeFinancialData);

/**
 * @route   GET /api/analysis/project/:projectId
 * @desc    Récupérer l'historique des analyses d'un projet
 * @access  Private
 */
router.get('/project/:projectId', checkProjectOwnership, getAnalysisHistory);

/**
 * @route   GET /api/analysis/:analysisId
 * @desc    Récupérer une analyse spécifique
 * @access  Private
 */
router.get('/:analysisId', getAnalysis);

module.exports = router;