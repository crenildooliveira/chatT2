const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const session = require('express-session');

const app = express();
const port = 3000;

// Configuração do MySQL
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '@Eumesmo01',
    database: 'form'
});

connection.connect();

// Configuração do Express
app.use(session({
    secret: '@Eumesmo01_#1A', // Substitua com uma chave secreta forte
    resave: false,
    saveUninitialized: true
}));

// Configuração do Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar middleware para servir arquivos CSS da pasta /login
app.use('/login', express.static(__dirname + '/login'));

// Configurar middleware para servir arquivos CSS da pasta /amigos
app.use('/amigos', express.static(__dirname + '/amigos'));

// Configurar middleware para servir arquivos CSS da pasta /conversa
app.use('/conversa', express.static(__dirname + '/conversa'));


//-----------------------------------------------------------------------


// Rota principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login/login.html');
});

// Use o middleware de autenticação para proteger a rota /amigos
app.get('/amigos', autenticacaoMiddleware, (req, res) => {
    res.sendFile(__dirname + '/amigos/amigos.html');
});


// Rota para obter a lista de amigos do usuário
app.get('/amigos/listar', autenticacaoMiddleware, (req, res) => {
    const idUsuario = req.session.usuario.id; // Obtém o ID do usuário autenticado

    // Consulta ao banco de dados para obter a lista de amigos
    connection.query(
        'SELECT * FROM solicitacoes_amizade ' +
        'WHERE (id_remetente = ? OR id_destinatario = ?) AND status = "aceita"',
        [idUsuario, idUsuario],
        (error, results) => {
            if (error) {
                console.error('Erro ao obter lista de amigos:', error);
                res.status(500).send('Erro ao obter lista de amigos');
            } else {
                // Lista de amigos encontrados
                const amigos = results.map(solicitacao => {
                    if (solicitacao.id_remetente === idUsuario) {
                        return solicitacao.id_destinatario;
                    } else {
                        return solicitacao.id_remetente;
                    }
                });

                // Consulta ao banco de dados para obter detalhes dos amigos
                connection.query(
                    'SELECT idusuarios, nome, email FROM usuarios WHERE idusuarios IN (?)',
                    [amigos],
                    (error, amigosDetails) => {
                        if (error) {
                            console.error('Erro ao obter detalhes dos amigos:', error);
                            res.status(500).send('Erro ao obter detalhes dos amigos');
                        } else {
                            // Retorna a lista de amigos do usuário
                            res.json({ idUsuario: idUsuario, amigos: amigosDetails });
                        }
                    }
                );
            }
        }
    );
});


//-----------------------------------------------------------------------


// Rota para obter mensagens
app.post('/obter-mensagens', autenticacaoMiddleware, (req, res) => {
    const { idRemetente, idDestinatario } = req.body;

    console.log("Remetente: " + idRemetente, " Destinatario: " + idDestinatario);

    if (idRemetente && idDestinatario) {
        // Consulte o banco de dados para obter as mensagens entre esses dois usuários
        connection.query(
            'SELECT * FROM mensagens WHERE (id_remetente = ? AND id_destinatario = ?) OR (id_remetente = ? AND id_destinatario = ?) ORDER BY idmensagem',
            [idRemetente, idDestinatario, idDestinatario, idRemetente],
            (error, results) => {
                if (error) {
                    console.error('Erro ao obter mensagens:', error);
                    res.status(500).send('Erro ao obter mensagens');
                } else {
                    console.log("Mensagens obtidas com sucesso!");
                    console.log(results);
                    res.json(results);
                }
            }
        );
    } else {
        console.error('IDs do remetente e destinatário não encontrados na URL');
        res.status(400).send('IDs do remetente e destinatário são obrigatórios');
    }
});



//-----------------------------------------------------------------------


// Rota de cadastro de usuário
app.post('/cadastro', (req, res) => {
    const { nome, email, senha, telefone, sexo, data_nasc } = req.body;

    bcrypt.hash(senha, 10, (err, hash) => {
        if (err) throw err;

        connection.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, sexo, data_nasc) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, hash, telefone, sexo, data_nasc],
            (error, results) => {
                if (error) throw error;

                res.send('Usuário cadastrado com sucesso!');
            }
        );
    });
});


//-----------------------------------------------------------------------


// Rota de login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
            const usuario = results[0];
            bcrypt.compare(senha, usuario.senha, (err, result) => {
                if (result) {
                    // Autenticação bem-sucedida, armazene informações na sessão
                    req.session.usuario = {
                        id: usuario.idusuarios,
                        nome: usuario.nome,
                        email: usuario.email
                    };

                    // Imprimir mensagem no servidor
                    console.log(`Autenticação bem-sucedida - ID: ${usuario.idusuarios} - Nome: ${usuario.nome} - Email: ${usuario.email}`);

                    // Redirecionamento para a página de amigos apenas após autenticação bem-sucedida
                    res.redirect('/amigos');
                } else {
                    console.log('Credenciais inválidas.');
                    res.status(401).send('Credenciais inválidas.');
                }
            });
        } else {
            console.log('Usuário não encontrado.');
            res.status(401).send('Usuário não encontrado.');
        }
    });
});


//-----------------------------------------------------------------------


// Adicione isso ao seu server.js ou onde você configura suas rotas
app.post('/enviar-mensagem', autenticacaoMiddleware, (req, res) => {
    const idRemetente = req.body.idRemetente; // corrigido aqui
    const idDestinatario = req.body.idDestinatario; // corrigido aqui
    const conteudo = req.body.conteudo;

    connection.query(
        'INSERT INTO mensagens (id_remetente, id_destinatario, conteudo) VALUES (?, ?, ?)',
        [idRemetente, idDestinatario, conteudo],
        (error, results) => {
            if (error) {
                console.error('Erro ao enviar mensagem:', error);
                res.status(500).send('Erro ao enviar mensagem');
            } else {
                console.log("Mensagem enviada com sucesso");
                res.status(200).send('Mensagem enviada com sucesso');
            }
        }
    );
});



//-----------------------------------------------------------------------


// Adicione isso ao seu server.js ou onde você configura suas rotas
app.get('/conversa', autenticacaoMiddleware, (req, res) => {
    res.sendFile(__dirname + '/conversa/conversa.html');
});


//-----------------------------------------------------------------------


// Adicione isso no seu server.js ou onde você configura suas rotas
function autenticacaoMiddleware(req, res, next) {
    if (req.session && req.session.usuario) {
        return next(); // Usuário autenticado, permita o acesso à rota
    } else {
        res.redirect('/'); // Redirecionar para a página de login se não estiver autenticado
    }
}


//-----------------------------------------------------------------------

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
