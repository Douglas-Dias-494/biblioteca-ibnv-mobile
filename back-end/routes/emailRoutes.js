const express = require("express");
const router = express.Router();
const enviarEmailParaAdmins = require("../utils/EmailService");
const verificarToken = require("../middleware/authMiddleware");
const db = require('../config/database');

router.post("/solicitar-livro", verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { livroId, titulo, autor, categoria, anoPublicacao, paginas } = req.body;

  const usuarioIdNum = Number(usuarioId);
  const livroIdNum = Number(livroId);

  if (isNaN(usuarioIdNum) || isNaN(livroIdNum)) {
    return res.status(400).json({ message: "Parâmetros inválidos: usuárioId ou livroId não são números válidos." });
  }

  let client;

  try {
    client = await db.getConnection();

    // A tabela que criamos se chama 'solicitacoes', não 'LIVROS_SOLICITADOS'
    // A sintaxe de parametrização no Postgres é por posição ($1, $2)
    const sql = `INSERT INTO solicitacoes (usuario_id, livro_id) VALUES ($1, $2)`;
    const values = [usuarioIdNum, livroIdNum];
    
    await client.query(sql, values);

    await enviarEmailParaAdmins({ titulo, autor, categoria, anoPublicacao, paginas });

    res.status(200).json({ message: "Solicitação enviada com sucesso!" });
  } catch (error) {
    console.error("Erro na solicitação:", error);
    res.status(500).json({ message: "Erro ao processar a solicitação", error });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;