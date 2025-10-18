const db = require('../config/database');

/**
 * Modèle AnalysisResult pour les opérations sur les résultats d'analyse
 */
class AnalysisResult {
  /**
   * Créer un nouveau résultat d'analyse
   */
  static async create(analysisData) {
    const { projectId, summary, risks, recommendations, gemini_response, risk_level } = analysisData;
    
    try {
      const result = await db.query(
        `INSERT INTO analysis_results 
         (project_id, summary, risks, recommendations, gemini_response, risk_level) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [projectId, summary, JSON.stringify(risks || []), JSON.stringify(recommendations || []), gemini_response, risk_level]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23503') { // Violation de clé étrangère
        throw new Error('Projet non trouvé');
      }
      throw new Error(`Erreur lors de la création de l'analyse: ${error.message}`);
    }
  }

  /**
   * Récupérer les analyses d'un projet
   */
  static async findByProjectId(projectId, options = {}) {
    const { limit, offset, sortBy = 'analysis_date', sortOrder = 'DESC' } = options;
    
    try {
      let query = `
        SELECT * FROM analysis_results 
        WHERE project_id = $1
        ORDER BY ${sortBy} ${sortOrder}
      `;
      const params = [projectId];

      if (limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(limit);
      }

      if (offset) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(offset);
      }

      const result = await db.query(query, params);
      
      // Parser les données JSON stockées
      return result.rows.map(row => ({
        ...row,
        risks: typeof row.risks === 'string' ? JSON.parse(row.risks) : row.risks,
        recommendations: typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : row.recommendations
      }));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des analyses: ${error.message}`);
    }
  }

  /**
   * Récupérer une analyse par son ID
   */
  static async findById(id, userId = null) {
    try {
      let query = `
        SELECT ar.*, p.name as project_name, p.user_id
        FROM analysis_results ar
        JOIN projects p ON ar.project_id = p.id
        WHERE ar.id = $1
      `;
      const params = [id];

      if (userId) {
        query += ' AND p.user_id = $2';
        params.push(userId);
      }

      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
        return null;
      }

      const analysis = result.rows[0];
      
      // Parser les données JSON stockées
      return {
        ...analysis,
        risks: typeof analysis.risks === 'string' ? JSON.parse(analysis.risks) : analysis.risks,
        recommendations: typeof analysis.recommendations === 'string' ? JSON.parse(analysis.recommendations) : analysis.recommendations
      };
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'analyse: ${error.message}`);
    }
  }

  /**
   * Récupérer la dernière analyse d'un projet
   */
  static async findLatestByProjectId(projectId) {
    try {
      const result = await db.query(
        `SELECT * FROM analysis_results 
         WHERE project_id = $1 
         ORDER BY analysis_date DESC 
         LIMIT 1`,
        [projectId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }

      const analysis = result.rows[0];
      
      return {
        ...analysis,
        risks: typeof analysis.risks === 'string' ? JSON.parse(analysis.risks) : analysis.risks,
        recommendations: typeof analysis.recommendations === 'string' ? JSON.parse(analysis.recommendations) : analysis.recommendations
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la dernière analyse: ${error.message}`);
    }
  }

  /**
   * Supprimer une analyse
   */
  static async delete(id, projectId) {
    try {
      const result = await db.query(
        'DELETE FROM analysis_results WHERE id = $1 AND project_id = $2 RETURNING id, analysis_date',
        [id, projectId]
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'analyse: ${error.message}`);
    }
  }

  /**
   * Compter le nombre d'analyses d'un projet
   */
  static async countByProjectId(projectId) {
    try {
      const result = await db.query(
        'SELECT COUNT(*) FROM analysis_results WHERE project_id = $1',
        [projectId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`Erreur lors du comptage des analyses: ${error.message}`);
    }
  }

  /**
   * Obtenir les statistiques d'analyse d'un projet
   */
  static async getAnalysisStats(projectId) {
    try {
      const riskDistribution = await db.query(
        `SELECT 
           risk_level,
           COUNT(*) as count
         FROM analysis_results 
         WHERE project_id = $1
         GROUP BY risk_level
         ORDER BY count DESC`,
        [projectId]
      );

      const recentAnalyses = await db.query(
        `SELECT 
           analysis_date,
           risk_level,
           LENGTH(summary) as summary_length
         FROM analysis_results 
         WHERE project_id = $1
         ORDER BY analysis_date DESC
         LIMIT 10`,
        [projectId]
      );

      return {
        risk_distribution: riskDistribution.rows,
        recent_analyses: recentAnalyses.rows,
        total_analyses: await this.countByProjectId(projectId)
      };
    } catch (error) {
      throw new Error(`Erreur lors du calcul des statistiques d'analyse: ${error.message}`);
    }
  }

  /**
   * Rechercher dans les analyses
   */
  static async search(projectId, searchTerm) {
    try {
      const result = await db.query(
        `SELECT * FROM analysis_results 
         WHERE project_id = $1 
         AND (summary ILIKE $2 OR risks::text ILIKE $2 OR recommendations::text ILIKE $2)
         ORDER BY analysis_date DESC`,
        [projectId, `%${searchTerm}%`]
      );
      
      return result.rows.map(row => ({
        ...row,
        risks: typeof row.risks === 'string' ? JSON.parse(row.risks) : row.risks,
        recommendations: typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : row.recommendations
      }));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche dans les analyses: ${error.message}`);
    }
  }

  /**
   * Obtenir l'historique des niveaux de risque
   */
  static async getRiskHistory(projectId, limit = 12) {
    try {
      const result = await db.query(
        `SELECT 
           analysis_date,
           risk_level
         FROM analysis_results 
         WHERE project_id = $1
         ORDER BY analysis_date DESC
         LIMIT $2`,
        [projectId, limit]
      );
      
      return result.rows.reverse(); // Retourner du plus ancien au plus récent
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique des risques: ${error.message}`);
    }
  }
}

module.exports = AnalysisResult;