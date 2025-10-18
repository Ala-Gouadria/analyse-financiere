const db = require('../config/database');

/**
 * Modèle Project pour les opérations CRUD sur les projets
 */
class Project {
  /**
   * Créer un nouveau projet
   */
  static async create(projectData) {
    const { userId, name, description } = projectData;
    
    try {
      const result = await db.query(
        `INSERT INTO projects (user_id, name, description) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, description, created_at`,
        [userId, name, description || '']
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la création du projet: ${error.message}`);
    }
  }

  /**
   * Trouver un projet par son ID avec vérification de propriété
   */
  static async findById(id, userId = null) {
    try {
      let query = `
        SELECT p.*, 
               COUNT(fd.id) as data_count,
               MAX(fd.period) as last_data_date
        FROM projects p
        LEFT JOIN financial_data fd ON p.id = fd.project_id
        WHERE p.id = $1
      `;
      const params = [id];

      if (userId) {
        query += ' AND p.user_id = $2';
        params.push(userId);
      }

      query += ' GROUP BY p.id';

      const result = await db.query(query, params);
      const project = result.rows[0];

      if (project) {
        project.data_count = parseInt(project.data_count);
        project.has_data = project.data_count > 0;
      }

      return project || null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du projet: ${error.message}`);
    }
  }

  /**
   * Trouver tous les projets d'un utilisateur
   */
  static async findByUserId(userId, options = {}) {
    const { limit, offset, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    
    try {
      let query = `
        SELECT p.*, 
               COUNT(fd.id) as data_count,
               MAX(fd.period) as last_data_date,
               (SELECT risk_level FROM analysis_results 
                WHERE project_id = p.id 
                ORDER BY analysis_date DESC 
                LIMIT 1) as latest_risk_level
        FROM projects p
        LEFT JOIN financial_data fd ON p.id = fd.project_id
        WHERE p.user_id = $1
        GROUP BY p.id
        ORDER BY p.${sortBy} ${sortOrder}
      `;
      
      const params = [userId];

      if (limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(limit);
      }

      if (offset) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(offset);
      }

      const result = await db.query(query, params);
      
      return result.rows.map(project => ({
        ...project,
        data_count: parseInt(project.data_count),
        has_data: project.data_count > 0
      }));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des projets: ${error.message}`);
    }
  }

  /**
   * Mettre à jour un projet
   */
  static async update(id, userId, updateData) {
    const { name, description } = updateData;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    values.push(id, userId);

    try {
      const result = await db.query(
        `UPDATE projects 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
         RETURNING id, name, description, created_at`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du projet: ${error.message}`);
    }
  }

  /**
   * Supprimer un projet
   */
  static async delete(id, userId) {
    try {
      const result = await db.query(
        'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id, name',
        [id, userId]
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du projet: ${error.message}`);
    }
  }

  /**
   * Compter le nombre total de projets d'un utilisateur
   */
  static async countByUserId(userId) {
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
   * Obtenir les projets récemment modifiés
   */
  static async getRecentProjects(userId, limit = 5) {
    try {
      const result = await db.query(
        `SELECT p.*, 
                COUNT(fd.id) as data_count,
                MAX(ar.analysis_date) as last_analysis_date
         FROM projects p
         LEFT JOIN financial_data fd ON p.id = fd.project_id
         LEFT JOIN analysis_results ar ON p.id = ar.project_id
         WHERE p.user_id = $1
         GROUP BY p.id
         ORDER BY GREATEST(p.created_at, p.updated_at, MAX(ar.analysis_date)) DESC
         LIMIT $2`,
        [userId, limit]
      );
      
      return result.rows.map(project => ({
        ...project,
        data_count: parseInt(project.data_count),
        has_data: project.data_count > 0
      }));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des projets récents: ${error.message}`);
    }
  }

  /**
   * Vérifier si l'utilisateur est propriétaire du projet
   */
  static async isOwner(projectId, userId) {
    try {
      const result = await db.query(
        'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
        [projectId, userId]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la vérification de propriété: ${error.message}`);
    }
  }
}

module.exports = Project;