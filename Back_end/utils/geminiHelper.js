const geminiConfig = require('../config/gemini');

/**
 * Helper pour les fonctionnalités avancées de Gemini AI
 */
class GeminiHelper {
  /**
   * Analyser les données financières avec formatage structuré
   */
  static async analyzeFinancialData(financialData, options = {}) {
    try {
      const {
        analysisType = 'comprehensive',
        includeForecast = true,
        includeRecommendations = true,
        language = 'fr'
      } = options;

      if (!geminiConfig.isReady()) {
        throw new Error('Gemini AI non configuré');
      }

      const prompt = this.createFinancialPrompt(financialData, {
        analysisType,
        includeForecast,
        includeRecommendations,
        language
      });

      const response = await geminiConfig.generateContent(prompt);
      
      // Parser et valider la réponse
      return this.parseAnalysisResponse(response, financialData);

    } catch (error) {
      console.error('❌ Erreur dans GeminiHelper.analyzeFinancialData:', error);
      throw error;
    }
  }

  /**
   * Créer un prompt détaillé pour l'analyse financière
   */
  static createFinancialPrompt(financialData, options) {
    const {
      analysisType,
      includeForecast,
      includeRecommendations,
      language
    } = options;

    const analysisTypes = {
      comprehensive: 'analyse complète',
      financial: 'analyse financière pure',
      risk: 'analyse des risques',
      trend: 'analyse des tendances',
      operational: 'analyse opérationnelle'
    };

    return `
En tant qu'expert en analyse financière avec 20 ans d'expérience, réalisez une ${analysisTypes[analysisType]} des données suivantes.

DONNÉES FINANCIÈRES À ANALYSER:
- Période: ${financialData.period}
- Revenus mensuels: ${financialData.revenue} €
- Dépenses mensuelles: ${financialData.expenses} €
- Nombre d'employés: ${financialData.employees}
- Salaire moyen: ${financialData.average_salary} €
- Solde de trésorerie: ${financialData.cash_balance} €
- Marge bénéficiaire: ${financialData.profit_margin} %

STRUCTURE DE RÉPONSE ATTENDUE (JSON STRICT):

{
  "summary": {
    "overview": "Résumé exécutif en 2-3 phrases",
    "financial_health": "excellent/bon/moyen/faible/critique",
    "key_metrics": {
      "profitability": "élevée/moyenne/faible/négative",
      "liquidity": "excellente/bonne/suffisante/insuffisante/critique",
      "efficiency": "optimale/satisfaisante/à améliorer/faible"
    }
  },
  "risks": [
    {
      "category": "liquidity|profitability|operations|growth|market",
      "description": "Description claire du risque",
      "level": "low|medium|high|critical",
      "impact": "impact sur l'entreprise",
      "probability": "faible|moyenne|élevée",
      "mitigation": "action pour mitiger le risque"
    }
  ],
  "recommendations": [
    {
      "category": "cost_optimization|revenue_growth|cash_flow|operations|strategy",
      "title": "Titre de la recommandation",
      "description": "Description détaillée",
      "action_steps": ["étape 1", "étape 2", "étape 3"],
      "priority": "low|medium|high|critical",
      "expected_impact": "faible|moyen|élevé",
      "timeline": "short_term|medium_term|long_term"
    }
  ],
  "forecast": {
    "next_3_months": {
      "revenue_trend": "croissant|stable|décroissant",
      "profitability_outlook": "amélioration|stabilité|détérioration",
      "cash_flow_projection": "positif|équilibré|négatif",
      "key_risks": ["risque 1", "risque 2"]
    },
    "growth_opportunities": ["opportunité 1", "opportunité 2"],
    "warnings": ["avertissement 1", "avertissement 2"]
  },
  "metrics_analysis": {
    "profit_margin_analysis": "Analyse de la marge bénéficiaire",
    "burn_rate_analysis": "Analyse du taux de combustion",
    "employee_efficiency": "Analyse de l'efficacité des employés",
    "cash_runway": ${financialData.cash_balance / (financialData.expenses || 1)} // mois de trésorerie restants
  }
}

EXIGENCES:
- Soyez concret et actionnable
- Utilisez un langage professionnel mais accessible
- Basez-vous sur les meilleures pratiques financières
- Soyez réaliste dans les recommandations
- Priorisez les actions par impact

Répondez UNIQUEMENT avec le JSON valide, sans texte supplémentaire.
    `.trim();
  }

  /**
   * Parser et valider la réponse de Gemini
   */
  static parseAnalysisResponse(response, originalData) {
    try {
      // Nettoyer la réponse (enlever les backticks de markdown)
      let cleanedResponse = response.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
      
      // Parser le JSON
      const analysis = JSON.parse(cleanedResponse);
      
      // Valider la structure de base
      this.validateAnalysisStructure(analysis);
      
      // Enrichir avec les données originales
      return this.enrichAnalysis(analysis, originalData);
      
    } catch (parseError) {
      console.error('❌ Erreur de parsing de la réponse Gemini:', parseError);
      
      // Fallback: générer une analyse basique
      return this.generateFallbackAnalysis(originalData);
    }
  }

  /**
   * Valider la structure de l'analyse
   */
  static validateAnalysisStructure(analysis) {
    const requiredFields = ['summary', 'risks', 'recommendations'];
    
    for (const field of requiredFields) {
      if (!analysis[field]) {
        throw new Error(`Champ manquant dans l'analyse: ${field}`);
      }
    }

    // Valider les risques
    if (!Array.isArray(analysis.risks)) {
      throw new Error('Les risques doivent être un tableau');
    }

    // Valider les recommandations
    if (!Array.isArray(analysis.recommendations)) {
      throw new Error('Les recommandations doivent être un tableau');
    }
  }

  /**
   * Enrichir l'analyse avec des métriques calculées
   */
  static enrichAnalysis(analysis, originalData) {
    const revenue = parseFloat(originalData.revenue);
    const expenses = parseFloat(originalData.expenses);
    const cashBalance = parseFloat(originalData.cash_balance);
    
    // Calculer des métriques supplémentaires
    const monthlyBurnRate = expenses;
    const runway = cashBalance / (monthlyBurnRate || 1);
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      ...analysis,
      metadata: {
        generated_at: new Date().toISOString(),
        analysis_version: '1.0',
        data_source: 'gemini-ai',
        original_data: originalData
      },
      calculated_metrics: {
        monthly_burn_rate: monthlyBurnRate,
        cash_runway_months: Math.round(runway * 10) / 10,
        absolute_profit: profit,
        profit_margin: Math.round(profitMargin * 100) / 100,
        revenue_per_employee: originalData.employees > 0 ? revenue / originalData.employees : 0,
        salary_to_revenue_ratio: revenue > 0 ? (originalData.average_salary * originalData.employees) / revenue : 0
      },
      risk_level: this.calculateOverallRiskLevel(analysis.risks)
    };
  }

  /**
   * Calculer le niveau de risque global
   */
  static calculateOverallRiskLevel(risks) {
    if (!risks || risks.length === 0) return 'low';
    
    const riskWeights = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };

    const totalWeight = risks.reduce((sum, risk) => {
      return sum + (riskWeights[risk.level] || 1);
    }, 0);

    const averageWeight = totalWeight / risks.length;

    if (averageWeight >= 3.5) return 'critical';
    if (averageWeight >= 2.5) return 'high';
    if (averageWeight >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Générer une analyse de fallback si Gemini échoue
   */
  static generateFallbackAnalysis(financialData) {
    const revenue = parseFloat(financialData.revenue);
    const expenses = parseFloat(financialData.expenses);
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const runway = financialData.cash_balance / (expenses || 1);

    return {
      summary: {
        overview: `Analyse financière basique: Revenus ${revenue}€, Dépenses ${expenses}€, Marge ${profitMargin.toFixed(1)}%.`,
        financial_health: profitMargin > 20 ? 'bon' : profitMargin > 10 ? 'moyen' : 'faible',
        key_metrics: {
          profitability: profitMargin > 15 ? 'élevée' : profitMargin > 5 ? 'moyenne' : 'faible',
          liquidity: runway > 6 ? 'bonne' : runway > 3 ? 'suffisante' : 'insuffisante',
          efficiency: 'à analyser'
        }
      },
      risks: [
        {
          category: "profitability",
          description: profitMargin < 10 ? "Marge bénéficiaire faible" : "Marge acceptable",
          level: profitMargin < 10 ? "medium" : "low",
          impact: "Rentabilité limitée",
          probability: "moyenne",
          mitigation: "Optimiser les coûts et augmenter les revenus"
        }
      ],
      recommendations: [
        {
          category: "cost_optimization",
          title: "Révision des dépenses",
          description: "Analyser en détail toutes les dépenses pour identifier des économies",
          action_steps: ["Audit des dépenses", "Négociation avec fournisseurs", "Élimination des coûts superflus"],
          priority: profitMargin < 15 ? "high" : "medium",
          expected_impact: "moyen",
          timeline: "short_term"
        }
      ],
      forecast: {
        next_3_months: {
          revenue_trend: "stable",
          profitability_outlook: profitMargin > 10 ? "stabilité" : "détérioration",
          cash_flow_projection: runway > 3 ? "équilibré" : "négatif",
          key_risks: ["Pression sur les marges", "Gestion de trésorerie"]
        },
        growth_opportunities: ["Optimisation des processus", "Diversification des revenus"],
        warnings: runway < 3 ? ["Trésorerie critique"] : []
      },
      metadata: {
        generated_at: new Date().toISOString(),
        analysis_version: '1.0',
        data_source: 'fallback',
        note: 'Analyse générée automatiquement en raison d\'un problème avec Gemini AI'
      },
      calculated_metrics: {
        monthly_burn_rate: expenses,
        cash_runway_months: Math.round(runway * 10) / 10,
        absolute_profit: profit,
        profit_margin: Math.round(profitMargin * 100) / 100
      },
      risk_level: this.calculateOverallRiskLevel([])
    };
  }

  /**
   * Analyser les tendances sur des données historiques
   */
  static async analyzeTrends(historicalData, options = {}) {
    try {
      if (!geminiConfig.isReady()) {
        throw new Error('Gemini AI non configuré');
      }

      const prompt = this.createTrendAnalysisPrompt(historicalData, options);
      const response = await geminiConfig.generateContent(prompt);
      
      return this.parseTrendAnalysisResponse(response, historicalData);

    } catch (error) {
      console.error('❌ Erreur dans l\'analyse des tendances:', error);
      throw error;
    }
  }

  /**
   * Créer un prompt pour l'analyse des tendances
   */
  static createTrendAnalysisPrompt(historicalData, options) {
    return `
Analysez les tendances financières à partir des données historiques suivantes:

DONNÉES HISTORIQUES (du plus ancien au plus récent):
${JSON.stringify(historicalData, null, 2)}

Identifiez:
1. Tendances des revenus (croissance/décroissance/stabilité)
2. Évolution des dépenses
3. Performance de la marge bénéficiaire
4. Efficacité opérationnelle
5. Points d'attention et opportunités

Format de réponse JSON:
{
  "trend_analysis": {
    "revenue_trend": "croissant/décroissant/stable",
    "expense_trend": "croissant/décroissant/stable",
    "profitability_trend": "amélioration/détérioration/stabilité",
    "efficiency_trend": "amélioration/détérioration/stabilité"
  },
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "seasonality_patterns": ["pattern 1", "pattern 2"],
  "growth_metrics": {
    "revenue_growth_rate": "taux estimé",
    "expense_growth_rate": "taux estimé",
    "profit_growth_rate": "taux estimé"
  },
  "recommendations": [
    {
      "area": "revenus/dépenses/efficacité",
      "recommendation": "recommandation spécifique",
      "rationale": "justification"
    }
  ]
}

Répondez UNIQUEMENT avec le JSON valide.
    `.trim();
  }

  /**
   * Parser la réponse de l'analyse des tendances
   */
  static parseTrendAnalysisResponse(response, historicalData) {
    try {
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
      const analysis = JSON.parse(cleanedResponse);
      
      return {
        ...analysis,
        metadata: {
          generated_at: new Date().toISOString(),
          data_points: historicalData.length,
          period_covered: {
            start: historicalData[0]?.period,
            end: historicalData[historicalData.length - 1]?.period
          }
        }
      };
    } catch (error) {
      console.error('❌ Erreur de parsing de l\'analyse des tendances:', error);
      throw new Error('Impossible de parser l\'analyse des tendances');
    }
  }

  /**
   * Vérifier la santé du service Gemini
   */
  static async healthCheck() {
    try {
      if (!geminiConfig.isReady()) {
        return {
          status: 'disabled',
          message: 'Gemini AI non configuré'
        };
      }

      // Test simple pour vérifier que l'API répond
      const testPrompt = 'Répondez simplement par "OK"';
      const response = await geminiConfig.generateContent(testPrompt);
      
      return {
        status: 'healthy',
        message: 'Gemini AI opérationnel',
        response_time: 'testé'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Erreur Gemini: ${error.message}`,
        error: error.toString()
      };
    }
  }
}

module.exports = GeminiHelper;