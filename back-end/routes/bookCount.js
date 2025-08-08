const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Importando o seu módulo de banco de dados

router.get('/count', async (req, res) => {
    let client;
    try {
        client = await db.getConnection();
        const result = await client.query(`SELECT COUNT(*) AS total_livros FROM livros`);
        
        // No PostgreSQL, os nomes das colunas são minúsculos por padrão
        const totalLivros = result.rows[0].total_livros;
        res.status(200).json({ totalLivros });

    } catch (error) {
        console.error('Erro ao buscar contagem total de livros:', error);
        res.status(500).json({ message: 'Erro ao processar solicitação de contagem de livros', error });
    } finally {
        if (client) {
            client.release();
        }
    }
});

router.get('/requests', async (req, res) => {
    let client;
    try {
        client = await db.getConnection();
        // A tabela que criamos se chama 'solicitacoes', não 'LIVROS_SOLICITADOS'
        const result = await client.query(`SELECT COUNT(*) AS livros_solicitados FROM solicitacoes WHERE status = 'pendente'`);
        
        const livrosSolicitados = result.rows[0].livros_solicitados;
        res.status(200).json({ livrosSolicitados });
        
    } catch (error) {
        console.error('Erro ao buscar contagem total de livros solicitados:', error);
        res.status(500).json({ message: 'Erro ao processar solicitação de contagem de solicitações', error });
    } finally {
        if (client) {
            client.release();
        }
    }
});

router.get('/requested-books', async (req, res) => {
    let client;
    try {
        client = await db.getConnection();
        // A tabela que criamos se chama 'solicitacoes', não 'LIVROS_SOLICITADOS'
        const result = await client.query(`SELECT COUNT(*) AS livros_emprestados FROM solicitacoes WHERE status = 'aceito'`);
        
        const livrosEmprestados = result.rows[0].livros_emprestados;
        res.status(200).json({ livrosEmprestados });
        
    } catch (error) {
        console.error('Erro ao buscar contagem total de livros emprestados:', error);
        res.status(500).json({ message: 'Erro ao processar solicitação de contagem de livros emprestados', error });
    } finally {
        if (client) {
            client.release();
        }
    }
});

module.exports = router;