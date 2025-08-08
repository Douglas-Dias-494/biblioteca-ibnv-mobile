// routes/livros.js
const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const db = require('../config/database'); // Importa o módulo de banco de dados

// Função assíncrona para buscar os livros disponíveis do PostgreSQL
async function buscarLivrosDisponiveis() {
  let client;
  try {
    client = await db.getConnection();
    const sql = `SELECT id, titulo, autor, editora, ano_publicacao, descricao, categoria, imagem_url, paginas FROM livros`;
    const result = await client.query(sql);

    const livros = result.rows.map(row => ({
      livroId: row.id,
      titulo: row.titulo,
      autor: row.autor,
      editora: row.editora,
      anoPublicacao: row.ano_publicacao,
      descricao: row.descricao,
      categoria: row.categoria,
      imagem: row.imagem_url,
      paginas: row.paginas
    }));
    return livros;
  } catch (err) {
    console.error('Erro ao buscar livros do PostgreSQL:', err);
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Rota para reservar um livro
router.post('/reservar/:idLivro', verificarToken, async (req, res) => {
  const { idLivro } = req.params;
  const idUsuario = req.usuario.id; // Supondo que o ID do usuário está no token JWT

  if (!idUsuario) {
    return res.status(401).json({ mensagem: 'ID do usuário não encontrado no token.' });
  }

  let client;
  try {
    client = await db.getConnection();
    const sql = `
      INSERT INTO reservas (id_usuario, id_livro)
      VALUES ($1, $2)
      RETURNING id_reserva, data_reserva
    `;
    const values = [idUsuario, idLivro];
    const result = await client.query(sql, values);

    res.status(201).json({
      mensagem: `Livro ${idLivro} reservado com sucesso.`,
      reserva: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao reservar livro:', err);
    res.status(500).json({ mensagem: 'Erro interno ao tentar reservar o livro.' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Endpoint para listar todos os livros disponíveis
router.get('/disponiveis', async (req, res) => {
  try {
    const livros = await buscarLivrosDisponiveis();
    res.json(livros);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao buscar livros disponíveis.' }, err);
  }
});

module.exports = router;