import { ESTADO } from './state.js';
import { CONFIGURACAO } from './config.js';
import { Armazenamento } from './storage.js';
import { Visualizacao } from '../ui/visualization.js';
import { DEFINICOES_CONQUISTAS } from './achievements.js';

export const Logica = {
    obterNarrador() {
        const chaves = Object.keys(CONFIGURACAO.narradores);
        return chaves[Math.floor(Math.random() * chaves.length)];
    },
    criarJogador(nome, perfilFixo, ehTrapaceiro = false) {
        const jogador = {
            nome,
            perfil: perfilFixo,
            vivo: true,
            contadorVirtual: 0,
            arma: {
                contador: 0,
                bala: ehTrapaceiro ? 5 : Math.floor(Math.random() * 6) // INC-006: Trapaceiro inicia com 6/6
            },
            armaAtaque: { contador: 0, bala: Math.floor(Math.random() * 4) },
            falas: {
                antes: 0,
                depoisSobreviver: 0,
                vinganca: 0,
                passarVez: 0,
                desespero: 0,
            },
            emDesespero: false,
            reversoUsado: false,
            _debugSkills: { ricochete: false, massacre: false, ilusao: false },
            _habilidadesUsadas: {},
        };

        // INC-005: Adicionar propriedades específicas do trapaceiro
        if (ehTrapaceiro) {
            jogador.armaPassivaTipo = 'especial'; // Começa com Arma Especial
            jogador._mortesNaMesa = 0; // INC-008: Para sistema de Paciência
        }

        return jogador;
    },

    /**
     * Reseta arma do jogador (FASE 1 - INC-003, INC-004)
     * @param {Object} jogador - Objeto do jogador
     * @param {string} tipo - 'normal' (6 câmaras) ou 'letal' (4 câmaras)
     * @returns {Object} jogador - Jogador com arma resetada
     */
    resetarArma(jogador, tipo = 'normal') {
        if (tipo === 'letal') {
            // INC: Se estava em m4/4 c3/4 (ponto de disparo letal final), mantém o perigo no reset para m1/4
            const eraFatalFinal = (jogador.armaAtaque.bala === 3 && (jogador.armaAtaque.contador === 3 || jogador.armaAtaque.contador === 4));

            jogador.armaAtaque.contador = 0;
            if (eraFatalFinal) {
                jogador.armaAtaque.bala = 0; // m1/4
            } else {
                jogador.armaAtaque.bala = Math.floor(Math.random() * 4);
            }
        } else {
            // Arma Passiva/Normal (6 câmaras)
            jogador.arma.contador = 0;
            jogador.arma.bala = Math.floor(Math.random() * 6);
            jogador.contadorVirtual = 0;
        }
        jogador.emDesespero = false; // INC-004: Sempre resetar desespero
        return jogador;
    },

    rotacionarMesa(forcarProximo = false) {
        const ordem = ['K', 'Q', 'A'];
        if (forcarProximo || ESTADO.jogo.turnosMesa >= 3) {
            let idx = ordem.indexOf(ESTADO.jogo.cartaMesa);
            if (idx === -1) idx = 0;
            ESTADO.jogo.cartaMesa = ordem[(idx + 1) % ordem.length];
            ESTADO.jogo.turnosMesa = 0;
            ESTADO.jogo.mesasCompletadas++;

            // FASE 2 - INC-008: Sistema de Paciência
            if (ESTADO.jogo.modoTrapaceiro && ESTADO.jogo.trapaceiros) {
                ESTADO.jogo.trapaceiros.forEach(indiceTrap => {
                    const trap = ESTADO.jogo.jogadores[indiceTrap];
                    if (!trap || !trap.vivo) return;

                    // Paciência: trapaceiro sobreviveu 3 turnos sem matar ninguém DIRETAMENTE
                    if (trap._mortesNaMesa === 0 && trap.armaPassivaTipo === 'normal') {
                        // Renovar Arma Especial!
                        trap.armaPassivaTipo = 'especial';
                        trap.arma.bala = 5; // 6/6
                        trap.arma.contador = 0;
                        trap.contadorVirtual = 0;

                        // NOVO: Marcar evento para o Detetive
                        ESTADO.jogo.historicoMesa.paciencia = true;
                        console.log(`🔫 ${trap.nome}: Paciência ativada! Arma Especial renovada.`);
                    }

                    // Reset contador para próxima mesa
                    trap._mortesNaMesa = 0;
                });
            }

            return true;
        }
        return false;
    },
    embaralhar(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    verificarConquistas(nomeJogador, eventos, notificar = true) {
        if (!nomeJogador) return;
        if (!ESTADO.estatisticas[nomeJogador]) {
            ESTADO.estatisticas[nomeJogador] = {
                vitorias: 0,
                acertos: 0,
                esquivas: 0,
                partidas: 0,
                _meta: {},
            };
        }
        if (!ESTADO.estatisticas[nomeJogador]._meta) {
            ESTADO.estatisticas[nomeJogador]._meta = {};
        }
        const stats = ESTADO.estatisticas[nomeJogador];
        if (!ESTADO.conquistadas[nomeJogador])
            ESTADO.conquistadas[nomeJogador] = [];
        DEFINICOES_CONQUISTAS.forEach((conquista) => {
            if (!ESTADO.conquistadas[nomeJogador].includes(conquista.id)) {
                if (conquista.verificar(stats, eventos)) {
                    ESTADO.conquistadas[nomeJogador].push(conquista.id);
                    if (notificar)
                        Visualizacao.mostrarNotificacao(nomeJogador, conquista);
                    else ESTADO.jogo.desbloqueiosRodada.push(conquista.id);
                }
            }
        });
        Armazenamento.definir('estatisticas', ESTADO.estatisticas);
        Armazenamento.definir('conquistadas', ESTADO.conquistadas);
    },
};
