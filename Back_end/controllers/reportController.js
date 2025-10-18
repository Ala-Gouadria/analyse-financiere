const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Contrôleur pour exporter les données financières en CSV/Excel
 */
const exportFinancialData = asyncHandler(async (req, res) => {
  const { projectId, format = 'csv' } = req.body;
  const userId = req.user.id;

  // Vérifier que le projet appartient à l'utilisateur
  const projectResult = await db.query(
    'SELECT name FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Projet non trouvé'
    });
  }

  const projectName = projectResult.rows[0].name;

  // Récupérer les données financières
  const financialData = await db.query(
    `SELECT period, revenue, expenses, employees, average_salary, cash_balance,
            (revenue - expenses) as profit,
            CASE WHEN revenue > 0 THEN ((revenue - expenses) / revenue) * 100 ELSE 0 END as profit_margin
     FROM financial_data 
     WHERE project_id = $1 
     ORDER BY period ASC`,
    [projectId]
  );

  if (financialData.rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Aucune donnée financière à exporter'
    });
  }

  // Générer le CSV
  if (format === 'csv') {
    const headers = ['Période', 'Revenus (€)', 'Dépenses (€)', 'Bénéfice (€)', 'Marge (%)', 'Employés', 'Salaire Moyen (€)', 'Trésorerie (€)'];
    
    const csvRows = financialData.rows.map(row => [
      new Date(row.period).toLocaleDateString('fr-FR'),
      row.revenue,
      row.expenses,
      row.profit,
      parseFloat(row.profit_margin).toFixed(2),
      row.employees,
      row.average_salary,
      row.cash_balance
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}_donnees_financieres.csv"`);
    return res.send(csvContent);
  }

  // Pour Excel (format JSON - pourrait être étendu avec une librairie Excel)
  res.json({
    success: true,
    data: {
      project: projectName,
      financial_data: financialData.rows,
      export_date: new Date().toISOString(),
      total_records: financialData.rows.length
    }
  });
});

/**
 * Contrôleur pour exporter un rapport d'analyse
 */
const exportAnalysisReport = asyncHandler(async (req, res) => {
  const { analysisId, format = 'json' } = req.body;

  const analysisResult = await db.query(
    `SELECT ar.*, p.name as project_name, p.user_id
     FROM analysis_results ar
     JOIN projects p ON ar.project_id = p.id
     WHERE ar.id = $1 AND p.user_id = $2`,
    [analysisId, req.user.id]
  );

  if (analysisResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Analyse non trouvée'
    });
  }

  const analysis = analysisResult.rows[0];

  // Format PDF simplifié (texte formaté)
  if (format === 'pdf') {
    const reportContent = generatePDFContent(analysis);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport_analyse_${analysis.project_name}.pdf"`);
    
    // Pour l'instant on retourne du texte, idéalement utiliser une librairie PDF
    return res.send(reportContent);
  }

  // Format JSON par défaut
  res.json({
    success: true,
    data: {
      report: {
        project_name: analysis.project_name,
        analysis_date: analysis.analysis_date,
        summary: analysis.summary,
        risks: analysis.risks,
        recommendations: analysis.recommendations,
        risk_level: analysis.risk_level
      },
      export_info: {
        format: 'json',
        exported_at: new Date().toISOString(),
        exported_by: req.user.email
      }
    }
  });
});

/**
 * Générer le contenu PDF (version simplifiée)
 */
function generatePDFContent(analysis) {
  // CORRECTION : Il y avait une erreur de syntaxe ici - "risk impact" corrigé en "risk.impact"
  const risksContent = Array.isArray(analysis.risks) ? 
    analysis.risks.map(risk => 
      `• ${risk.description} (Niveau: ${risk.level}, Impact: ${risk.impact})`
    ).join('\n') : 'Aucun risque identifié.';

  const recommendationsContent = Array.isArray(analysis.recommendations) ? 
    analysis.recommendations.map(rec => 
      `• [${rec.priority?.toUpperCase() || 'MOYENNE'}] ${rec.action} (Catégorie: ${rec.category})`
    ).join('\n') : 'Aucune recommandation disponible.';

  return `
RAPPORT D'ANALYSE FINANCIÈRE
=============================

Projet: ${analysis.project_name}
Date d'analyse: ${new Date(analysis.analysis_date).toLocaleDateString('fr-FR')}
Niveau de risque: ${analysis.risk_level?.toUpperCase() || 'NON DÉTERMINÉ'}

RÉSUMÉ
------
${analysis.summary || 'Aucun résumé disponible.'}

RISQUES IDENTIFIÉS
------------------
${risksContent}

RECOMMANDATIONS
---------------
${recommendationsContent}

---
Rapport généré le ${new Date().toLocaleDateString('fr-FR')}
  `.trim();
}

/**
 * Contrôleur pour générer un rapport de performance
 */
const generatePerformanceReport = asyncHandler(async (req, res) => {
  const { projectId, startDate, endDate } = req.body;
  const userId = req.user.id;

  // Vérifier que le projet appartient à l'utilisateur
  const projectResult = await db.query(
    'SELECT name FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Projet non trouvé'
    });
  }

  // Récupérer les données sur la période
  const performanceData = await db.query(
    `SELECT 
        period,
        revenue,
        expenses,
        (revenue - expenses) as profit,
        CASE WHEN revenue > 0 THEN ((revenue - expenses) / revenue) * 100 ELSE 0 END as profit_margin,
        employees,
        average_salary,
        cash_balance
     FROM financial_data 
     WHERE project_id = $1 
       AND period BETWEEN $2 AND $3
     ORDER BY period ASC`,
    [projectId, startDate, endDate]
  );

  if (performanceData.rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Aucune donnée sur la période spécifiée'
    });
  }

  // Calculer les métriques de performance
  const metrics = calculatePerformanceMetrics(performanceData.rows);

  res.json({
    success: true,
    data: {
      project: projectResult.rows[0],
      period: { startDate, endDate },
      metrics,
      data_points: performanceData.rows
    }
  });
});

/**
 * Calculer les métriques de performance
 */
function calculatePerformanceMetrics(data) {
  const totalRevenue = data.reduce((sum, row) => sum + parseFloat(row.revenue), 0);
  const totalExpenses = data.reduce((sum, row) => sum + parseFloat(row.expenses), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const revenueGrowth = data.length > 1 ? 
    ((parseFloat(data[data.length - 1].revenue) - parseFloat(data[0].revenue)) / parseFloat(data[0].revenue)) * 100 : 0;

  return {
    total_revenue: totalRevenue,
    total_expenses: totalExpenses,
    total_profit: totalProfit,
    average_profit_margin: avgProfitMargin,
    revenue_growth_rate: revenueGrowth,
    data_points_count: data.length,
    period_covered: `${new Date(data[0].period).toLocaleDateString('fr-FR')} - ${new Date(data[data.length - 1].period).toLocaleDateString('fr-FR')}`
  };
}

module.exports = {
  exportFinancialData,
  exportAnalysisReport,
  generatePerformanceReport
};