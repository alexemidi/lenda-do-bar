import { ESTADO } from '../core/state.js';
import { Armazenamento } from '../core/storage.js';
import { Visualizacao } from './visualization.js';
import { CONFIGURACAO } from '../core/config.js';

export const ParteConfiguracao = {
    alternarModo(chaveModo) {
        const mapaModo = {
            massacre: {
                propriedade: 'modoMassacre',
                elemento: 'interruptor-massacre',
            },
            caos: { propriedade: 'modoCaos', elemento: 'interruptor-caos' },
            dose: {
                propriedade: 'modoDoseDupla',
                elemento: 'interruptor-dose',
            },
            trapaca: {
                propriedade: 'modoTrapaceiro',
                elemento: 'interruptor-trapaca',
            },
        };
        const config = mapaModo[chaveModo];
        if (!config) return;
        const interruptor = document.getElementById(config.elemento);
        const novoValor = interruptor.checked;

        const numJogadores = ESTADO.slots.filter(Boolean).length;

        if (chaveModo === 'trapaca') {
            if (numJogadores < 3) {
                interruptor.checked = false;
                Visualizacao.mostrarModal(
                    'MÍNIMO 3 JOGADORES',
                    'O modo Trapaceiro requer pelo menos 3 jogadores.',
                    [
                        {
                            texto: 'ENTENDI',
                            classe: 'primario',
                            acao: () => Visualizacao.fecharModal(),
                        },
                    ],
                );
                return;
            }
            ESTADO.jogo[config.propriedade] = novoValor;
            this.salvarConfiguracao();
            this.renderizarConfiguracao();
            return;
        }

        const modosGrupoA = ['massacre', 'caos', 'dose'];
        if (modosGrupoA.includes(chaveModo)) {
            if (!ESTADO.jogo.modosAtivos) ESTADO.jogo.modosAtivos = [];

            if (novoValor) {
                const idxExisting = ESTADO.jogo.modosAtivos.indexOf(chaveModo);
                if (idxExisting > -1)
                    ESTADO.jogo.modosAtivos.splice(idxExisting, 1);

                ESTADO.jogo.modosAtivos.push(chaveModo);

                let limiteModos = 1;
                if (numJogadores === 5) limiteModos = 2;
                else if (numJogadores >= 6) limiteModos = 3;

                while (ESTADO.jogo.modosAtivos.length > limiteModos) {
                    const modoRemover = ESTADO.jogo.modosAtivos.shift();
                    const mapaRemover = mapaModo[modoRemover];
                    if (mapaRemover) {
                        ESTADO.jogo[mapaRemover.propriedade] = false;
                    }
                }
            } else {
                const index = ESTADO.jogo.modosAtivos.indexOf(chaveModo);
                if (index > -1) {
                    ESTADO.jogo.modosAtivos.splice(index, 1);
                }
            }
        }

        ESTADO.jogo[config.propriedade] = novoValor;

        this.salvarConfiguracao();
        this.renderizarConfiguracao();

        if (novoValor) {
            const mensagens = {
                massacre: 'O Valete entrou na festa. Dancem 🔥',
                caos: 'O Caos está liberado 😈',
                dose: 'O Xerife está chegando... ⚖️',
                trapaca: 'Alguém entrou com cartas na manga... 🃏',
            };
            this.mostrarNotificacao(mensagens[chaveModo]);
        }
    },

    alternarModoDev() {
        const sw = document.getElementById('interruptor-dev');
        ESTADO.devMode = sw.checked;

        const swDireto = document.getElementById('interruptor-direto');
        const containerDireto = document.getElementById('container-direto');

        if (!ESTADO.devMode) {
            ESTADO.devDireto = false;
            swDireto.checked = false;
            swDireto.disabled = true;
            containerDireto.style.opacity = '0.5';
            containerDireto.style.pointerEvents = 'none';
        } else {
            swDireto.disabled = false;
            containerDireto.style.opacity = '1';
            containerDireto.style.pointerEvents = 'auto';
        }

        this.salvarConfiguracao();
    },

    alternarModoDireto() {
        const sw = document.getElementById('interruptor-direto');
        ESTADO.devDireto = sw.checked;
        this.salvarConfiguracao();
    },

    validarModos() {
        const numJogadores = ESTADO.slots.filter(Boolean).length;
        if (numJogadores < 3 && ESTADO.jogo.modoTrapaceiro) {
            ESTADO.jogo.modoTrapaceiro = false;
        }

        const ativosReais = [];
        if (ESTADO.jogo.modoMassacre) ativosReais.push('massacre');
        if (ESTADO.jogo.modoCaos) ativosReais.push('caos');
        if (ESTADO.jogo.modoDoseDupla) ativosReais.push('dose');

        const booleanCount =
            (ESTADO.jogo.modoMassacre ? 1 : 0) +
            (ESTADO.jogo.modoCaos ? 1 : 0) +
            (ESTADO.jogo.modoDoseDupla ? 1 : 0);
        if (
            !ESTADO.jogo.modosAtivos ||
            ESTADO.jogo.modosAtivos.length !== booleanCount
        ) {
            ESTADO.jogo.modosAtivos = ativosReais;
        }
    },

    renderizarConfiguracao() {
        const container = document.getElementById('contenedor-slots');
        if (!container) return;
        container.innerHTML = '';

        const slotsAtuais = ESTADO.slots || [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ];
        const preenchidos = slotsAtuais.filter(Boolean).length;

        const entradas = {
            massacre: document.getElementById('interruptor-massacre'),
            caos: document.getElementById('interruptor-caos'),
            dose: document.getElementById('interruptor-dose'),
            trapaca: document.getElementById('interruptor-trapaca'),
            dev: document.getElementById('interruptor-dev'),
            direto: document.getElementById('interruptor-direto'),
        };

        this.validarModos();

        if (entradas.massacre)
            entradas.massacre.checked = ESTADO.jogo.modoMassacre;
        if (entradas.caos) entradas.caos.checked = ESTADO.jogo.modoCaos;
        if (entradas.dose) entradas.dose.checked = ESTADO.jogo.modoDoseDupla;
        if (entradas.trapaca)
            entradas.trapaca.checked = ESTADO.jogo.modoTrapaceiro;

        if (entradas.dev) entradas.dev.checked = ESTADO.devMode;
        if (entradas.direto) entradas.direto.checked = ESTADO.devDireto;

        const containerDireto = document.getElementById('container-direto');
        if (containerDireto && entradas.direto) {
            if (!ESTADO.devMode) {
                entradas.direto.disabled = true;
                containerDireto.style.opacity = '0.5';
                containerDireto.style.pointerEvents = 'none';
            } else {
                entradas.direto.disabled = false;
                containerDireto.style.opacity = '1';
                containerDireto.style.pointerEvents = 'auto';
            }
        }

        if (
            preenchidos === 7 &&
            (!ESTADO.jogo.modoMassacre ||
                !ESTADO.jogo.modoCaos ||
                !ESTADO.jogo.modoDoseDupla)
        ) {
            ESTADO.jogo.modoMassacre = true;
            ESTADO.jogo.modoCaos = true;
            ESTADO.jogo.modoDoseDupla = true;

            if (entradas.massacre) entradas.massacre.checked = true;
            if (entradas.caos) entradas.caos.checked = true;
            if (entradas.dose) entradas.dose.checked = true;

            // Atualizar modos ativos sem duplicar
            ['massacre', 'caos', 'dose'].forEach((m) => {
                if (!ESTADO.jogo.modosAtivos.includes(m))
                    ESTADO.jogo.modosAtivos.push(m);
            });
            this.salvarConfiguracao();
        } else if (
            preenchidos === 6 &&
            !ESTADO.jogo.modoMassacre &&
            !ESTADO.jogo.modoCaos &&
            !ESTADO.jogo.modoDoseDupla
        ) {
            ESTADO.jogo.modoMassacre = true;
            if (entradas.massacre) entradas.massacre.checked = true;
            if (!ESTADO.jogo.modosAtivos.includes('massacre'))
                ESTADO.jogo.modosAtivos.push('massacre');
            this.salvarConfiguracao();
        }

        const slotsParaMostrar = Math.min(7, Math.max(2, preenchidos + 1));
        for (let i = 0; i < slotsParaMostrar; i++) {
            const nome = slotsAtuais[i];
            const div = document.createElement('div');
            div.className = 'linha-slot';
            if (!nome) {
                div.innerHTML = `<span class="nome-slot" style="opacity:0.5; font-style:italic">Vazio...</span><button class="botao-velho-oeste secundario pequeno" onclick="Aplicativo.abrirSelecao(${i})">Selecionar</button>`;
            } else {
                div.innerHTML = `<span class="nome-slot">${nome}</span><div style="display:flex; gap:4px;"><button class="botao-mini fundo-azul" onclick="Aplicativo.moverSlot(${i}, -1)" style="${i === 0 ? 'visibility:hidden' : ''}">▲</button><button class="botao-mini fundo-azul" onclick="Aplicativo.moverSlot(${i}, 1)" style="${i >= preenchidos - 1 ? 'visibility:hidden' : ''}">▼</button><button class="botao-mini fundo-vermelho" onclick="Aplicativo.limparSlot(${i})">X</button></div>`;
            }
            container.appendChild(div);
        }

        const botaoIniciar = document.getElementById('botao-iniciar-partida');
        if (botaoIniciar) botaoIniciar.disabled = preenchidos < 2;

        if (preenchidos < 3 && ESTADO.jogo.modoTrapaceiro) {
            ESTADO.jogo.modoTrapaceiro = false;
            if (entradas.trapaca) entradas.trapaca.checked = false;
            this.salvarConfiguracao();
        }
        const containerTrapaca = document.querySelector(
            '.contenedor-interruptor.estilo-trapaca',
        );
        if (containerTrapaca) {
            if (preenchidos < 3) {
                containerTrapaca.style.opacity = '0.5';
                containerTrapaca.style.pointerEvents = 'none';
            } else {
                containerTrapaca.style.opacity = '1';
                containerTrapaca.style.pointerEvents = 'auto';
            }
        }
        Armazenamento.definir('slots', slotsAtuais);
    },

    moverSlot(indice, direcao) {
        if (!ESTADO.slots) return;
        const indiceAlvo = indice + direcao;
        if (indiceAlvo < 0 || indiceAlvo >= ESTADO.slots.length) return;
        const tmp = ESTADO.slots[indice];
        ESTADO.slots[indice] = ESTADO.slots[indiceAlvo];
        ESTADO.slots[indiceAlvo] = tmp;
        const compactado = ESTADO.slots.filter(Boolean);
        ESTADO.slots = compactado.concat(
            Array(7 - compactado.length).fill(null),
        );
        this.renderizarConfiguracao();
    },

    limparSlot(indice) {
        if (!ESTADO.slots) return;
        ESTADO.slots[indice] = null;
        const compactado = ESTADO.slots.filter(Boolean);
        ESTADO.slots = compactado.concat(
            Array(7 - compactado.length).fill(null),
        );
        this.renderizarConfiguracao();
    },

    abrirSelecao(indice) {
        this.slotAtual = indice;
        this.renderizarListaBD();
        this.irPara('banco-dados');
    },

    renderizarListaBD() {
        const listaBD = document.getElementById('lista-bd');
        if (!listaBD) return;
        listaBD.innerHTML = '';
        const usados = ESTADO.slots ? ESTADO.slots.filter(Boolean) : [];
        const disponiveis = ESTADO.bd.filter((n) => !usados.includes(n));
        if (disponiveis.length === 0)
            listaBD.innerHTML =
                '<p style="text-align:center; opacity:0.6">Nenhum salvo.</p>';
        disponiveis.forEach((nomeJogador) => {
            const linha = document.createElement('div');
            linha.className = 'linha-bd';
            const botaoNome = document.createElement('button');
            botaoNome.className = 'botao-nome-bd';
            botaoNome.textContent = nomeJogador;
            botaoNome.onclick = () => {
                ESTADO.slots[this.slotAtual] = nomeJogador;
                this.irPara('configuracao');
                this.renderizarConfiguracao();
                this.mostrarAvisoOrdem();
            };
            const botaoRemover = document.createElement('button');
            botaoRemover.className = 'botao-remover-bd';
            botaoRemover.textContent = 'EXPULSAR';
            botaoRemover.onclick = () =>
                this.confirmarRemoverJogador(nomeJogador);
            linha.appendChild(botaoNome);
            linha.appendChild(botaoRemover);
            listaBD.appendChild(linha);
        });
    },

    adicionarNovoJogadorBD() {
        const entrada = document.getElementById('entrada-novo-jogador');
        const valor = entrada.value.trim();
        if (!ESTADO.slots) ESTADO.slots = [null, null, null, null, null, null, null];
        if (ESTADO.slots.includes(valor)) {
            Visualizacao.mostrarModal(
                'JÁ ESTÁ NA MESA!',
                `O jogador "${valor}" já foi selecionado.`,
                [
                    {
                        texto: 'Ops, foi mal',
                        classe: 'primario',
                        acao: () => Visualizacao.fecharModal(),
                    },
                ],
            );
            return;
        }
        if (valor && !ESTADO.bd.includes(valor)) {
            ESTADO.bd.push(valor);
            Armazenamento.definir('bd', ESTADO.bd);
            if (!ESTADO.estatisticas[valor]) {
                ESTADO.estatisticas[valor] = {
                    vitorias: 0,
                    acertos: 0,
                    esquivas: 0,
                    partidas: 0,
                    _meta: { sequenciaVitorias: 0, sequenciaMortes: 0 },
                };
                Armazenamento.definir('estatisticas', ESTADO.estatisticas);
            }
            entrada.value = '';
            ESTADO.slots[this.slotAtual] = valor;
            this.irPara('configuracao');
            this.renderizarConfiguracao();
            this.mostrarAvisoOrdem();
        } else if (ESTADO.bd.includes(valor)) {
            ESTADO.slots[this.slotAtual] = valor;
            entrada.value = '';
            this.irPara('configuracao');
            this.renderizarConfiguracao();
            this.mostrarAvisoOrdem();
        }
    },

    confirmarRemoverJogador(nome) {
        Visualizacao.mostrarModal(
            'EXPULSAR DO BAR?',
            `Deseja remover "${nome}" permanentemente?`,
            [
                {
                    texto: 'FORA DAQUI!',
                    classe: 'perigo',
                    acao: () => {
                        ESTADO.bd = ESTADO.bd.filter((n) => n !== nome);
                        ESTADO.slots = ESTADO.slots.map((s) =>
                            s === nome ? null : s,
                        );
                        Armazenamento.definir('bd', ESTADO.bd);
                        Armazenamento.definir('slots', ESTADO.slots);
                        this.abrirSelecao(this.slotAtual);
                        Visualizacao.fecharModal();
                    },
                },
                {
                    texto: 'DEIXA ELE',
                    classe: 'secundario',
                    acao: () => Visualizacao.fecharModal(),
                },
            ],
        );
    },

    confirmarOrdem() {
        if (ESTADO.devMode) {
            this.iniciarFluxoPartida();
            return;
        }

        const jogadores = ESTADO.slots.filter(Boolean);
        if (jogadores.length === 2) this.iniciarFluxoPartida();
        else {
            Visualizacao.mostrarModal(
                'A ORDEM ESTÁ CORRETA?',
                'Sentido anti-horário é para a direita 😒',
                [
                    {
                        texto: 'SIM, BORA!',
                        classe: 'primario',
                        acao: () => {
                            Visualizacao.fecharModal();
                            this.iniciarFluxoPartida();
                        },
                    },
                    {
                        texto: 'NÃO, PERA',
                        classe: 'secundario',
                        acao: () => Visualizacao.fecharModal(),
                    },
                ],
            );
        }
    },

    mostrarAvisoOrdem() {
        Visualizacao.mostrarModal(
            'COLOQUE OS JOGADORES EM ORDEM!',
            '',
            []
        );
        setTimeout(() => {
            Visualizacao.fecharComEfeito();
        }, 1200);
    },

    iniciarFluxoPartida() {
        this.inicializarPartida();
    },

    mostrarNotificacao(mensagem, duracao = 1500) {
        const t = document.getElementById('notificacaoSistema');
        if (!t) return;
        t.textContent = mensagem;
        t.classList.add('mostrar');
        setTimeout(() => t.classList.remove('mostrar'), duracao);
    },

    salvarConfiguracao() {
        Armazenamento.definir('configuracao', {
            massacre: ESTADO.jogo.modoMassacre,
            caos: ESTADO.jogo.modoCaos,
            doseDupla: ESTADO.jogo.modoDoseDupla,
            trapaceiro: ESTADO.jogo.modoTrapaceiro,
            devMode: ESTADO.devMode,
            devDireto: ESTADO.devDireto,
        });
    },
};
