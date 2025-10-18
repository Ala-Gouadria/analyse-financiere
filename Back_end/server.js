const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import de la configuration de la base de données
const db = require('./config/database');

const app = express();

// =============================================
// MIDDLEWARE DE SÉCURITÉ ET CONFIGURATION
// =============================================

// Rate Limiting pour prévenir les attaques brute force
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    success: false,
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 heures
}));

// Middleware pour parser le JSON
app.use(express.json({ 
  limit: process.env.UPLOAD_MAX_SIZE || '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: 'JSON mal formé dans le corps de la requête'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: process.env.UPLOAD_MAX_SIZE || '10mb'
}));

// Middleware de logging des requêtes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Middleware pour ajouter des headers de sécurité
app.use((req, res, next) => {
  // Headers de sécurité basiques
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Header pour l'application
  res.setHeader('X-Application-Name', process.env.APP_NAME || 'AnalyseFinancière');
  res.setHeader('X-Application-Version', process.env.APP_VERSION || '1.0.0');
  
  next();
});

// =============================================
// ROUTES DE L'API
// =============================================

// Route de santé publique
app.get('/health', async (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    const dbStatus = await db.testConnection();
    
    const healthStatus = {
      success: true,
      message: '🚀 API Analyse Financière est opérationnelle',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      database: {
        status: dbStatus ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      },
      system: {
        node_version: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification de la santé du système',
      details: error.message
    });
  }
});

// Route racine avec documentation
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: `Bienvenue sur ${process.env.APP_NAME || 'API Analyse Financière'} v${process.env.APP_VERSION || '1.0.0'}`,
    description: 'API backend pour l\'analyse financière avec intelligence artificielle',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile'
      },
      projects: {
        list: 'GET /api/projects',
        create: 'POST /api/projects',
        details: 'GET /api/projects/:id',
        update: 'PUT /api/projects/:id',
        delete: 'DELETE /api/projects/:id'
      },
      analysis: {
        analyze: 'POST /api/analysis/analyze',
        history: 'GET /api/analysis/project/:projectId',
        details: 'GET /api/analysis/:analysisId'
      },
      reports: {
        export_financial: 'POST /api/reports/export-financial-data',
        export_analysis: 'POST /api/reports/export-analysis',
        performance: 'POST /api/reports/performance'
      },
      system: {
        health: 'GET /health',
        docs: 'GET /api'
      }
    },
    documentation: 'Voir la documentation complète pour plus de détails',
    support: process.env.SUPPORT_EMAIL || 'support@analysefinanciere.com'
  });
});

// Routes de l'API principales
app.use('/api', require('./routes'));

// =============================================
// MIDDLEWARE DE GESTION D'ERREURS
// =============================================

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route non trouvée: ${req.method} ${req.originalUrl}`,
    suggestion: 'Vérifiez la documentation de l\'API à la racine (GET /)'
  });
});

// Middleware global de gestion d'erreurs
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// =============================================
// DÉMARRAGE DU SERVEUR
// =============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    console.log('🔗 Test de connexion à la base de données...');
    const dbConnected = await db.testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️  Impossible de se connecter à la base de données');
      console.log('📝 Initialisation des tables...');
      await db.initDatabase();
    }

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 SERVEUR DÉMARRÉ AVEC SUCCÈS');
      console.log('='.repeat(60));
      console.log(`📊 Application: ${process.env.APP_NAME || 'Analyse Financière'}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 Documentation: http://localhost:${PORT}/`);
      console.log(`💾 Base de données: ${dbConnected ? '✅ Connectée' : '⚠️  Mode dégradé'}`);
      console.log('='.repeat(60));
      console.log('📝 Logs des requêtes:');
      console.log('-'.repeat(60));
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', () => {
  console.log('\n\n🔴 Arrêt du serveur en cours...');
  console.log('👋 Serveur arrêté proprement');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🔴 Arrêt du serveur demandé...');
  console.log('👋 Serveur arrêté proprement');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Exception non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Rejet de promesse non géré:', reason);
  process.exit(1);
});

// Démarrer le serveur
startServer();

module.exports = app;