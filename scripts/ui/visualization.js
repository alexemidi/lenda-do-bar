export const Visualizacao = {
    mostrarModal(titulo, mensagem, botoes) {
        const m = document.getElementById('modalPersonalizado');
        if (!m) return;
        document.getElementById('tituloModal').textContent = titulo;
        document.getElementById('mensagemModal').textContent = mensagem;
        const act = document.getElementById('acoesModal');
        act.innerHTML = '';
        botoes.forEach((b) => {
            const btn = document.createElement('button');
            btn.textContent = b.texto;
            btn.className = `botao-velho-oeste ${b.classe}`;
            btn.onclick = b.acao;
            act.appendChild(btn);
        });
        m.classList.add('ativa');
    },
    fecharModal() {
        const m = document.getElementById('modalPersonalizado');
        if (m) {
            m.classList.remove('ativa');
            m.classList.remove('saindo');
        }
    },
    fecharComEfeito() {
        const m = document.getElementById('modalPersonalizado');
        if (m && m.classList.contains('ativa')) {
            m.classList.add('saindo');
            setTimeout(() => {
                this.fecharModal();
            }, 500);
        }
    },
    mostrarNotificacao(nomeJogador, conquista) {
        const t = document.getElementById('notificacaoConquista');
        if (!t) return;
        document.getElementById('nomeJogadorConquista').textContent =
            nomeJogador;
        document.getElementById('emojiConquista').textContent = conquista.emoji;
        document.getElementById('nomeConquista').textContent = conquista.nome;
        t.classList.add('mostrar');
        setTimeout(() => t.classList.remove('mostrar'), 3500);
    },
};
