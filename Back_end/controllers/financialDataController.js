const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Contrôleur pour ajouter des données financières
 */
const addFinancialData = asyncHandler(async (req, res) => {
  const { projectId, period, revenue, expenses, employees, average_salary, cash_balance } = req.body;
  const userId = req.user.id;

  // Vérifier que le projet appartient à l'utilisateur
  const projectResult = await db.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Projet non trouvé'
    });
  }

  // Calculer la marge bénéficiaire automatiquement
  const profit_margin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;

  const financialData = await db.query(
    `INSERT INTO financial_data 
     (project_id, period, revenue, expenses, employees, average_salary, cash_balance, profit_margin) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
     RETURNING *`,
    [projectId, period, revenue, expenses, employees, average_salary, cash_balance, profit_margin]
  );

  res.status(201).json({
    success: true,
    message: 'Données financières ajoutées avec succès',
    data: {
      financial_data: financialData.rows[0]
    }
  });
});

/**
 * Contrôleur pour récupérer les données financières d'un projet
 */
const getFinancialData = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const userId = req.user.id;

  // Vérifier que le projet appartient à l'utilisateur
  const projectResult = await db.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Projet non trouvé'
    });
  }

  const financialData = await db.query(
    `SELECT * FROM financial_data 
     WHERE project_id = $1 
     ORDER BY period DESC`,
    [projectId]
  );

  res.json({
    success: true,
    data: {
      financial_data: financialData.rows,
      total: financialData.rows.length
    }
  });
});

/**
 * Contrôleur pour mettre à jour des données financières
 */
const updateFinancialData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { period, revenue, expenses, employees, average_salary, cash_balance } = req.body;
  const userId = req.user.id;

  // Vérifier que la donnée appartient à un projet de l'utilisateur
  const dataResult = await db.query(
    `SELECT fd.id FROM financial_data fd
     JOIN projects p ON fd.project_id = p.id
     WHERE fd.id = $1 AND p.user_id = $2`,
    [id, userId]
  );

  if (dataResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Donnée financière non trouvée'
    });
  }

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

  // Recalculer la marge bénéficiaire
  if (revenue !== undefined || expenses !== undefined) {
    const currentData = await db.query(
      'SELECT revenue, expenses FROM financial_data WHERE id = $1',
      [id]
    );
    
    const finalRevenue = revenue !== undefined ? revenue : currentData.rows[0].revenue;
    const finalExpenses = expenses !== undefined ? expenses : currentData.rows[0].expenses;
    const profit_margin = finalRevenue > 0 ? ((finalRevenue - finalExpenses) / finalRevenue) * 100 : 0;
    
    updates.push(`profit_margin = $${paramCount}`);
    values.push(profit_margin);
    paramCount++;
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Aucune donnée à mettre à jour'
    });
  }

  values.push(id);

  const updatedData = await db.query(
    `UPDATE financial_data 
     SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  res.json({
    success: true,
    message: 'Données financières mises à jour avec succès',
    data: {
      financial_data: updatedData.rows[0]
    }
  });
});

/**
 * Contrôleur pour supprimer des données financières
 */
const deleteFinancialData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Vérifier que la donnée appartient à un projet de l'utilisateur
  const dataResult = await db.query(
    `SELECT fd.id FROM financial_data fd
     JOIN projects p ON fd.project_id = p.id
     WHERE fd.id = $1 AND p.user_id = $2`,
    [id, userId]
  );

  if (dataResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Donnée financière non trouvée'
    });
  }

  const deletedData = await db.query(
    'DELETE FROM financial_data WHERE id = $1 RETURNING id, period',
    [id]
  );

  res.json({
    success: true,
    message: 'Donnée financière supprimée avec succès',
    data: {
      financial_data: deletedData.rows[0]
    }
  });
});

module.exports = {
  addFinancialData,
  getFinancialData,
  updateFinancialData,
  deleteFinancialData
};