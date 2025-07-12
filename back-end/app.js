
/* eslint-env node */


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

const express = require('express');

const { initialize, getConnection } = require('./config/database');
const path = require('path')
const cors = require('cors');

const emailCheck = require('./routes/emailAuthLogin')
const authRoutes = require('./routes/auth');
const testeTokenRoute = require('./routes/token');
const livroRoutes = require('./routes/livros');


const solicitacoesLivros = require('./routes/solicitacoesRoutes');
const emailRoutes = require('./routes/emailRoutes');
const solicitacoesLivrosPendentes = require('./routes/solicitacoesPendentes')



const app = express();

app.use(cors());
app.use(express.json());

// eslint-disable-next-line no-undef
app.use('/images', express.static(path.join(__dirname, 'public/images')))
//++========= chamadas de endpoints

app.use('/api', testeTokenRoute);
app.use('/api', emailCheck)
app.use('/api', authRoutes); // Rotas de login
 app.use('/api/livros', livroRoutes);
 app.use('/api/email', solicitacoesLivros)
 app.use('/api/email', solicitacoesLivrosPendentes)
app.use('/api/email', emailRoutes);




//++=========

// Inicialize o pool antes de iniciar o servidor
(async () => {
  try {
    await initialize();
    const conn = await getConnection();
    console.log('Conexão com Oracle bem-sucedida!');
    await conn.close();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao conectar com Oracle:', err);
    process.exit(1); // Encerra o app se não conseguir conectar ao banco
  }
})();
