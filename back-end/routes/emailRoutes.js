const express = require("express");
const router = express.Router();
const enviarEmailParaAdmins = require("../utils/EmailService");
const verificarToken = require("../middleware/authMiddleware");
const { getConnection } = require("oracledb");

router.post("/solicitar-livro", verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { livroId, titulo, autor, categoria, anoPublicacao, paginas } = req.body;

  console.log("Valores originais:", { usuarioId, livroId });

  const usuarioIdNum = Number(usuarioId);
  const livroIdNum = Number(livroId);

  console.log("Valores convertidos:", { usuarioIdNum, livroIdNum });

  if (isNaN(usuarioIdNum) || isNaN(livroIdNum)) {
    return res.status(400).json({ message: "Parâmetros inválidos: usuárioId ou livroId não são números válidos." });
  }

  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `INSERT INTO LIVROS_SOLICITADOS (USUARIO_ID, LIVRO_ID) VALUES (:usuarioId, :livroId)`,
      {
        usuarioId: usuarioIdNum,
        livroId: livroIdNum
      },
      { autoCommit: true }
    );

    await enviarEmailParaAdmins({ titulo, autor, categoria, anoPublicacao, paginas });

    res.status(200).json({ message: "Solicitação enviada com sucesso!" });
  } catch (error) {
    console.error("Erro na solicitação:", error);
    res.status(500).json({ message: "Erro ao processar a solicitação", error });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Erro ao fechar a conexão:", err);
      }
    }
  }
});


module.exports = router;
