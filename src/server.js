const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

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
        conn.query('SELECT * FROM users', async (error, results) => {
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
        conn.query('SELECT * FROM users WHERE ID = ?', [id], async (error, results) => {
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

;

app.put('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        res.status(400).send('Todos os campos são obrigatórios!');
        return;
    }

    try {
        conn.query('SELECT id FROM users WHERE id = ?', [id], async (error, results) => {
            if (error) {
                res.status(500).send('Erro ao buscar dados!');
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).send('Usuário não encontrado!');
                return;
            }
        });

        conn.query('UPDATE users SET nome = ?, email = ?, senha = ? WHERE id = ?', [nome, email, senha, id], async (error, results) => {
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
    const id = parseInt(req.params.id);

    try {

        conn.query('SELECT id FROM users WHERE id = ?', [id], async (error, results) => {
            if (error) {
                res.status(500).send('Erro ao buscar dados!');
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).send('Usuário não encontrado!');
                return;
            }
        });

        conn.query('DELETE FROM users WHERE id = ?', [id], async (error, results) => {
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


app.post('/resgitrar', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        res.status(400).send('Todos os campos são obrigatórios!');
        return;
    }

    try {

        conn.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                res.status(500).send('Erro ao efetuar o busca!');
                return;
            }

            if (results.length > 0) {
                res.status(409).send('Este e-mail já existe!');
                return;
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            conn.query('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senhaHash], async (error, results) => {
                if (error) {
                    res.status(500).send('Erro ao efetuar o registro!');
                    return;
                }
                res.status(201).json({ mensagem: 'Registro efetuado com sucesso!', usuario: { id: results.insertId, nome: nome, email: email, senha: senhaHash } });
            });
        });

    } catch (error) {
        console.error('Erro ao efetuar o cadastro!' + error.stack);
        res.status(500).send('Erro ao efetuar o cadastro!');
    }

});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        res.status(400).send('Todos os campos são obrigatórios!');
        return;
    }

    try {

        conn.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                res.status(500).send('Erro ao buscar informações');
                return;
            }

            if (results.length == 0) {
                res.status(404).send('Usuário não encontrado!');
                return;
            }

            if (results.length > 0) {
                const user = results[0];

                const senhaCorreta = await bcrypt.compare(senha, user.senha);

                if (senhaCorreta) {
                    res.status(200).send('Usuário Logado com sucesso!');
                    return;
                }

                res.status(401).send('Credenciais inválidas!');
            }

        });

    } catch (error) {
        console.error('Erro ao efetuar o login!' + error.stack);
        res.status(500).send('Erro ao efetuar o login!');
    }

});

app.listen(PORT, () => {
   console.log(`Servidor rodando em http://localhost:${PORT}`);
});