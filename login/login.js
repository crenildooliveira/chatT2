document.addEventListener('DOMContentLoaded', function () {
    const formLogin = document.getElementById('form-login');
    const cadastro = document.getElementById('cadastro');

    // Adicione um evento ao botão de cadastro para redirecionar para a rota de cadastro
    cadastro.addEventListener('click', function () {
        window.location.href = '/cadastro'; // Substitua com a rota real de cadastro
    });

    // Adicione um evento para lidar com a submissão do formulário
    formLogin.addEventListener('submit', function (event) {
        event.preventDefault(); // Evita a submissão tradicional do formulário

        // Obtém os dados do formulário usando FormData
        const formData = new FormData(formLogin);

        // Cria um objeto com as propriedades corretas
        const data = {
            email: formData.get('email'),
            senha: formData.get('senha')
            // Adicione outras propriedades conforme necessário
        };

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            // Lógica de tratamento da resposta aqui
            if (response.ok) {
                // Redireciona para a rota após o login bem-sucedido
                window.location.href = '/amigos'; // Substitua com a rota real após o login
                console.log("Sucesso ao fazer login!")
            } else {
                console.error('Erro ao fazer login');
                // Exibe uma caixa de diálogo com a mensagem "Credenciais inválidas."
                alert('Credenciais inválidas.');

            }
        })
        .catch(error => console.error('Erro na requisição fetch:', error));
    });
});
