const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

dotenv.config();

const { DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;

const conn = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_DATABASE,
    user: DB_USER,
    password: DB_PASSWORD
});

conn.connect(error => {
    if (error) {
        console.error('Erro ao conectar ao banco de dados!' + error.stack);
        return;
    }
    console.log('Sucesso ao conectar com o banco de dados!');
});

app.get('/users', async (req, res) => {
    try {
        conn.query('SELECT * FROM users', (error, results) => {
            if (error) {
                res.status(500).send('Erro ao obter dados.');
                return;
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Erro ao obter dados.' + error.stack);
        res.status(500).send('Erro ao obter dados.');
    }
});

app.get('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        conn.query('SELECT * FROM users WHERE ID = ?', [id], (error, results) => {
            if (error) {
                res.status(500).send('Erro ao obter dados.');
                return;
            }
            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Erro ao obter dados.' + error.stack);
        res.status(500).send('Erro ao obter dados.');
    }
});

app.post('/users', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        res.status(400).send('Todos os campos são obrigatórios!');
        return;
    }    
    
    try {
        conn.query('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senha], (error, results) => {
            if (error) {
                res.status(500).send('Erro ao inserir um novo usários!');
                return;
            }
            res.status(201).send('Usuário criado com sucesso!');
        });
    } catch (error) {
        console.error('Erro ao inserir um novo usários!' + error.stack);
        res.status(500).send('Erro ao inserir um novo usários!');
    }

});

app.put('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        res.status(400).send('Todos os campos são obrigatórios!');
        return;
    }

    try {
        conn.query('SELECT id FROM users WHERE id = ?', [id], (error, results) => {
            if (error) {
                res.status(500).send('Erro ao buscar dados!');
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).send('Usuário não encontrado!');
                return;
            }
        });

        conn.query('UPDATE users SET nome = ?, email = ?, senha = ? WHERE id = ?', [nome, email, senha, id], (error, results) => {
            if (error) {
                res.status(500).send('Erro ao atualizar o usuário');
                return;
            }
            res.status(200).json(results[0]);
        });

    } catch (error) {
        console.error('Erro ao atualizar o usuário' + error.stack);
        res.status(500).send('Erro ao atualizar o usuário');
    }

});

app.delete('/users/:id', async (req, res) => {
    const id = parent(req.params.id);

    try {

        conn.query('SELECT id FROM users WHERE id = ?', [id], (error, results) => {
            if (error) {
                res.status(500).send('Erro ao buscar dados!');
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).send('Usuário não encontrado!');
                return;
            }
        });

        conn.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {
            if (error) {
                res.status(500).send('Erro ao excluír usuário!');
                return;
            }
        });

    } catch (error) {
        console.error('Erro ao excluír usuário!' + error.stack);
        res.status(500).send('Erro ao excluír usuário!');
    }

});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});