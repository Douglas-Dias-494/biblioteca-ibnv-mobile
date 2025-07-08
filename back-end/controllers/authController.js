const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findUserByEmail } = require('../models/userModel');

require('dotenv').config();

async function login(req, res) {
  const { email, senha } = req.body;

  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ erro: 'Usuário não encontrado ou inativo' });

  const senhaValida = await bcrypt.compare(senha, user.SENHA_HASH);
  if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta' });

  const token = jwt.sign({ id: user.ID, nome: user.NOME, role: user.ROLE }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });

  console.log("Role do usuário", user.ROLE);
  

  res.json({ token, usuario: {
  
    id: user.ID, 
    nome: user.NOME,
    email: user.EMAIL,
    role: user.ROLE
  
  } });
}

module.exports = {
  login
};
