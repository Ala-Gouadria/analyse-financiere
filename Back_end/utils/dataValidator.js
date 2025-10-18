const Joi = require('joi');

/**
 * Utilitaire de validation avancée des données financières
 */
class DataValidator {
  /**
   * Valider les données financières complètes
   */
  static validateFinancialData(data) {
    const schema = Joi.object({
      period: Joi.date().required().max('now'),
      revenue: Joi.number().min(0).required(),
      expenses: Joi.number().min(0).required(),
      employees: Joi.number().integer().min(0).required(),
      average_salary: Joi.number().min(0).required(),
      cash_balance: Joi.number().required(),
      projectId: Joi.number().integer().positive().required()
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Valider un ensemble de données historiques
   */
  static validateHistoricalData(dataArray) {
    if (!Array.isArray(dataArray)) {
      return { error: 'Les données historiques doivent être un tableau' };
    }

    if (dataArray.length === 0) {
      return { error: 'Aucune donnée fournie' };
    }

    const errors = [];
    
    dataArray.forEach((data, index) => {
      const validation = this.validateFinancialData(data);
      if (validation.error) {
        errors.push({
          index,
          errors: validation.error.details.map(detail => detail.message)
        });
      }
    });

    if (errors.length > 0) {
      return { error: 'Données invalides', details: errors };
    }

    return { value: dataArray };
  }

  /**
   * Vérifier la cohérence des données financières
   */
  static checkDataConsistency(financialData) {
    const warnings = [];
    const revenue = parseFloat(financialData.revenue);
    const expenses = parseFloat(financialData.expenses);
    const employees = parseInt(financialData.employees);
    const avgSalary = parseFloat(financialData.average_salary);

    // Vérifier la marge bénéficiaire
    if (revenue > 0) {
      const profitMargin = ((revenue - expenses) / revenue) * 100;
      if (profitMargin < 5) {
        warnings.push('Marge bénéficiaire très faible (< 5%)');
      }
      if (profitMargin < 0) {
        warnings.push('Perte détectée (marge bénéficiaire négative)');
      }
    }

    // Vérifier les salaires par rapport aux revenus
    if (revenue > 0) {
      const salaryCost = employees * avgSalary;
      const salaryToRevenueRatio = (salaryCost / revenue) * 100;
      
      if (salaryToRevenueRatio > 50) {
        warnings.push('Coût des salaires élevé par rapport aux revenus (> 50%)');
      }
    }

    // Vérifier la trésorerie
    const monthlyBurnRate = expenses;
    const runway = financialData.cash_balance / (monthlyBurnRate || 1);
    
    if (runway < 3) {
      warnings.push('Trésorerie critique (moins de 3 mois de réserve)');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      calculatedMetrics: {
        profitMargin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
        monthlyBurnRate,
        runway: Math.round(runway * 10) / 10,
        salaryToRevenueRatio: revenue > 0 ? (employees * avgSalary) / revenue * 100 : 0
      }
    };
  }

  /**
   * Détecter les anomalies dans les données historiques
   */
  static detectAnomalies(historicalData) {
    if (!historicalData || historicalData.length < 2) {
      return { anomalies: [], insights: [] };
    }

    const anomalies = [];
    const insights = [];

    // Trier par date
    const sortedData = [...historicalData].sort((a, b) => 
      new Date(a.period) - new Date(b.period)
    );

    // Analyser les tendances et détecter les anomalies
    for (let i = 1; i < sortedData.length; i++) {
      const current = sortedData[i];
      const previous = sortedData[i - 1];

      const revenueChange = ((current.revenue - previous.revenue) / previous.revenue) * 100;
      const expenseChange = ((current.expenses - previous.expenses) / previous.expenses) * 100;

      // Détecter les changements brusques
      if (Math.abs(revenueChange) > 50) {
        anomalies.push({
          period: current.period,
          type: 'revenue_spike',
          change: revenueChange,
          description: `Changement brusque des revenus: ${revenueChange.toFixed(1)}%`
        });
      }

      if (Math.abs(expenseChange) > 50) {
        anomalies.push({
          period: current.period,
          type: 'expense_spike',
          change: expenseChange,
          description: `Changement brusque des dépenses: ${expenseChange.toFixed(1)}%`
        });
      }
    }

    // Générer des insights
    const first = sortedData[0];
    const last = sortedData[sortedData.length - 1];
    
    const totalRevenueGrowth = ((last.revenue - first.revenue) / first.revenue) * 100;
    const totalExpenseGrowth = ((last.expenses - first.expenses) / first.expenses) * 100;

    if (totalRevenueGrowth > 20) {
      insights.push(`Croissance des revenus significative: +${totalRevenueGrowth.toFixed(1)}%`);
    }

    if (totalExpenseGrowth > totalRevenueGrowth) {
      insights.push('Les dépenses croissent plus vite que les revenus');
    }

    return { anomalies, insights };
  }

  /**
   * Nettoyer et normaliser les données financières
   */
  static cleanFinancialData(data) {
    const cleaned = { ...data };

    // Convertir les nombres
    if (cleaned.revenue) cleaned.revenue = parseFloat(cleaned.revenue);
    if (cleaned.expenses) cleaned.expenses = parseFloat(cleaned.expenses);
    if (cleaned.employees) cleaned.employees = parseInt(cleaned.employees);
    if (cleaned.average_salary) cleaned.average_salary = parseFloat(cleaned.average_salary);
    if (cleaned.cash_balance) cleaned.cash_balance = parseFloat(cleaned.cash_balance);

    // Calculer la marge bénéficiaire si non fournie
    if (!cleaned.profit_margin && cleaned.revenue && cleaned.expenses) {
      cleaned.profit_margin = cleaned.revenue > 0 ? 
        ((cleaned.revenue - cleaned.expenses) / cleaned.revenue) * 100 : 0;
    }

    // Formater la date
    if (cleaned.period && typeof cleaned.period === 'string') {
      cleaned.period = new Date(cleaned.period).toISOString().split('T')[0];
    }

    return cleaned;
  }

  /**
   * Valider les paramètres de rapport
   */
  static validateReportParameters(params) {
    const schema = Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().min(Joi.ref('startDate')).required(),
      format: Joi.string().valid('pdf', 'excel', 'csv', 'json').default('pdf'),
      includeCharts: Joi.boolean().default(true),
      detailLevel: Joi.string().valid('summary', 'detailed', 'comprehensive').default('summary')
    });

    return schema.validate(params, { abortEarly: false });
  }
}

module.exports = DataValidator;