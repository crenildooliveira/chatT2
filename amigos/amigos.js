// amigos.js
document.addEventListener('DOMContentLoaded', function () {
    function carregarListaAmigos() {
            fetch('/amigos/listar')
            .then(response => response.json())
            .then(data => {
                const amigosLista = document.getElementById('amigos-lista');
                const idRemetente = data.idUsuario;
                const amigos = data.amigos;
        
                amigosLista.innerHTML = ''; // Limpa a lista antes de adicionar os amigos
        
                amigos.forEach(amigo => {
                    // Aqui você pode usar tanto o idUsuario quanto os detalhes do amigo
                    console.log(`ID do usuário: ${idRemetente}`);
                    console.log(`Detalhes do amigo: ${JSON.stringify(amigo)}`);

                    const amigoElemento = document.createElement('div');
                    amigoElemento.classList.add('amigo');

                    const detalhesElemento = document.createElement('div');
                    detalhesElemento.classList.add('amigo-details');

                    const nomeElemento = document.createElement('p');
                    nomeElemento.textContent = `Nome: ${amigo.nome}`;

                    const emailElemento = document.createElement('p');
                    emailElemento.textContent = `Email: ${amigo.email}`;

                    const idElemento = document.createElement('p');
                    idElemento.textContent = `ID: ${amigo.idusuarios}`;

                    detalhesElemento.appendChild(nomeElemento);
                    detalhesElemento.appendChild(emailElemento);
                    detalhesElemento.appendChild(idElemento);

                    amigoElemento.appendChild(detalhesElemento);
                    amigosLista.appendChild(amigoElemento);

                    // Adiciona um evento de clique para redirecionar para a página de conversa
                    amigoElemento.addEventListener('click', function () {
                        window.location.href = `/conversa?idRemetente=${idRemetente}&idDestinatario=${amigo.idusuarios}`;
                    });
                });
            })
            .catch(error => console.error('Erro ao carregar lista de amigos:', error));
    }

    carregarListaAmigos();
});
