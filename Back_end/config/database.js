const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'analyse_financiere',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion à la base de données
pool.on('connect', () => {
  console.log('✅ Connecté à la base de données PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la base de données:', err);
});

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connexion à PostgreSQL réussie');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à PostgreSQL:', error.message);
    return false;
  }
};

// Fonction pour initialiser les tables
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Création de la table users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Création de la table projects
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Création de la table financial_data
    await client.query(`
      CREATE TABLE IF NOT EXISTS financial_data (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        period DATE NOT NULL,
        revenue DECIMAL(15,2) DEFAULT 0,
        expenses DECIMAL(15,2) DEFAULT 0,
        employees INTEGER DEFAULT 0,
        average_salary DECIMAL(10,2) DEFAULT 0,
        cash_balance DECIMAL(15,2) DEFAULT 0,
        profit_margin DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Création de la table analysis_results
    await client.query(`
      CREATE TABLE IF NOT EXISTS analysis_results (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        summary TEXT,
        risks JSONB,
        recommendations JSONB,
        gemini_response TEXT,
        risk_level VARCHAR(50) DEFAULT 'medium'
      )
    `);
    
    console.log('✅ Tables de la base de données initialisées avec succès');
    client.release();
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  testConnection,
  initDatabase,
  pool
};