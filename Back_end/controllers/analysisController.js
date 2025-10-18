const db = require('../config/database');
const geminiConfig = require('../config/gemini');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Contrôleur pour lancer une analyse financière avec Gemini AI
 */
const analyzeFinancialData = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
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

  // Récupérer les données financières les plus récentes
  const financialDataResult = await db.query(
    `SELECT * FROM financial_data 
     WHERE project_id = $1 
     ORDER BY period DESC 
     LIMIT 1`,
    [projectId]
  );

  if (financialDataResult.rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Aucune donnée financière trouvée pour ce projet'
    });
  }

  const financialData = financialDataResult.rows[0];

  // Calculer la marge bénéficiaire si non fournie
  if (financialData.profit_margin === null) {
    const revenue = parseFloat(financialData.revenue);
    const expenses = parseFloat(financialData.expenses);
    financialData.profit_margin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
  }

  let analysisResult;
  
  // Utiliser Gemini AI si configuré, sinon utiliser une analyse basique
  if (geminiConfig.isReady()) {
    try {
      const geminiResponse = await geminiConfig.analyzeFinancialData(financialData);
      
      // Parser la réponse JSON de Gemini
      try {
        analysisResult = JSON.parse(geminiResponse);
      } catch (parseError) {
        console.error('Erreur parsing JSON Gemini:', parseError);
        // Fallback à une analyse basique
        analysisResult = generateBasicAnalysis(financialData);
      }
      
    } catch (geminiError) {
      console.error('Erreur Gemini AI:', geminiError);
      // Fallback à une analyse basique en cas d'erreur
      analysisResult = generateBasicAnalysis(financialData);
    }
  } else {
    // Analyse basique sans IA
    analysisResult = generateBasicAnalysis(financialData);
  }

  // Sauvegarder le résultat de l'analyse
  const savedAnalysis = await db.query(
    `INSERT INTO analysis_results 
     (project_id, summary, risks, recommendations, gemini_response, risk_level) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [
      projectId,
      analysisResult.summary,
      JSON.stringify(analysisResult.risks || []),
      JSON.stringify(analysisResult.recommendations || []),
      JSON.stringify(analysisResult),
      analysisResult.risk_level || 'medium'
    ]
  );

  res.json({
    success: true,
    message: 'Analyse terminée avec succès',
    data: {
      analysis: savedAnalysis.rows[0],
      used_ai: geminiConfig.isReady()
    }
  });
});

/**
 * Analyse basique sans IA
 */
function generateBasicAnalysis(financialData) {
  const revenue = parseFloat(financialData.revenue);
  const expenses = parseFloat(financialData.expenses);
  const cashBalance = parseFloat(financialData.cash_balance);
  const employees = parseInt(financialData.employees);
  const avgSalary = parseFloat(financialData.average_salary);

  const profit = revenue - expenses;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const monthlyBurnRate = expenses;
  const runway = cashBalance / monthlyBurnRate;

  // Déterminer le niveau de risque
  let riskLevel = 'medium';
  if (profitMargin > 20 && runway > 6) riskLevel = 'low';
  if (profitMargin < 5 || runway < 3) riskLevel = 'high';

  const risks = [];
  const recommendations = [];

  // Identifier les risques
  if (profitMargin < 10) {
    risks.push({
      description: 'Marge bénéficiaire faible',
      level: 'high',
      impact: 'Rentabilité insuffisante'
    });
  }

  if (runway < 3) {
    risks.push({
      description: 'Trésorerie critique',
      level: 'high',
      impact: 'Risque de cessation de paiement'
    });
  }

  if (expenses > revenue * 0.8) {
    risks.push({
      description: 'Dépenses élevées par rapport aux revenus',
      level: 'medium',
      impact: 'Compression des marges'
    });
  }

  // Générer des recommandations
  if (profitMargin < 15) {
    recommendations.push({
      category: 'Optimisation',
      action: 'Réviser la structure des coûts et identifier des économies',
      priority: 'haute'
    });
  }

  if (runway < 6) {
    recommendations.push({
      category: 'Trésorerie',
      action: 'Établir un plan de financement ou réduire les dépenses non essentielles',
      priority: 'haute'
    });
  }

  if (revenue < expenses) {
    recommendations.push({
      category: 'Revenus',
      action: 'Développer de nouvelles sources de revenus ou augmenter les prix',
      priority: 'haute'
    });
  }

  return {
    summary: `Analyse financière basique : Revenus ${revenue}€, Dépenses ${expenses}€, Marge ${profitMargin.toFixed(1)}%. ${runway.toFixed(1)} mois de trésorerie restants.`,
    risks,
    recommendations,
    forecast: {
      short_term: `Prévision : ${profit >= 0 ? 'Croissance stable' : 'Attention aux pertes'}`,
      cash_flow_warning: runway < 3,
      growth_potential: profitMargin > 20 ? 'élevé' : profitMargin > 10 ? 'moyen' : 'faible'
    },
    risk_level: riskLevel
  };
}

/**
 * Contrôleur pour récupérer l'historique des analyses d'un projet
 */
const getAnalysisHistory = asyncHandler(async (req, res) => {
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

  const analysesResult = await db.query(
    `SELECT * FROM analysis_results 
     WHERE project_id = $1 
     ORDER BY analysis_date DESC`,
    [projectId]
  );

  res.json({
    success: true,
    data: {
      analyses: analysesResult.rows,
      total: analysesResult.rows.length
    }
  });
});

/**
 * Contrôleur pour récupérer une analyse spécifique
 */
const getAnalysis = asyncHandler(async (req, res) => {
  const analysisId = req.params.analysisId;

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

  res.json({
    success: true,
    data: {
      analysis: analysisResult.rows[0]
    }
  });
});

module.exports = {
  analyzeFinancialData,
  getAnalysisHistory,
  getAnalysis
};