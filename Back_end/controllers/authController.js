const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Contrôleur pour l'inscription d'un nouvel utilisateur
 */
const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const userExists = await db.query(
    'SELECT id FROM users WHERE email = $1', 
    [email]
  );
  
  if (userExists.rows.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'Un utilisateur avec cet email existe déjà'
    });
  }
  
  // Hasher le mot de passe
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // Créer l'utilisateur
  const newUser = await db.query(
    `INSERT INTO users (email, password_hash) 
     VALUES ($1, $2) 
     RETURNING id, email, created_at`,
    [email, hashedPassword]
  );
  
  // Générer le token JWT
  const token = jwt.sign(
    { userId: newUser.rows[0].id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    message: 'Utilisateur créé avec succès',
    data: {
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        createdAt: newUser.rows[0].created_at
      },
      token
    }
  });
});

/**
 * Contrôleur pour la connexion d'un utilisateur
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Trouver l'utilisateur
  const userResult = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  
  if (userResult.rows.length === 0) {
    return res.status(401).json({
      success: false,
      error: 'Email ou mot de passe incorrect'
    });
  }
  
  const user = userResult.rows[0];
  
  // Vérifier le mot de passe
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({
      success: false,
      error: 'Email ou mot de passe incorrect'
    });
  }
  
  // Générer le token JWT
  const token = jwt.sign(
    { userId: user.id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Connexion réussie',
    data: {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
      },
      token
    }
  });
});

/**
 * Contrôleur pour obtenir le profil de l'utilisateur connecté
 */
const getProfile = asyncHandler(async (req, res) => {
  const userResult = await db.query(
    `SELECT id, email, created_at 
     FROM users 
     WHERE id = $1`,
    [req.user.id]
  );

  const user = userResult.rows[0];

  // Compter le nombre de projets de l'utilisateur
  const projectsCount = await db.query(
    'SELECT COUNT(*) FROM projects WHERE user_id = $1',
    [req.user.id]
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        projectsCount: parseInt(projectsCount.rows[0].count)
      }
    }
  });
});

/**
 * Contrôleur pour mettre à jour le profil utilisateur
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Vérifier si le nouvel email est déjà utilisé
  if (email) {
    const emailExists = await db.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, req.user.id]
    );

    if (emailExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cet email est déjà utilisé par un autre utilisateur'
      });
    }
  }

  const updateFields = [];
  const updateValues = [];
  let paramCount = 1;

  if (email) {
    updateFields.push(`email = $${paramCount}`);
    updateValues.push(email);
    paramCount++;
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Aucune donnée à mettre à jour'
    });
  }

  updateValues.push(req.user.id);

  const updatedUser = await db.query(
    `UPDATE users 
     SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING id, email, created_at`,
    updateValues
  );

  res.json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: {
      user: updatedUser.rows[0]
    }
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};