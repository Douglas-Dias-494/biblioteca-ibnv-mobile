const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { getConnection } = require('../config/database');
const oracledb = require('oracledb'); 


router.get('/solicitacoes/pendentes', verificarToken, async (req, res) => {
  try {

    const connection = await getConnection();
    const usuarioId = req.usuario.id
    const result = await connection.execute(
      `SELECT 
        ls.ID,
        u.EMAIL AS usuario_email,
        l.TITULO,
        l.AUTOR,
        l.CATEGORIA,
        l.ANO_PUBLICACAO,
        l.IMAGEM_URL
      FROM LIVROS_SOLICITADOS ls
      JOIN USERS u ON u.ID = ls.USUARIO_ID
      JOIN LIVROS l ON l.ID = ls.LIVRO_ID
      WHERE ls.STATUS = 'pendente' AND ls.USUARIO_ID = :usuarioId`,
      [usuarioId],
      { outFormat: oracledb.OBJECT }
    );

    res.json({ solicitacoes: result.rows });
    await connection.close();

  } catch (error) {
    console.error('Erro ao buscar solicitações pendentes:', error);
    return res.status(500).json({ erro: "Erro ao buscar solicitações" });
  }
});



module.exports = router
