const Joi = require('joi');

// Schémas de validation avec Joi

// Validation de l'inscription
const registerSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr', 'org'] } })
    .required()
    .messages({
      'string.email': 'L\'email doit être une adresse valide',
      'string.empty': 'L\'email est requis',
      'any.required': 'L\'email est requis'
    }),
  password: Joi.string()
    .min(6)
    .max(30)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'string.max': 'Le mot de passe ne peut pas dépasser 30 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
      'any.required': 'Le mot de passe est requis'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Les mots de passe ne correspondent pas',
      'any.required': 'La confirmation du mot de passe est requise'
    })
});

// Validation de la connexion
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'L\'email doit être une adresse valide',
      'any.required': 'L\'email est requis'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Le mot de passe est requis'
    })
});

// Validation de la création de projet
const projectSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Le nom du projet doit contenir au moins 2 caractères',
      'string.max': 'Le nom du projet ne peut pas dépasser 100 caractères',
      'any.required': 'Le nom du projet est requis'
    }),
  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'La description ne peut pas dépasser 500 caractères'
    })
});

// Validation des données financières
const financialDataSchema = Joi.object({
  projectId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID du projet doit être un nombre',
      'any.required': 'L\'ID du projet est requis'
    }),
  period: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.base': 'La période doit être une date valide',
      'date.max': 'La période ne peut pas être dans le futur',
      'any.required': 'La période est requise'
    }),
  revenue: Joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': 'Le revenu doit être un nombre',
      'number.min': 'Le revenu ne peut pas être négatif',
      'any.required': 'Le revenu est requis'
    }),
  expenses: Joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': 'Les dépenses doivent être un nombre',
      'number.min': 'Les dépenses ne peuvent pas être négatives',
      'any.required': 'Les dépenses sont requises'
    }),
  employees: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Le nombre d\'employés doit être un nombre entier',
      'number.min': 'Le nombre d\'employés ne peut pas être négatif',
      'any.required': 'Le nombre d\'employés est requis'
    }),
  average_salary: Joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': 'Le salaire moyen doit être un nombre',
      'number.min': 'Le salaire moyen ne peut pas être négatif',
      'any.required': 'Le salaire moyen est requis'
    }),
  cash_balance: Joi.number()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Le solde de trésorerie doit être un nombre',
      'any.required': 'Le solde de trésorerie est requis'
    })
});

// Validation de l'analyse
const analysisSchema = Joi.object({
  projectId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID du projet doit être un nombre',
      'any.required': 'L\'ID du projet est requis'
    }),
  analysisType: Joi.string()
    .valid('financial', 'trend', 'risk', 'comprehensive')
    .default('comprehensive')
    .messages({
      'any.only': 'Le type d\'analyse doit être valide'
    })
});

// Middleware de validation générique
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retourner toutes les erreurs
      stripUnknown: true // Supprimer les champs non définis dans le schéma
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Données de requête invalides',
        details: errorDetails
      });
    }

    // Remplacer le body par les données validées
    req.body = value;
    next();
  };
};

// Validation des paramètres d'URL
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Paramètres d\'URL invalides',
        details: errorDetails
      });
    }

    req.params = value;
    next();
  };
};

// Validation des query strings
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      convert: true // Convertir les strings en numbers quand possible
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Paramètres de requête invalides',
        details: errorDetails
      });
    }

    req.query = value;
    next();
  };
};

// Schéma pour l'export des données financières
const exportFinancialSchema = Joi.object({
  projectId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID du projet doit être un nombre',
      'any.required': 'L\'ID du projet est requis'
    }),
  format: Joi.string()
    .valid('csv', 'json', 'excel')
    .default('csv')
    .messages({
      'any.only': 'Le format doit être csv, json ou excel'
    })
});

// Schéma pour l'export d'analyse
const exportAnalysisSchema = Joi.object({
  analysisId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID de l\'analyse doit être un nombre',
      'any.required': 'L\'ID de l\'analyse est requis'
    }),
  format: Joi.string()
    .valid('pdf', 'json')
    .default('json')
    .messages({
      'any.only': 'Le format doit être pdf ou json'
    })
});

// Schéma pour le rapport de performance
const performanceReportSchema = Joi.object({
  projectId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID du projet doit être un nombre',
      'any.required': 'L\'ID du projet est requis'
    }),
  startDate: Joi.date()
    .required()
    .messages({
      'date.base': 'La date de début doit être une date valide',
      'any.required': 'La date de début est requise'
    }),
  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .required()
    .messages({
      'date.base': 'La date de fin doit être une date valide',
      'date.min': 'La date de fin doit être après la date de début',
      'any.required': 'La date de fin est requise'
    })
});

// Ajouter aux exports existants
module.exports = {
  validate,
  validateParams,
  validateQuery,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    project: projectSchema,
    financialData: financialDataSchema,
    analysis: analysisSchema,
    exportFinancial: exportFinancialSchema,
    exportAnalysis: exportAnalysisSchema,
    performanceReport: performanceReportSchema
  }
};