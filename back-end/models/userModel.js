const db = require('../config/database');

async function findUserByEmail(email) {
  let client;

  try {
    client = await db.getConnection();
    
    const sql = `
      SELECT id, nome, email, senha_hash,role 
      FROM users 
      WHERE email = $1
    `;
    const values = [email];
    
    const result = await client.query(sql, values);
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar usuário por e-mail:', error);
    throw error;
  } finally {
    if (client) {
      await client.release();
    }
  }
}

module.exports = { findUserByEmail };
