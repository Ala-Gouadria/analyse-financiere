/**
 * Utilitaire pour formater les réponses API de manière cohérente
 */
class ResponseFormatter {
  /**
   * Format de réponse standard pour les succès
   */
  static success(data, message = 'Opération réussie', metadata = {}) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    // Ajouter les métadonnées si fournies
    if (Object.keys(metadata).length > 0) {
      response.metadata = metadata;
    }

    return response;
  }

  /**
   * Format de réponse pour les listes paginées
   */
  static paginated(data, pagination, message = 'Données récupérées avec succès') {
    return {
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format de réponse pour les erreurs
   */
  static error(message, errorCode = 'SERVER_ERROR', details = null) {
    const response = {
      success: false,
      error: {
        code: errorCode,
        message,
        timestamp: new Date().toISOString()
      }
    };

    if (details) {
      response.error.details = details;
    }

    return response;
  }

  /**
   * Formater les erreurs de validation
   */
  static validationError(validationResult) {
    const errors = validationResult.error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    }));

    return this.error(
      'Données de requête invalides',
      'VALIDATION_ERROR',
      errors
    );
  }

  /**
   * Formater les réponses d'analyse
   */
  static analysisResult(analysis, options = {}) {
    const {
      includeRawData = false,
      includeMetadata = true,
      format = 'standard'
    } = options;

    const baseResponse = {
      success: true,
      message: 'Analyse terminée avec succès',
      data: {
        id: analysis.id,
        project_id: analysis.project_id,
        analysis_date: analysis.analysis_date,
        risk_level: analysis.risk_level,
        summary: analysis.summary,
        risks: analysis.risks,
        recommendations: analysis.recommendations,
        forecast: analysis.forecast
      },
      timestamp: new Date().toISOString()
    };

    if (includeMetadata) {
      baseResponse.metadata = {
        analysis_version: analysis.metadata?.analysis_version,
        data_source: analysis.metadata?.data_source,
        generated_at: analysis.metadata?.generated_at
      };
    }

    if (includeRawData) {
      baseResponse.raw_analysis = analysis;
    }

    if (format === 'detailed' && analysis.calculated_metrics) {
      baseResponse.data.calculated_metrics = analysis.calculated_metrics;
    }

    return baseResponse;
  }

  /**
   * Formater les données pour les graphiques
   */
  static chartData(data, chartType, options = {}) {
    const { xAxis, yAxis, series = [] } = options;

    const baseFormat = {
      type: chartType,
      data: data,
      metadata: {
        generated_at: new Date().toISOString(),
        data_points: data.length
      }
    };

    switch (chartType) {
      case 'line':
        return {
          ...baseFormat,
          xAxis,
          yAxis,
          series
        };

      case 'bar':
        return {
          ...baseFormat,
          categories: xAxis,
          series: yAxis
        };

      case 'pie':
        return {
          ...baseFormat,
          series: data.map(item => ({
            name: item.name,
            value: item.value
          }))
        };

      default:
        return baseFormat;
    }
  }

  /**
   * Formater les statistiques
   */
  static statistics(stats, period = null) {
    const response = {
      success: true,
      message: 'Statistiques récupérées avec succès',
      data: stats,
      timestamp: new Date().toISOString()
    };

    if (period) {
      response.period = period;
    }

    return response;
  }
}

module.exports = ResponseFormatter;