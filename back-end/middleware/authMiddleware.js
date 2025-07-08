// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

try {
  const user = jwt.verify(token, process.env.JWT_SECRET);
  req.usuario = user;
  next();
} catch (err) {
  return res.status(403).json({ erro: 'Token inválido ou expirado' });
}
}

module.exports = verificarToken;
