const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');

router.get('/token', verificarToken, (req, res) => {
  res.json({
    mensagem: 'Token válido!',
    usuario: req.usuario
  });
});

module.exports = router;
