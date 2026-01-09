import { ESTADO } from '../core/state.js';
import { Armazenamento } from '../core/storage.js';
import { DEFINICOES_CONQUISTAS } from '../core/achievements.js';
import { Visualizacao } from './visualization.js';

export const ParteEstatisticas = {
    renderizarEstatisticas() {
        const quadro = document.getElementById('quadro-estatisticas');
        const lista = Object.keys(ESTADO.estatisticas).sort(
            (a, b) =>
                ESTADO.estatisticas[b].vitorias -
                ESTADO.estatisticas[a].vitorias,
        );
        if (lista.length === 0) {
            quadro.innerHTML =
                '<p class="texto-centralizado">Ainda não há lendas neste bar.</p>';
            return;
        }
        quadro.innerHTML = '';
        lista.forEach((nome) => {
            const s = ESTADO.estatisticas[nome];
            const conquistas = ESTADO.conquistadas[nome] || [];
            let html = `<div style="margin-bottom:15px; border-bottom:1px dashed #555; padding-bottom:10px;"> <div style="font-weight:bold; color:var(--ouro); display:flex; justify-content:space-between; align-items:center;"> <span>${nome} ${conquistas.length > 0 ? '⭐' : ''}</span> <button class="botao-velho-oeste secundario pequeno" style="margin:0; width:auto; font-size:0.7rem;" onclick="Aplicativo.visualizarConquistasJogador('${nome}')">VER CONQUISTAS</button> </div> <div style="font-size:0.9rem; margin-top:5px;">🏆 ${s.vitorias} | ☠️ ${s.acertos} | 🍀 ${s.esquivas} | 🤠 ${s.partidas || 0}</div> <div style="margin-top:5px; font-size:0.8rem;"> ${conquistas
                .map((id) => {
                    const def = DEFINICOES_CONQUISTAS.find((a) => a.id === id);
                    return def ? def.emoji : '';
                })
                .join(' ')} </div> </div>`;
            quadro.innerHTML += html;
        });
    },
    visualizarConquistasJogador(nome) {
        document.getElementById('titulo-tela-conquistas').textContent =
            `Conquistas: ${nome}`;
        const container = document.getElementById('conteudo-lista-conquistas');
        container.innerHTML = '';
        const desbloqueadas = ESTADO.conquistadas[nome] || [];
        const ordenadas = [...DEFINICOES_CONQUISTAS].sort((a, b) => {
            const temA = desbloqueadas.includes(a.id);
            const temB = desbloqueadas.includes(b.id);
            if (temA && !temB) return -1;
            if (!temA && temB) return 1;
            return 0;
        });
        ordenadas.forEach((conquista) => {
            const tem = desbloqueadas.includes(conquista.id);
            if (!tem && conquista.ehOculta) return;
            const div = document.createElement('div');
            div.className = `linha-conquista ${tem ? '' : 'bloqueada'}`;
            div.innerHTML = `<div style="font-size:1.5rem;">${tem ? conquista.emoji : '🔒'}</div> <div><div style="font-weight:bold; color:${tem ? 'var(--ouro)' : '#aaa'}">${conquista.nome}</div> <div style="font-size:0.8rem;">${conquista.descricao}</div></div>`;
            container.appendChild(div);
        });
        this.irPara('conquistas');
    },
    confirmarResetEstatisticas() {
        Visualizacao.mostrarModal(
            'QUEIMAR REGISTROS?',
            'Isso apagará todas as vitórias e conquistas para sempre.',
            [
                {
                    texto: 'SIM, QUEIME TUDO',
                    classe: 'perigo',
                    acao: () => {
                        ESTADO.conquistadas = {};
                        const novasEstatisticas = {};
                        ESTADO.bd.forEach((nomeJogador) => {
                            novasEstatisticas[nomeJogador] = {
                                vitorias: 0,
                                acertos: 0,
                                esquivas: 0,
                                partidas: 0,
                                _meta: {
                                    sequenciaVitorias: 0,
                                    sequenciaMortes: 0,
                                },
                            };
                        });
                        ESTADO.estatisticas = novasEstatisticas;
                        Armazenamento.definir(
                            'estatisticas',
                            ESTADO.estatisticas,
                        );
                        Armazenamento.definir(
                            'conquistadas',
                            ESTADO.conquistadas,
                        );
                        this.renderizarEstatisticas();
                        Visualizacao.fecharModal();
                        const t = document.getElementById('notificacaoSistema');
                        t.textContent = 'Evidências destruídas.';
                        t.classList.add('mostrar');
                        setTimeout(() => t.classList.remove('mostrar'), 2000);
                    },
                },
                {
                    texto: 'CANCELAR',
                    classe: 'secundario',
                    acao: () => Visualizacao.fecharModal(),
                },
            ],
        );
    },
};
