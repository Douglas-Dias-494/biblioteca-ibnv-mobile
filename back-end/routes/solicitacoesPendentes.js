const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const db = require('../config/database'); // Importa o seu módulo de banco de dados

router.get('/solicitacoes/pendentes', verificarToken, async (req, res) => {
  let client;
  try {
    client = await db.getConnection();
    const usuarioId = req.usuario.id;
    const usuarioRole = req.usuario.role; // Assumindo que o role está no token JWT e é decodificado para req.usuario.role

    let sql;
    let values = [];

    // Lógica condicional baseada na role do usuário
    if (usuarioRole === 'admin') { // Se o usuário logado for um ADMIN
      sql = `
        SELECT
            s.id,
            u.email AS usuario_email,
            l.titulo,
            l.autor,
            l.categoria,
            l.ano_publicacao,
            l.imagem_url,
            TO_CHAR(s.data_solicitacao, 'DD-MM-YY') AS data_solicitacao_formatada
        FROM
            solicitacoes s
        JOIN
            users u ON u.id = s.usuario_id
        JOIN
            livros l ON l.id = s.livro_id
        WHERE
            s.status = 'pendente'
      `;
      // Não há necessidade de 'values' aqui, pois não há parâmetros na query para ADMIN
    } else { // Se for um usuário comum, mostra apenas as suas próprias solicitações
      sql = `
        SELECT
            s.id,
            u.email AS usuario_email,
            l.titulo,
            l.autor,
            l.categoria,
            l.ano_publicacao,
            l.imagem_url,
            s.status,
            TO_CHAR(s.data_solicitacao, 'DD-MM-YY') AS data_solicitacao_formatada
        FROM
            solicitacoes s
        JOIN
            users u ON u.id = s.usuario_id
        JOIN
            livros l ON l.id = s.livro_id
        WHERE
            s.status = 'pendente' AND s.usuario_id = $1
      `;
      values = [usuarioId]; // Passa o ID do usuário como parâmetro
    }

    const result = await client.query(sql, values);
    res.json({ solicitacoes: result.rows });

  } catch (error) {
    console.error('Erro ao buscar solicitações pendentes:', error);
    return res.status(500).json({ erro: "Erro ao buscar solicitações" });
  } finally {
    if (client) {
      client.release();
    }
  }
});

router.get('/livros/:livroId/solicitacao-status', verificarToken, async (req, res) => {
  let client;
  try {
    client = await db.getConnection();
    const livroId = req.params.livroId;
    const usuarioId = req.usuario.id;

    if (!livroId) {
      return res.status(400).json({ message: "ID do livro é obrigatório." });
    }

    // Parâmetros posicionais $1 e $2
    const sql = `
      SELECT
          status
      FROM
          solicitacoes
      WHERE
          livro_id = $1 AND usuario_id = $2 AND status IN ('pendente', 'emprestado')
    `;
    const values = [livroId, usuarioId];
    
    const result = await client.query(sql, values);

    if (result.rows.length > 0) {
      const statusSolicitacao = result.rows[0].status;
      res.json({
        hasPendingRequest: true,
        status: statusSolicitacao
      });
    } else {
      res.json({
        hasPendingRequest: false,
        status: null
      });
    }

  } catch (error) {
    console.error('Erro ao verificar status de solicitação do livro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao verificar o status da solicitação.' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;