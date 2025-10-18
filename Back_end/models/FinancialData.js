const db = require('../config/database');

/**
 * Modèle FinancialData pour les opérations sur les données financières
 */
class FinancialData {
  /**
   * Ajouter des données financières
   */
  static async create(financialData) {
    const { projectId, period, revenue, expenses, employees, average_salary, cash_balance } = financialData;
    
    try {
      // Calculer la marge bénéficiaire automatiquement
      const profit_margin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;

      const result = await db.query(
        `INSERT INTO financial_data 
         (project_id, period, revenue, expenses, employees, average_salary, cash_balance, profit_margin) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [projectId, period, revenue, expenses, employees, average_salary, cash_balance, profit_margin]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23503') { // Violation de clé étrangère
        throw new Error('Projet non trouvé');
      }
      if (error.code === '23505') { // Duplication de période pour le même projet
        throw new Error('Des données existent déjà pour cette période');
      }
      throw new Error(`Erreur lors de l'ajout des données financières: ${error.message}`);
    }
  }

  /**
   * Récupérer les données financières d'un projet
   */
  static async findByProjectId(projectId, options = {}) {
    const { limit, offset, startDate, endDate, sortBy = 'period', sortOrder = 'DESC' } = options;
    
    try {
      let query = `
        SELECT * FROM financial_data 
        WHERE project_id = $1
      `;
      const params = [projectId];

      // Filtrage par date
      if (startDate) {
        query += ` AND period >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND period <= $${params.length + 1}`;
        params.push(endDate);
      }

      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      if (limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(limit);
      }

      if (offset) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(offset);
      }

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des données financières: ${error.message}`);
    }
  }

  /**
   * Récupérer la dernière entrée de données financières
   */
  static async findLatestByProjectId(projectId) {
    try {
      const result = await db.query(
        `SELECT * FROM financial_data 
         WHERE project_id = $1 
         ORDER BY period DESC 
         LIMIT 1`,
        [projectId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des dernières données: ${error.message}`);
    }
  }

  /**
   * Mettre à jour des données financières
   */
  static async update(id, projectId, updateData) {
    const { period, revenue, expenses, employees, average_salary, cash_balance } = updateData;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (period) {
      updates.push(`period = $${paramCount}`);
      values.push(period);
      paramCount++;
    }

    if (revenue !== undefined) {
      updates.push(`revenue = $${paramCount}`);
      values.push(revenue);
      paramCount++;
    }

    if (expenses !== undefined) {
      updates.push(`expenses = $${paramCount}`);
      values.push(expenses);
      paramCount++;
    }

    if (employees !== undefined) {
      updates.push(`employees = $${paramCount}`);
      values.push(employees);
      paramCount++;
    }

    if (average_salary !== undefined) {
      updates.push(`average_salary = $${paramCount}`);
      values.push(average_salary);
      paramCount++;
    }

    if (cash_balance !== undefined) {
      updates.push(`cash_balance = $${paramCount}`);
      values.push(cash_balance);
      paramCount++;
    }

    // Recalculer la marge bénéficiaire si revenue ou expenses changent
    if (revenue !== undefined || expenses !== undefined) {
      const currentData = revenue !== undefined && expenses !== undefined ? 
        { revenue, expenses } : await this.findById(id);
      
      const finalRevenue = revenue !== undefined ? revenue : currentData.revenue;
      const finalExpenses = expenses !== undefined ? expenses : currentData.expenses;
      const profit_margin = finalRevenue > 0 ? ((finalRevenue - finalExpenses) / finalRevenue) * 100 : 0;
      
      updates.push(`profit_margin = $${paramCount}`);
      values.push(profit_margin);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    values.push(id, projectId);

    try {
      const result = await db.query(
        `UPDATE financial_data 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount} AND project_id = $${paramCount + 1}
         RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour des données financières: ${error.message}`);
    }
  }

  /**
   * Supprimer des données financières
   */
  static async delete(id, projectId) {
    try {
      const result = await db.query(
        'DELETE FROM financial_data WHERE id = $1 AND project_id = $2 RETURNING id, period',
        [id, projectId]
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la suppression des données financières: ${error.message}`);
    }
  }

  /**
   * Trouver par ID
   */
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM financial_data WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des données: ${error.message}`);
    }
  }

  /**
   * Obtenir les statistiques financières d'un projet
   */
  static async getProjectStats(projectId) {
    try {
      const stats = await db.query(
        `SELECT 
           COUNT(*) as total_entries,
           MIN(period) as first_period,
           MAX(period) as last_period,
           AVG(revenue) as avg_revenue,
           AVG(expenses) as avg_expenses,
           AVG(profit_margin) as avg_profit_margin,
           SUM(revenue) as total_revenue,
           SUM(expenses) as total_expenses
         FROM financial_data 
         WHERE project_id = $1`,
        [projectId]
      );

      const monthlyGrowth = await db.query(
        `WITH monthly_data AS (
           SELECT 
             period,
             revenue,
             LAG(revenue) OVER (ORDER BY period) as prev_revenue
           FROM financial_data 
           WHERE project_id = $1
         )
         SELECT 
           AVG(CASE WHEN prev_revenue > 0 
               THEN ((revenue - prev_revenue) / prev_revenue) * 100 
               ELSE NULL END) as avg_growth_rate
         FROM monthly_data
         WHERE prev_revenue IS NOT NULL`,
        [projectId]
      );

      return {
        ...stats.rows[0],
        avg_growth_rate: monthlyGrowth.rows[0]?.avg_growth_rate || 0
      };
    } catch (error) {
      throw new Error(`Erreur lors du calcul des statistiques: ${error.message}`);
    }
  }

  /**
   * Vérifier si une période existe déjà pour un projet
   */
  static async periodExists(projectId, period, excludeId = null) {
    try {
      let query = 'SELECT id FROM financial_data WHERE project_id = $1 AND period = $2';
      const params = [projectId, period];

      if (excludeId) {
        query += ' AND id != $3';
        params.push(excludeId);
      }

      const result = await db.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la vérification de la période: ${error.message}`);
    }
  }
}

module.exports = FinancialData;