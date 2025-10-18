const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Modèle User pour les opérations CRUD sur les utilisateurs
 */
class User {
  /**
   * Trouver un utilisateur par son ID
   */
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, email, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'utilisateur: ${error.message}`);
    }
  }

  /**
   * Trouver un utilisateur par son email
   */
  static async findByEmail(email) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche par email: ${error.message}`);
    }
  }

  /**
   * Créer un nouvel utilisateur
   */
  static async create(userData) {
    const { email, password } = userData;
    
    try {
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const result = await db.query(
        `INSERT INTO users (email, password_hash) 
         VALUES ($1, $2) 
         RETURNING id, email, created_at`,
        [email, hashedPassword]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Violation de contrainte d'unicité
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }
  }

  /**
   * Vérifier le mot de passe
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  static async update(id, updateData) {
    const { email } = updateData;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    values.push(id);

    try {
      const result = await db.query(
        `UPDATE users 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING id, email, created_at`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Cet email est déjà utilisé par un autre utilisateur');
      }
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }
  }

  /**
   * Compter le nombre de projets d'un utilisateur
   */
  static async getProjectsCount(userId) {
    try {
      const result = await db.query(
        'SELECT COUNT(*) FROM projects WHERE user_id = $1',
        [userId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`Erreur lors du comptage des projets: ${error.message}`);
    }
  }

  /**
   * Vérifier si un email existe déjà
   */
  static async emailExists(email, excludeUserId = null) {
    try {
      let query = 'SELECT id FROM users WHERE email = $1';
      const params = [email];

      if (excludeUserId) {
        query += ' AND id != $2';
        params.push(excludeUserId);
      }

      const result = await db.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la vérification de l'email: ${error.message}`);
    }
  }

  /**
   * Obtenir les statistiques de l'utilisateur
   */
  static async getUserStats(userId) {
    try {
      const projectsCount = await db.getProjectsCount(userId);
      
      const analysesCount = await db.query(
        `SELECT COUNT(*) FROM analysis_results ar
         JOIN projects p ON ar.project_id = p.id
         WHERE p.user_id = $1`,
        [userId]
      );

      const recentActivity = await db.query(
        `SELECT 
           p.name as project_name,
           ar.analysis_date,
           ar.risk_level
         FROM analysis_results ar
         JOIN projects p ON ar.project_id = p.id
         WHERE p.user_id = $1
         ORDER BY ar.analysis_date DESC
         LIMIT 5`,
        [userId]
      );

      return {
        projects_count: projectsCount,
        analyses_count: parseInt(analysesCount.rows[0].count),
        recent_activity: recentActivity.rows
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }
}

module.exports = User;