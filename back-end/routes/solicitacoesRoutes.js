const express = require("express");
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const db = require("../config/database"); // Importa o módulo de banco de dados

router.get("/livros-solicitados/:usuarioId", verificarToken, async (req, res) => {
  const { usuarioId } = req.params;
  let client;

  try {
    client = await db.getConnection();

    const sql = `SELECT livro_id FROM solicitacoes WHERE usuario_id = $1`;
    const values = [usuarioId];
    
    const result = await client.query(sql, values);

    console.log("📦 Resultado da consulta:", result.rows);

    const livrosSolicitados = result.rows.map(row => row.livro_id);
    res.json({ livrosSolicitados });
  } catch (error) {
    console.error("Erro ao buscar livros solicitados", error);
    res.status(500).json({ erro: "Erro ao buscar livros solicitados" });
  } finally {
    if (client) {
      try {
        await client.release();
      } catch (err) {
        console.error("Erro ao fechar a conexão com o PostgreSQL:", err);
      }
    }
  }
});


router.patch('/solicitacoes/:id/status', verificarToken, async (req, res) => {
  const solicitacaoId = req.params.id;
  const { status } = req.body; // Espera receber { status: 'aceito' } ou 'recusado', etc.

  // Opcional: Verifique se o usuário tem permissão de administrador
  // Isso depende de como seu middleware 'verificarToken' popula 'req.usuario'
  if (req.usuario && req.usuario.role !== 'admin') { // Assumindo que 'ADMIN' é a role de administrador
    return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem atualizar o status de solicitações.' });
  }

  if (!status) {
    return res.status(400).json({ mensagem: 'O status é obrigatório.' });
  }

  let client;
  try {
    client = await db.getConnection();

    // Atualiza o status da solicitação na tabela 'solicitacoes'
    const sql = `
      UPDATE solicitacoes
      SET status = $1
      WHERE id = $2
      RETURNING id, status, data_solicitacao, usuario_id, livro_id;
    `;
    const values = [status, solicitacaoId];

    const result = await client.query(sql, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Solicitação não encontrada.' });
    }

    res.status(200).json({ 
      mensagem: `Status da solicitação ${solicitacaoId} atualizado para '${status}' com sucesso.`,
      solicitacaoAtualizada: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar status da solicitação:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor ao atualizar o status da solicitação.' });
  } finally {
    if (client) {
      client.release();
    }
  }
});


module.exports = router;