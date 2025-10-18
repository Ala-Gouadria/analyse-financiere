const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiConfig {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isConfigured = false;
    this.configure();
  }

  configure() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️  Clé API Gemini non trouvée. L\'analyse IA sera désactivée.');
        this.isConfigured = false;
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      
      // Configuration du modèle
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-pro",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      this.isConfigured = true;
      console.log('✅ Configuration Gemini AI chargée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la configuration Gemini:', error);
      this.isConfigured = false;
    }
  }

  // Vérifier si l'API est configurée
  isReady() {
    return this.isConfigured;
  }

  // Obtenir le modèle
  getModel() {
    if (!this.isConfigured) {
      throw new Error('Gemini AI non configuré. Vérifiez votre clé API.');
    }
    return this.model;
  }

  // Générer du contenu avec Gemini
  async generateContent(prompt) {
    if (!this.isConfigured) {
      throw new Error('Gemini AI non configuré. Vérifiez votre clé API.');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Erreur lors de la génération de contenu Gemini:', error);
      throw new Error(`Erreur Gemini AI: ${error.message}`);
    }
  }

  // Méthode spécifique pour l'analyse financière
  async analyzeFinancialData(financialData) {
    const prompt = this.createFinancialAnalysisPrompt(financialData);
    return await this.generateContent(prompt);
  }

  // Créer le prompt pour l'analyse financière
  createFinancialAnalysisPrompt(financialData) {
    return `
En tant qu'expert en analyse financière, analysez les données suivantes et fournissez :

1. Un résumé exécutif de la santé financière
2. Les risques identifiés (avec niveau de risque : faible, moyen, élevé)
3. Des recommandations pratiques et actionnables
4. Des prévisions à court terme

Données financières à analyser :
- Revenus mensuels : ${financialData.revenue} €
- Dépenses mensuelles : ${financialData.expenses} €
- Nombre d'employés : ${financialData.employees}
- Salaire moyen : ${financialData.average_salary} €
- Solde de trésorerie : ${financialData.cash_balance} €
- Marge bénéficiaire : ${financialData.profit_margin} %

Période analysée : ${financialData.period}

Format de réponse attendu (JSON) :
{
  "summary": "Résumé détaillé...",
  "risks": [
    {
      "description": "Description du risque",
      "level": "faible/moyen/élevé",
      "impact": "Impact sur l'entreprise"
    }
  ],
  "recommendations": [
    {
      "category": "catégorie",
      "action": "action concrète",
      "priority": "haute/moyenne/basse"
    }
  ],
  "forecast": {
    "short_term": "Prévision 3 mois",
    "cash_flow_warning": true/false,
    "growth_potential": "faible/moyen/élevé"
  },
  "risk_level": "faible/moyen/élevé"
}

Répondez uniquement avec le JSON valide, sans texte supplémentaire.
    `;
  }

  // Analyser les tendances historiques
  async analyzeTrends(historicalData) {
    const prompt = `
Analysez ces données historiques et identifiez les tendances :

Données historiques :
${JSON.stringify(historicalData, null, 2)}

Fournissez une analyse des tendances sur :
1. Évolution des revenus
2. Contrôle des dépenses  
3. Efficacité opérationnelle
4. Points d'attention

Format de réponse JSON :
{
  "trends": [
    {
      "metric": "Revenus",
      "trend": "croissant/décroissant/stable",
      "confidence": "haute/moyenne/basse",
      "insight": "Analyse détaillée"
    }
  ],
  "overall_assessment": "Évaluation globale",
  "key_metrics": {
    "revenue_growth": "taux",
    "expense_control": "bonne/mauvaise",
    "profitability_trend": "amélioration/détérioration"
  }
}

Répondez uniquement avec le JSON valide.
    `;

    return await this.generateContent(prompt);
  }
}

// Instance singleton
const geminiConfig = new GeminiConfig();

module.exports = geminiConfig;