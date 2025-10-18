const express = require('express');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', validate(schemas.register), register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', validate(schemas.login), login);

/**
 * @route   GET /api/auth/profile
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Mettre à jour le profil de l'utilisateur
 * @access  Private
 */
router.put('/profile', authenticateToken, updateProfile);

module.exports = router;