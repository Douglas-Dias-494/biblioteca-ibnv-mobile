const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findUserByEmail } = require('../models/userModel');

require('dotenv').config();

async function login(req, res) {
  const { email, senha } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ erro: 'Usuário não encontrado ou inativo' });
    }
  
    // Acessa a senha do usuário usando o nome da coluna em minúsculas
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }
  
    // Cria o token JWT com as propriedades em minúsculas
    const token = jwt.sign({ 
      id: user.id, 
      nome: user.nome, 
      role: user.role 
    }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });
  
    console.log("Role do usuário", user.role);
  
    res.json({ token, usuario: {
      id: user.id, 
      nome: user.nome,
      email: user.email,
      role: user.role
    } });
  } catch (error) {
    console.error('Erro no processo de login:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

module.exports = {
  login
};