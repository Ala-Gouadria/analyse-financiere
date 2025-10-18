const express = require('express');
const { validate, validateParams, schemas } = require('../middleware/validation');
const { authenticateToken, checkProjectOwnership } = require('../middleware/auth');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/projects
 * @desc    Créer un nouveau projet
 * @access  Private
 */
router.post('/', validate(schemas.project), createProject);

/**
 * @route   GET /api/projects
 * @desc    Récupérer tous les projets de l'utilisateur
 * @access  Private
 */
router.get('/', getProjects);

/**
 * @route   GET /api/projects/:projectId
 * @desc    Récupérer un projet spécifique
 * @access  Private
 */
router.get('/:projectId', checkProjectOwnership, getProject);

/**
 * @route   PUT /api/projects/:projectId
 * @desc    Mettre à jour un projet
 * @access  Private
 */
router.put('/:projectId', checkProjectOwnership, validate(schemas.project), updateProject);

/**
 * @route   DELETE /api/projects/:projectId
 * @desc    Supprimer un projet
 * @access  Private
 */
router.delete('/:projectId', checkProjectOwnership, deleteProject);

// Routes pour les données financières (COMMENTÉES POUR L'INSTANT)
// Ces routes seront activées quand le contrôleur sera créé

/**
 * @route   POST /api/projects/:projectId/financial-data
 * @desc    Ajouter des données financières à un projet
 * @access  Private
 */
// router.post('/:projectId/financial-data', checkProjectOwnership, validate(schemas.financialData), addFinancialData);

/**
 * @route   GET /api/projects/:projectId/financial-data
 * @desc    Récupérer les données financières d'un projet
 * @access  Private
 */
// router.get('/:projectId/financial-data', checkProjectOwnership, getFinancialData);

module.exports = router;