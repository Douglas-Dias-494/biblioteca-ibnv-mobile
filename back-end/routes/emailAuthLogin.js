const express = require('express');
const db = require('../config/database'); // Importa o seu módulo de banco de dados
const router = express.Router();

router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  let client;

  try {
    client = await db.getConnection();

    // 1. Sintaxe da query usa parâmetros posicionais ($1)
    const sql = `SELECT COUNT(*) FROM users WHERE email = $1`;
    // 2. Os valores são passados como um array
    const values = [email];
    
    const result = await client.query(sql, values);

    // 3. Acessando os dados do resultado
    const count = parseInt(result.rows[0].count, 10);
    const emailExists = count > 0;
    
    res.json({ emailExists });

  } catch (error) {
    console.error('Erro ao verificar e-mail:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao verificar e-mail.' });
  } finally {
    if (client) {
      // 4. Liberando a conexão para o pool
      try {
        await client.release(); 
      } catch (err) {
        console.error('Erro ao liberar conexão:', err);
      }
    }
  }
});

module.exports = router;