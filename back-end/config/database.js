const oracledb = require('oracledb');
require('dotenv').config();

let pool;

async function initialize() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolAlias: 'default',  // Esse nome deve bater com o que você usa no getConnection
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log('Pool de conexões Oracle criado com sucesso');
  } catch (err) {
    console.error('Erro ao criar pool de conexões:', err);
  }
}

async function getConnection() {

  if (!pool) {
    throw new Error('Pool de conexões não inicializado');
  }

  return await pool.getConnection();
}

async function closePool() {
  if (pool) {
   try {
      await pool.close(10);  // tempo para fechar conexões
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
