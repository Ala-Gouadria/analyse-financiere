const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticateToken, checkProjectOwnership } = require('../middleware/auth');
const {
  exportFinancialData,
  exportAnalysisReport,
  generatePerformanceReport
} = require('../controllers/reportController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/reports/export-financial-data
 * @desc    Exporter les données financières en CSV/Excel
 * @access  Private
 */
router.post('/export-financial-data', exportFinancialData);

/**
 * @route   POST /api/reports/export-analysis
 * @desc    Exporter un rapport d'analyse
 * @access  Private
 */
router.post('/export-analysis', exportAnalysisReport);

/**
 * @route   POST /api/reports/performance
 * @desc    Générer un rapport de performance
 * @access  Private
 */
router.post('/performance', generatePerformanceReport);

module.exports = router;