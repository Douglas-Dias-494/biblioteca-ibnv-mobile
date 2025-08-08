const { Pool } = require('pg');
require('dotenv').config();

let pool;

async function initialize() {
  try {
    pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      max: 10,
      idleTimeoutMillis: 30000, 
      connectionTimeoutMillis: 2000,
    });
    console.log('Pool de conexões PostgreSQL criado e verificado com sucesso.');
  } catch (err) {
    console.error('Erro ao criar pool de conexões:', err);
  }
}

async function getConnection() {

  if (!pool) {
    throw new Error('Pool de conexões não inicializado');
  }

  return await pool.connect();
}

async function closePool() {
  if (pool) {
   try {
      await pool.end();  // tempo para fechar conexões
      console.log('Pool de conexões fechado');
    } catch (err) {
      console.error('Erro ao fechar pool de conexões:', err);
    }
  }
}

module.exports = { 
  initialize,
  getConnection,
  closePool
 };
