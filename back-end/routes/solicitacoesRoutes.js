const express = require("express");
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { getConnection } = require("../config/database");

router.get("/livros-solicitados/:usuarioId", verificarToken, async (req, res) => {

  const { usuarioId } = req.params;
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT LIVRO_ID FROM LIVROS_SOLICITADOS WHERE USUARIO_ID = :usuarioId`,
      { usuarioId }
    );

      console.log("📦 Resultado da consulta:", result.rows);


    const livrosSolicitados = result.rows.map(row => row[0]); // OK para Oracle
    res.json({ livrosSolicitados });
  } catch (error) {
    console.error("Erro ao buscar livros solicitados", error);
    res.status(500).json({ erro: "Erro ao buscar livros solicitados" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Erro ao fechar conexão Oracle:", err);
      }
    }
  }
});

module.exports = router;
