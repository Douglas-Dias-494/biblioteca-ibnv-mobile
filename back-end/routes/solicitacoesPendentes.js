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
    l.IMAGEM_URL,
    TO_CHAR(ls.DATA_SOLICITACAO, 'DD-MM-YY') AS DATA_SOLICITACAO_FORMATADA
FROM
    LIVROS_SOLICITADOS ls
JOIN
    USERS u ON u.ID = ls.USUARIO_ID
JOIN
    LIVROS l ON l.ID = ls.LIVRO_ID
WHERE
    ls.STATUS = 'pendente' AND ls.USUARIO_ID = :usuarioId`,
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

router.get('/livros/:livroId/solicitacao-status', verificarToken, async (req, res) => {
  let connection; // Declare connection outside try to ensure it's accessible in finally

  try {
    connection = await getConnection();
    const livroId = req.params.livroId;
    const usuarioId = req.usuario.id; // ID do usuário logado, do seu middleware

    if (!livroId) {
      return res.status(400).json({ message: "ID do livro é obrigatório." });
    }

    const result = await connection.execute(
      `SELECT
        STATUS
      FROM
        LIVROS_SOLICITADOS
      WHERE
        LIVRO_ID = :livroId AND USUARIO_ID = :usuarioId`,
      {
        livroId: livroId,
        usuarioId: usuarioId
      },
      { outFormat: oracledb.OBJECT }
    );

    if (result.rows.length > 0) {
      // Se encontrou uma solicitação para este livro e usuário
      const statusSolicitacao = result.rows[0].STATUS;
      res.json({
        hasPendingRequest: true,
        status: statusSolicitacao
      });
    } else {
      // Não encontrou nenhuma solicitação para este livro e usuário
      res.json({
        hasPendingRequest: false,
        status: null
      });
    }

  } catch (error) {
    console.error('Erro ao verificar status de solicitação do livro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao verificar o status da solicitação.' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão com o banco de dados:', err);
      }
    }
  }
}
)



module.exports = router
