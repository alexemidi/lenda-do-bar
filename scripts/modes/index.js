import { ESTADO } from '../core/state.js';
import { CONFIGURACAO, TEMPOS } from '../core/config.js';
import { SistemaAudio } from '../core/audio.js';
import { Logica } from '../core/logic.js';

export const ParteModos = {
    modoDuelo: false,
    doseAtivo: false,
    indiceVingador: null,
    indiceJusticeiro: null,
    tirosDoseRestantes: 2,
    contadorTirosSiMesmo: 0,

    _esperar(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    },

    alternarModoDuelo() {
        if (ESTADO.jogo.botoesBloqueados) return;
        if (ESTADO.jogo.ehMassacre && ESTADO.jogo.atirando) return;

        const btn = document.getElementById('botao-alternar-duelo');

        if (this.modoDuelo) {
            this.modoDuelo = false;
            ESTADO.jogo.indiceProtegido = null;
            ESTADO.jogo.atirando = false;
            btn.classList.remove('modo-ativo');
            this.atualizarStatus(null, null);
            this.renderizarListaJogadores();
            return;
        }

        if (ESTADO.jogo.caos.ativo || this.doseAtivo) return;

        this.modoDuelo = true;
        btn.classList.add('modo-ativo');
        this.atualizarStatus(
            CONFIGURACAO.emojis.especiais.Morte,
            'Escolha o protegido',
        );
        this.renderizarListaJogadores();
    },

    async acionarMassacre(indiceProtegido) {
        if (ESTADO.jogo.atirando) return;
        ESTADO.jogo.atirando = true;
        ESTADO.jogo.ehMassacre = true;
        ESTADO.jogo.indiceProtegido = indiceProtegido;
        ESTADO.jogo.mostrandoTransformacaoMassacre = true; // ATIVA TRANSFORMAÇÃO VISUAL (😇/😭)

        document
            .getElementById('botao-alternar-duelo')
            .classList.remove('modo-ativo');
        this.renderizarListaJogadores();
        this.atualizarStatus(
            CONFIGURACAO.emojis.especiais.Morte,
            CONFIGURACAO.morte.inicioMassacre,
        );
        await this._esperar(TEMPOS.LEITURA_FALA);

        const jogadoresParaEngatilhar = ESTADO.jogo.jogadores.filter((p, i) => i !== indiceProtegido && p.vivo);
        for (let i = 0; i < jogadoresParaEngatilhar.length; i++) {
            SistemaAudio.tocar('engatilhar');
            const [min, max] = TEMPOS.FAIXA_ENGATILHAMENTO;
            const tempoAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
            await this._esperar(tempoAleatorio);
        }

        await this._esperar(1000);
        const alvos = ESTADO.jogo.jogadores.filter(
            (p, i) => i !== indiceProtegido && p.vivo,
        );
        let vitimas = [];
        let sobreviventes = [];
        alvos.forEach((p) => {
            const indiceReal = ESTADO.jogo.jogadores.indexOf(p);
            const ehTrapaceiro = ESTADO.jogo.papeis[indiceReal] === 'trapaceiro';

            // FASE 2.3: Proteção de Massacre (Hierarquia de Auto-Defesa)
            const tiroFatalReal = p.arma.getContador ? (p.arma.getContador() === p.arma.bala) : (p.arma.contador === p.arma.bala);
            const emFrenesi = ehTrapaceiro && p.contadorVirtual >= 8;
            const ehMorteFatal = tiroFatalReal || emFrenesi;

            if (ehMorteFatal) {
                // HIERARQUIA DE MASSACRE (Atirador == Alvo)

                // 1. Reverso (🔄) - Apenas para tiro fatal REAL (Não para Frenesi)
                if (ehTrapaceiro && tiroFatalReal && !p.reversoUsado) {
                    p.reversoUsado = true;
                    ESTADO.jogo.historicoMesa.reverso = true;
                    console.log(`🔄 ${p.nome}: Reverso salvou do Massacre!`);

                    p.contadorVirtual++; // Sobreviveu
                    sobreviventes.push(p);
                    return;
                }

                // 2. Última Chance (🎰) - Salva de Frenesi OU Fatal Real
                if (ehTrapaceiro && !p._habilidadesUsadas.ultimaChance) {
                    p._habilidadesUsadas.ultimaChance = true;
                    ESTADO.jogo.historicoMesa.ultimaChance = true;
                    ESTADO.jogo.historicoMesa.trapaceiroRevelado = p.nome;
                    console.log(`🎰 ${p.nome}: Última Chance salvou do Massacre (Frenesi/Fatal)!`);

                    p.arma.bala = (p.arma.bala + 1) % 6; // Empurra projétil fatal
                    p.contadorVirtual++;
                    sobreviventes.push(p);
                    return;
                }

                // 3. Pare (🚫) - Apenas para tiro fatal REAL (Não para Frenesi)
                if (ehTrapaceiro && tiroFatalReal && !p._habilidadesUsadas.pare && p.contadorVirtual < 7 && !p.emDesespero) {
                    p._habilidadesUsadas.pare = true;
                    ESTADO.jogo.historicoMesa.pare = true;
                    console.log(`🚫 ${p.nome}: Pare salvou do Massacre (Residual)!`);

                    p.contadorVirtual++;
                    sobreviventes.push(p);
                    return;
                }
            }

            p.contadorVirtual++;
            if (ehMorteFatal) vitimas.push(p);
            else sobreviventes.push(p);
        });
        if (vitimas.length > 0) {
            SistemaAudio.tocar('vazio');
            this.atualizarStatus('💨', 'CLICK!');
            await this._esperar(TEMPOS.ATRASO_TIRO / 2);
            SistemaAudio.tocar('tiro');
            vitimas.forEach((p) => {
                p.vivo = false;
                if (!ESTADO.estatisticas[p.nome])
                    ESTADO.estatisticas[p.nome] = {
                        vitorias: 0,
                        acertos: 0,
                        esquivas: 0,
                    };
                ESTADO.estatisticas[p.nome].acertos++;
                ESTADO.estatisticas[p.nome]._meta = {
                    ...ESTADO.estatisticas[p.nome]._meta,
                    sequenciaMortes:
                        (ESTADO.estatisticas[p.nome]._meta?.sequenciaMortes ||
                            0) + 1,
                    sequenciaVitorias: 0,
                };
                Logica.verificarConquistas(
                    p.nome,
                    { morreuNoTiro: p.contadorVirtual },
                    true,
                );
            });
            sobreviventes.forEach((p) => {
                if (p.arma.contador === 5)
                    Logica.verificarConquistas(
                        p.nome,
                        { sobreviventeCaos: true },
                        true,
                    );
                p.arma.contador++;
                if (!ESTADO.estatisticas[p.nome])
                    ESTADO.estatisticas[p.nome] = {
                        vitorias: 0,
                        acertos: 0,
                        esquivas: 0,
                    };
                ESTADO.estatisticas[p.nome].esquivas++;
            });
            document.body.classList.add('tremer-tela');
            setTimeout(
                () => document.body.classList.remove('tremer-tela'),
                500,
            );
            this.atualizarStatus('💥', 'POW!');
            this.renderizarListaJogadores();
            await this._esperar(TEMPOS.LEITURA_RESULTADO);
            this.finalizarMassacre(vitimas.length, vitimas);
        } else {
            SistemaAudio.tocar('vazio');
            this.atualizarStatus('💨', 'CLICK!');
            sobreviventes.forEach((p) => {
                if (p.arma.contador === 5)
                    Logica.verificarConquistas(
                        p.nome,
                        { sobreviventeCaos: true },
                        true,
                    );
                p.arma.contador++;
                if (!ESTADO.estatisticas[p.nome])
                    ESTADO.estatisticas[p.nome] = {
                        vitorias: 0,
                        acertos: 0,
                        esquivas: 0,
                    };
                ESTADO.estatisticas[p.nome].esquivas++;
            });
            this.renderizarListaJogadores();
            await this._esperar(TEMPOS.LEITURA_FALA);
            this.finalizarMassacre(0, []);
        }
    },

    async finalizarMassacre(contagemMortes, vitimas) {
        const jogadores = ESTADO.jogo.jogadores;
        ESTADO.jogo.turnosMesa++;
        if (contagemMortes >= 3) {
            const protegidoP = jogadores[ESTADO.jogo.indiceProtegido];
            if (protegidoP && protegidoP.vivo)
                Logica.verificarConquistas(
                    protegidoP.nome,
                    { ehMassacre: true, mortesMassacre: contagemMortes },
                    true,
                );
        }
        const jogadorProtegido = jogadores[ESTADO.jogo.indiceProtegido];
        ESTADO.jogo.ultimoIndiceProtegido = ESTADO.jogo.indiceProtegido;
        ESTADO.jogo.ehMassacre = false;
        ESTADO.jogo.mostrandoTransformacaoMassacre = false; // RESET DA TRANSFORMAÇÃO (😇/😭)
        ESTADO.jogo.indiceProtegido = null;
        this.modoDuelo = false;
        this.renderizarListaJogadores();
        let mensagem = '';
        let emoji = CONFIGURACAO.emojis.especiais.Morte;
        if (contagemMortes === 0) {
            const linhas = CONFIGURACAO.morte.semMorteMassacre;
            mensagem = linhas[Math.floor(Math.random() * linhas.length)];
        } else if (contagemMortes === 1) {
            mensagem = CONFIGURACAO.morte.morteMassacre.replace(
                '{nome}',
                vitimas[0].nome,
            );
        } else {
            mensagem = CONFIGURACAO.morte.protegidoAgradecimento.replace(
                '{nome}',
                jogadorProtegido ? jogadorProtegido.nome : 'Alguém',
            );
        }
        this.atualizarStatus(emoji, mensagem);
        await this._esperar(TEMPOS.LEITURA_FALA);
        let proximaVez =
            (ESTADO.jogo.ultimoIndiceProtegido + 2) % jogadores.length;
        const contagemVivos = jogadores.filter((p) => p.vivo).length;
        if (contagemVivos <= 1)
            this.verificarFluxoJogo(ESTADO.jogo.ultimoIndiceProtegido);
        else {
            while (!jogadores[proximaVez].vivo)
                proximaVez = (proximaVez + 1) % jogadores.length;
            ESTADO.jogo.indiceVez = proximaVez;
            ESTADO.jogo.atirando = false;
            if (Logica.rotacionarMesa())
                this.executarAnimacaoRotacao(false);
            else this.atualizarInterfaceJogo();
        }
    },

    alternarModoCaos() {
        if (ESTADO.jogo.botoesBloqueados) return;
        if (
            ESTADO.jogo.caos.ativo &&
            ESTADO.jogo.caos.indiceEscolhaAtual >= ESTADO.jogo.caos.fila.length
        )
            return;
        const btn = document.getElementById('botao-alternar-caos');
        if (ESTADO.jogo.caos.ativo) {
            ESTADO.jogo.caos.ativo = false;
            ESTADO.jogo.atirando = false;
            ESTADO.jogo.caos.fila = [];
            ESTADO.jogo.caos.alvos = {};
            ESTADO.jogo.caos.votos = {};
            btn.classList.remove('modo-ativo');
            this.atualizarStatus(null, null);
            this.renderizarListaJogadores();
            const nomeJogador =
                ESTADO.jogo.jogadores[ESTADO.jogo.indiceVez].nome;
            const infoIniciante = document.getElementById('info-iniciante');
            if (infoIniciante)
                infoIniciante.innerHTML = `★ <b>${nomeJogador}</b> começa essa bagaça`;
            return;
        }
        if (ESTADO.jogo.atirando || this.modoDuelo || this.doseAtivo) return;
        ESTADO.jogo.caos.ativo = true;
        ESTADO.jogo.atirando = true;
        this.modoDuelo = false;
        btn.classList.add('modo-ativo');
        ESTADO.jogo.caos.alvos = {};
        ESTADO.jogo.caos.votos = {};
        ESTADO.jogo.caos.alvoDiabo = null;
        const jogadores = ESTADO.jogo.jogadores;
        let fila = [];
        let indiceInicio = ESTADO.jogo.indiceVez;
        for (let i = 0; i < jogadores.length; i++) {
            let idx = (indiceInicio + i) % jogadores.length;
            if (jogadores[idx].vivo) fila.push(idx);
        }
        ESTADO.jogo.caos.fila = fila;
        ESTADO.jogo.caos.indiceEscolhaAtual = 0;
        this.renderizarListaJogadores();
        const introducaoDiabo = CONFIGURACAO.diabo.introducao;
        this.atualizarStatus(
            CONFIGURACAO.emojis.especiais.Diabo,
            introducaoDiabo,
        );
        this.renderizarListaJogadores(); // Garante que botões fiquem desabilitados na intro

        setTimeout(() => {
            if (ESTADO.jogo.caos.ativo) {
                this.proximoEscolhedorCaos();
            }
        }, TEMPOS.LEITURA_FALA);
    },

    proximoEscolhedorCaos() {
        const fila = ESTADO.jogo.caos.fila;
        const indiceFilaAtual = ESTADO.jogo.caos.indiceEscolhaAtual;
        if (indiceFilaAtual >= fila.length) {
            this.resolverCaos();
            return;
        }
        const indiceEscolhedor = fila[indiceFilaAtual];
        const nomeEscolhedor = ESTADO.jogo.jogadores[indiceEscolhedor].nome;
        const alvos = ESTADO.jogo.jogadores.filter(
            (p, i) => p.vivo && i !== indiceEscolhedor,
        );
        const alvoAleatorio = alvos[Math.floor(Math.random() * alvos.length)];
        ESTADO.jogo.caos.alvoDiabo = alvoAleatorio
            ? ESTADO.jogo.jogadores.indexOf(alvoAleatorio)
            : null;
        const provocacoes = CONFIGURACAO.diabo.provocacoes;
        let provocacao =
            provocacoes[Math.floor(Math.random() * provocacoes.length)];

        const nomeAtirador = ESTADO.jogo.jogadores[indiceEscolhedor].nome;
        const nomeAlvo = alvoAleatorio ? alvoAleatorio.nome : 'alguém';
        provocacao = provocacao
            .replace(/{atirador}/g, nomeAtirador)
            .replace(/{alvo}/g, nomeAlvo);

        const provocacaoLimpa = provocacao.replace(/👿|😈/g, '').trim();
        this.atualizarStatus(
            CONFIGURACAO.emojis.especiais.Diabo,
            provocacaoLimpa,
        );

        // Libera a interação após o Diabo começar a provocar
        ESTADO.jogo.atirando = false;
        this.renderizarListaJogadores();
    },

    manipularEscolhaCaos(indiceAlvo) {
        const fila = ESTADO.jogo.caos.fila;
        const indiceEscolhedorReal = fila[ESTADO.jogo.caos.indiceEscolhaAtual];
        ESTADO.jogo.caos.alvos[indiceEscolhedorReal] = indiceAlvo;
        ESTADO.jogo.caos.votos[indiceAlvo] =
            (ESTADO.jogo.caos.votos[indiceAlvo] || 0) + 1;
        ESTADO.jogo.caos.indiceEscolhaAtual++;
        this.proximoEscolhedorCaos();
    },

    async resolverCaos() {
        document
            .getElementById('botao-alternar-caos')
            .classList.remove('modo-ativo');
        const infoIniciante = document.getElementById('info-iniciante');
        if (infoIniciante) infoIniciante.innerHTML = '';
        const mensagemBruta = CONFIGURACAO.diabo.encerramento;
        const mensagemDiabo = mensagemBruta.replace(/👿|😈/g, '').trim();
        this.atualizarStatus(
            CONFIGURACAO.emojis.especiais.Diabo,
            mensagemDiabo,
        );
        this.renderizarListaJogadores();
        await this._esperar(TEMPOS.LEITURA_FALA);
        const jogadores = ESTADO.jogo.jogadores;
        const atiradores = ESTADO.jogo.caos.fila;
        for (let i = 0; i < atiradores.length; i++) {
            SistemaAudio.tocar('engatilhar');

            // Tempo orgânico entre engatilhamentos (FASE 2 - Natualização)
            const [min, max] = TEMPOS.FAIXA_ENGATILHAMENTO;
            const tempoAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
            await this._esperar(tempoAleatorio);
        }
        await this._esperar(1000);
        let algumBang = false;
        let tirosLetais = {};
        atiradores.forEach((sIdx) => {
            const s = jogadores[sIdx];
            const ehTrapaceiro = this._ehTrapaceiro(sIdx);
            const ehFrenesi = ehTrapaceiro && s.contadorVirtual >= 8;

            if (ehFrenesi || (s.arma.contador === s.arma.bala)) {
                algumBang = true;
                tirosLetais[sIdx] = true;
            }
        });
        SistemaAudio.tocar(algumBang ? 'tiro' : 'vazio');
        if (algumBang) {
            document.body.classList.add('tremer-tela');
            setTimeout(
                () => document.body.classList.remove('tremer-tela'),
                500,
            );
        }

        // Pausa dramática para ver o status da animação e feedback sonoro
        await this._esperar(TEMPOS.ENGATILHAR);

        let mortes = [];
        let ricocheteAtivado = false;

        atiradores.forEach((indiceAtirador) => {
            const atirador = jogadores[indiceAtirador];
            const ehTrapaceiro = this._ehTrapaceiro(indiceAtirador);
            const ehFrenesi = ehTrapaceiro && atirador.contadorVirtual >= 8;
            const ehBang = ehFrenesi || (atirador.arma.contador === atirador.arma.bala);
            const indiceAlvo = ESTADO.jogo.caos.alvos[indiceAtirador];
            const alvo = jogadores[indiceAlvo];

            if (indiceAlvo === ESTADO.jogo.caos.alvoDiabo) {
                Logica.verificarConquistas(
                    atirador.nome,
                    { ouviuDiabo: true },
                    true,
                );
            }
            if (ehBang && atirador.arma.contador >= 4) {
                Logica.verificarConquistas(
                    atirador.nome,
                    { sorteCaosAcerto: true },
                    true,
                );
            }

            if (ehBang) {
                const resDef = this._processarDefesasHierarquicas(atirador, alvo, 'caos', true);

                if (resDef.ehMorte) {
                    if (alvo.vivo && !mortes.includes(alvo)) {
                        mortes.push(alvo);
                    }
                    Logica.resetarArma(atirador);
                } else {
                    // Defesa ativou (Ricochete ou Pare)
                    if (resDef.ricocheteAtivou) {
                        const inocentesVivos = jogadores.filter((j, i) =>
                            j.vivo && ESTADO.jogo.papeis[i] === 'jogador'
                        );
                        if (inocentesVivos.length > 0) {
                            const vitimaRicochete = inocentesVivos[Math.floor(Math.random() * inocentesVivos.length)];
                            ESTADO.jogo.historicoMesa.vitimaRicochete = vitimaRicochete.nome;
                            if (!mortes.includes(vitimaRicochete)) {
                                mortes.push(vitimaRicochete);
                            }
                        }
                    }
                    Logica.resetarArma(atirador);
                }
            } else {
                atirador.arma.contador++;

                // FASE 2: Letal também incrementa para trapaceiros (Piada / Consistência)
                if (ehTrapaceiro && atirador.armaAtaque) {
                    atirador.armaAtaque.contador++;
                    if (atirador.armaAtaque.contador > 3) atirador.armaAtaque.contador = 0;
                }

                atirador.contadorVirtual++;
            }
        });
        atiradores.forEach((indiceAtirador) => {
            const indiceAlvo = ESTADO.jogo.caos.alvos[indiceAtirador];
            if (ESTADO.jogo.caos.alvos[indiceAlvo] === indiceAtirador) {
                if (tirosLetais[indiceAtirador] && tirosLetais[indiceAlvo]) {
                    const atirador = jogadores[indiceAtirador];
                    const alvo = jogadores[indiceAlvo];
                    if (!mortes.includes(atirador)) mortes.push(atirador);
                    if (!mortes.includes(alvo)) mortes.push(alvo);
                    Logica.verificarConquistas(
                        atirador.nome,
                        { morteCaosMutua: true },
                        false,
                    );
                    Logica.verificarConquistas(
                        alvo.nome,
                        { morteCaosMutua: true },
                        false,
                    );
                }
            }
        });
        mortes.forEach((d) => {
            d.vivo = false;
            console.log(`☠️ ${d.nome}: Morreu no Caos!`);
            if (!ESTADO.estatisticas[d.nome])
                ESTADO.estatisticas[d.nome] = {
                    vitorias: 0,
                    acertos: 0,
                    esquivas: 0,
                };
            ESTADO.estatisticas[d.nome].acertos++;
            ESTADO.estatisticas[d.nome]._meta = {
                ...ESTADO.estatisticas[d.nome]._meta,
                sequenciaMortes:
                    (ESTADO.estatisticas[d.nome]._meta?.sequenciaMortes || 0) +
                    1,
                sequenciaVitorias: 0,
            };
            Logica.verificarConquistas(
                d.nome,
                { morreuNoTiro: d.contadorVirtual },
                true,
            );
        });
        Object.keys(ESTADO.jogo.caos.votos).forEach((tIdxStr) => {
            const tIdx = parseInt(tIdxStr);
            const p = jogadores[tIdx];
            if (p.vivo && ESTADO.jogo.caos.votos[tIdx] >= 3) {
                Logica.verificarConquistas(
                    p.nome,
                    { inimigoPublicoSobreviveu: true },
                    true,
                );
            }
        });
        ESTADO.jogo.turnosMesa++;

        // Ativar estado de alívio visual (FASE 2)
        ESTADO.jogo.caos.mostrandoAlivio = true;
        this.renderizarListaJogadores();

        // Pausa para ver quem morreu na lista e o alívio dos sobreviventes
        await this._esperar(TEMPOS.LEITURA_FALA);

        let mensagemResultado = '';
        let emojiDiabo = CONFIGURACAO.emojis.especiais.Diabo;
        const rConf = CONFIGURACAO.diabo.resultados;

        const totalNoCaos = atiradores.length;
        const totalMortosCaos = mortes.filter(m => atiradores.includes(jogadores.indexOf(m))).length;

        if (totalMortosCaos >= totalNoCaos && totalNoCaos > 0) {
            mensagemResultado = rConf.todosMortos[0];
        } else if (mortes.length === 0) {
            const nenhum = rConf.nenhum;
            mensagemResultado = nenhum[Math.floor(Math.random() * nenhum.length)];
        } else if (mortes.length === 1) {
            mensagemResultado = rConf.um[Math.floor(Math.random() * rConf.um.length)];
        } else {
            mensagemResultado = rConf.muitos[Math.floor(Math.random() * rConf.muitos.length)];
        }

        const resultadoLimpo = mensagemResultado.replace(/👿|😈/g, '').trim();
        this.atualizarStatus(emojiDiabo, resultadoLimpo);

        await this._esperar(TEMPOS.LEITURA_FALA + 1000);

        ESTADO.jogo.caos.ativo = false;
        ESTADO.jogo.caos.mostrandoAlivio = false; // RESET DO ALÍVIO (😮‍💨)
        ESTADO.jogo.atirando = false;
        ESTADO.jogo.caos.votos = {};
        const vivos = jogadores.filter((p) => p.vivo);
        if (vivos.length <= 1) {
            this.verificarFluxoJogo(0);
        } else {
            const proximoInicio =
                vivos[Math.floor(Math.random() * vivos.length)];
            ESTADO.jogo.indiceVez = jogadores.indexOf(proximoInicio);
            this.atualizarInterfaceJogo();
        }
    },

    alternarDoseDupla() {
        if (ESTADO.jogo.botoesBloqueados) return;
        if (ESTADO.jogo.atirando || ESTADO.jogo.caos.ativo || this.modoDuelo)
            return;
        const btn = document.getElementById('botao-alternar-dose');

        if (this.doseAtivo) {
            this.doseAtivo = false;
            this.indiceJusticeiro = null;
            btn.classList.remove('modo-ativo');
            this.atualizarStatus(null, null);
            this.renderizarListaJogadores();
            return;
        }

        this.doseAtivo = true;
        this.indiceJusticeiro = null;
        this.tirosDoseRestantes = 2;
        this.contadorTirosSiMesmo = 0;

        btn.classList.add('modo-ativo');
        const mensagemXerife =
            CONFIGURACAO.xerife.introducao[
            Math.floor(
                Math.random() * CONFIGURACAO.xerife.introducao.length,
            )
            ];
        this.atualizarStatus(
            CONFIGURACAO.emojis.especiais.Xerife,
            mensagemXerife,
        );
        this.renderizarListaJogadores();
    },

    definirJusticeiro(indice) {
        this.indiceJusticeiro = indice;
        console.log(`🤠 ${ESTADO.jogo.jogadores[indice].nome}: Tornou-se Justiceiro!`);
        const mensagemXerife =
            CONFIGURACAO.xerife.alvo[
            Math.floor(Math.random() * CONFIGURACAO.xerife.alvo.length)
            ];
        this.atualizarStatus(
            CONFIGURACAO.emojis.especiais.Xerife,
            mensagemXerife,
        );
        this.renderizarListaJogadores();
    },

    async manipularAcaoDose(indiceAlvo) {
        if (ESTADO.jogo.atirando) return;

        const ehSiMesmo = indiceAlvo === this.indiceJusticeiro;
        const atirador = ESTADO.jogo.jogadores[this.indiceJusticeiro];
        const alvo = ESTADO.jogo.jogadores[indiceAlvo];

        if (ehSiMesmo) {
            this.contadorTirosSiMesmo++;
            const mensagem =
                this.contadorTirosSiMesmo === 1
                    ? CONFIGURACAO.xerife.siMesmo[0]
                    : CONFIGURACAO.xerife.siMesmoNovamente[0];
            this.atualizarStatus(
                CONFIGURACAO.emojis.especiais.Xerife,
                mensagem,
            );
        } else {
            const mensagem =
                CONFIGURACAO.xerife.alvo[
                Math.floor(
                    Math.random() * CONFIGURACAO.xerife.alvo.length,
                )
                ];
            this.atualizarStatus(
                CONFIGURACAO.emojis.especiais.Xerife,
                mensagem,
            );
        }

        ESTADO.jogo.atirando = true;
        this.renderizarListaJogadores();

        await this._esperar(TEMPOS.ENGATILHAR);
        SistemaAudio.tocar('engatilhar');


        await this._esperar(TEMPOS.ATRASO_TIRO);

        // 1. Predição de Morte
        const atiradorEhTrapaceiro = this._ehTrapaceiro(this.indiceJusticeiro);
        const ehMorteOriginal = atiradorEhTrapaceiro
            ? Aplicativo._verificarMortePotencialTrapaceiro(atirador)
            : (atirador.arma.contador === atirador.arma.bala);

        // 2. Aplicação de Defesas Hierárquicas (Justiceiro): Piada > Ilusão > Pare
        const resultadoDefesa = this._processarDefesasHierarquicas(atirador, alvo, 'justiceiro', ehMorteOriginal);
        const ehMorte = resultadoDefesa.ehMorte;
        const armaTravou = resultadoDefesa.armaTravou;

        // 3. Execução dos Incrementos
        // Inocente só incrementa contador real se a arma não travou
        if (!armaTravou) {
            atirador.arma.contador++;

            // FASE 2: Se for trapaceiro, a arma letal também incrementa (Art. 13.2 e Piada)
            if (atiradorEhTrapaceiro && atirador.armaAtaque) {
                atirador.armaAtaque.contador++;
                if (atirador.armaAtaque.contador > 3) atirador.armaAtaque.contador = 0;
            }
        }
        atirador.contadorVirtual++;

        if (atirador.arma.contador > 5) {
            atirador.arma.contador = 0;
        }

        // Ilusão já faz o reset interno se ativado em _processarDefesasHierarquicas

        SistemaAudio.tocar(ehMorte ? 'tiro' : 'vazio');
        if (ehMorte) {
            document.body.classList.add('tremer-tela');
            setTimeout(
                () => document.body.classList.remove('tremer-tela'),
                500,
            );
            this.atualizarStatus('💥', 'POW!');

            alvo.vivo = false;
            console.log(`☠️ ${alvo.nome}: Morreu pelas mãos do Justiceiro!`);
            if (!ehSiMesmo) {
                Logica.resetarArma(atirador);
            }
            this.renderizarListaJogadores();
        } else {
            // Apenas feedback genérico (não revela habilidades)
            this.atualizarStatus('💨', 'CLICK!');
        }

        await this._esperar(TEMPOS.LEITURA_RESULTADO);
        this.processarResultadoDose(ehMorte, ehSiMesmo, indiceAlvo);
    },

    processarResultadoDose(ehMorte, ehSiMesmo, indiceAlvo) {
        const atirador = ESTADO.jogo.jogadores[this.indiceJusticeiro];
        const iconeXerife = CONFIGURACAO.emojis.especiais.Xerife;

        if (ehMorte) {
            if (ehSiMesmo) {
                this.atualizarStatus(
                    iconeXerife,
                    CONFIGURACAO.xerife.siMesmoMorrer[0],
                );
            } else {
                this.atualizarStatus(
                    iconeXerife,
                    CONFIGURACAO.xerife.alvoMorrer[0],
                );
            }
            this.finalizarModoDose(true);
        } else {
            atirador.arma.contador++;
            atirador.contadorVirtual++;

            if (ehSiMesmo) {
                this.atualizarStatus(
                    iconeXerife,
                    CONFIGURACAO.xerife.siMesmoSobreviver[0],
                );
                Logica.verificarConquistas(
                    atirador.nome,
                    { atirouEmSiDose: true },
                    true,
                );
            } else {
                this.tirosDoseRestantes--;
                if (this.tirosDoseRestantes > 0) {
                    this.atualizarStatus(
                        iconeXerife,
                        CONFIGURACAO.xerife.alvoSobreviver[0],
                    );
                } else {
                    this.atualizarStatus(
                        iconeXerife,
                        CONFIGURACAO.xerife.nenhum[0],
                    );
                    this.finalizarModoDose(false);
                    return;
                }
            }
            ESTADO.jogo.atirando = false;
            this.renderizarListaJogadores();
        }
    },

    async finalizarModoDose(alguemMorreu) {
        await this._esperar(TEMPOS.LEITURA_FALA);

        this.doseAtivo = false;
        ESTADO.jogo.atirando = false;
        document
            .getElementById('botao-alternar-dose')
            .classList.remove('modo-ativo');

        if (alguemMorreu) {
            this.verificarFluxoJogo(this.indiceJusticeiro);
        } else {
            ESTADO.jogo.turnosMesa++;
            this.definirProximaVez(this.indiceJusticeiro);
            if (Logica.rotacionarMesa())
                this.executarAnimacaoRotacao(false);
            else this.atualizarInterfaceJogo();
        }
    },
};
