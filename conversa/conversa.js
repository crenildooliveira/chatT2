// conversa.js
document.addEventListener('DOMContentLoaded', function () {
    const formMensagem = document.getElementById('form-mensagem');
    const mensagensContainer = document.getElementById('mensagens-container');

        const idDestinatario = obterParametroDaURL('idDestinatario');
        const idRemetente = obterParametroDaURL('idRemetente');

    formMensagem.addEventListener('submit', function (event) {
        event.preventDefault();

        const mensagem = document.getElementById('mensagem').value;
        const idDestinatario = obterParametroDaURL('idDestinatario');
        const idRemetente = obterParametroDaURL('idRemetente');
        enviarMensagem(mensagem, idRemetente, idDestinatario);

        // Limpa o campo de mensagem após o envio
        document.getElementById('mensagem').value = '';
    });

    function carregarMensagensAutomaticamente() {
        setInterval(() => {
            carregarMensagens();
        }, 5000); // Atualiza a cada 5 segundos (ajuste conforme necessário)
    }

    // Função para obter parâmetro da URL
    function obterParametroDaURL(parametro) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(parametro);
    }

    // Função para enviar mensagem (você precisa implementar)
    function enviarMensagem(conteudo, idDestinatario, idRemetente) {
        fetch('/enviar-mensagem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conteudo: conteudo,
                idRemetente: idRemetente,
                idDestinatario: idDestinatario
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('Mensagem enviada com sucesso: ' + conteudo);
                // Atualiza a lista de mensagens (você precisa implementar)
                carregarMensagens();
            } else {
                console.error('Erro ao enviar mensagem');
            }
        })
        .catch(error => console.error('Erro na requisição fetch:', error));
    }

    // Função para carregar mensagens (você precisa implementar)
    function carregarMensagens() {
    const idDestinatario = obterParametroDaURL('idDestinatario');
    const idRemetente = obterParametroDaURL('idRemetente');

    // Adapte este trecho de acordo com sua rota obter-mensagens
    fetch('/obter-mensagens', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idRemetente: idRemetente,
            idDestinatario: idDestinatario
            
        })
    })
    .then(response => response.json())
    .then(mensagens => {
        console.log('Mensagens recebidas:', mensagens); // Adicione este log
        // Atualiza a interface com as mensagens (você precisa implementar)
        exibirMensagens(mensagens);
    })
    .catch(error => console.error('Erro ao carregar mensagens:', error));
}



    // Função para exibir mensagens na interface (você precisa implementar)
    function exibirMensagens(mensagens) {
        // Limpa o conteúdo atual
        mensagensContainer.innerHTML = '';

        // Adiciona as mensagens à interface
        mensagens.forEach(mensagem => {
            const mensagemElemento = document.createElement('p');
            //mensagemElemento.textContent = `${mensagem.conteudo} - ${mensagem.timestamp}`;
            mensagemElemento.textContent = `${mensagem.conteudo}`;
            mensagensContainer.appendChild(mensagemElemento);
        });
    }

    // Inicia o carregamento automático de mensagens
    carregarMensagensAutomaticamente();
});
