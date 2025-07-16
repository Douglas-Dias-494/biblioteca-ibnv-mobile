// routes/livros.js
const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const oracledb = require('oracledb')

// Configuração da conexão com o Oracle (substitua pelos seus dados)
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

// Função assíncrona para buscar os livros disponíveis do Oracle
async function buscarLivrosDisponiveis() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const sql = `SELECT ID, TITULO, AUTOR, EDITORA, ANO_PUBLICACAO, DESCRICAO, CATEGORIA,  IMAGEM_URL, PAGINAS FROM LIVROS`;
    const result = await connection.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    const livros = result.rows.map(row => ({
      livroId: row.ID,
      titulo: row.TITULO,
      autor: row.AUTOR,
      editora: row.EDITORA,
      anoPublicacao: row.ANO_PUBLICACAO,
      descricao: row.DESCRICAO,
      categoria: row.CATEGORIA,
      imagem: row.IMAGEM_URL,
      paginas: row.PAGINAS
    }));
    //console.log('Livros Mapeados:', livros); // Log dos livros mapeados
    return livros;
  } catch (err) {
    console.error('Erro ao buscar livros do Oracle:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar a conexão com o Oracle:', err);
      }
    }
  }
}

// Simulação de reserva
router.post('/reservar/:idLivro', verificarToken, (req, res) => {
    console.log('Usuário autenticado:', req.usuario);
    
  const idLivro = req.params.idLivro;
  const idUsuario = req.usuario.nome; // do JWT

  // Aqui você faria a lógica de salvar a reserva no banco
  res.json({ mensagem: `Livro ${idLivro} reservado por usuário ${idUsuario}` });
});

// Endpoint para listar todos os livros disponíveis
router.get('/disponiveis', async (req, res) => {
 try {
    const livros = await buscarLivrosDisponiveis();
    res.json(livros);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao buscar livros disponíveis.' });
  }
});

module.exports = router;
