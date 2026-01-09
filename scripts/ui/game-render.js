import { ESTADO } from '../core/state.js';
import { CONFIGURACAO } from '../core/config.js';

export const ParteRenderizacao = {
    obterEmoji(chave) {
        if (!chave) return '';
        return (
            CONFIGURACAO.emojis.personagens[chave] ||
            CONFIGURACAO.emojis.narradores[chave] ||
            CONFIGURACAO.emojis.especiais[chave] ||
            '☠️'
        );
    },

    _ehTrapaceiro(indice) {
        return ESTADO.jogo.papeis[indice] === 'trapaceiro';
    },

    atualizarStatus(emoji, texto) {
        const gs = document.getElementById('status-jogo');
        if (!gs) return;
        if (!emoji && !texto) {
            gs.innerHTML = '';
            return;
        }
        gs.innerHTML = `<div class="area-emoji-status">${emoji}</div><div class="area-texto-status">${texto}</div>`;
    },

    renderizarHudTrapaceiroDev() {
        if (!ESTADO.devMode || !ESTADO.jogo.modoTrapaceiro) {
            const hud = document.getElementById('hud-dev-habilidades');
            if (hud) hud.remove();
            return;
        }

        let hud = document.getElementById('hud-dev-habilidades');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'hud-dev-habilidades';
            document.getElementById('tela-jogo').appendChild(hud);
        }
        hud.innerHTML = '';

        const trapaceiros = ESTADO.jogo.trapaceiros;
        trapaceiros.forEach((indiceTrapaceiro) => {
            const p = ESTADO.jogo.jogadores[indiceTrapaceiro];
            if (!p.vivo) return;
            const col = document.createElement('div');
            col.className = 'coluna-habilidades';
            const nomeLabel = document.createElement('span');
            nomeLabel.className = 'legenda-trapaceiro';
            nomeLabel.textContent = p.nome.substring(0, 10);
            col.appendChild(nomeLabel);
            if (!p._debugSkills)
                p._debugSkills = {
                    ricochete: false,
                    massacre: false,
                    ilusao: false,
                };

            // FASE 4 - INC-016: Todas as 8 habilidades
            const skills = [
                { id: 'paciencia', icone: '🔫', titulo: 'Arma Especial', prop: 'armaPassivaTipo' },
                { id: 'reverso', icone: '🔄', titulo: 'Reverso', prop: 'reversoUsado' },
                { id: 'piada', icone: '😂', titulo: 'Piada', prop: '_habilidadesUsadas' },
                { id: 'vigarice', icone: '🤹‍♂️', titulo: 'Vigarice', prop: '_habilidadesUsadas' },
                { id: 'ricochete', icone: '🛡️', titulo: 'Ricochete', prop: '_debugSkills' },
                { id: 'ilusao', icone: '🎭', titulo: 'Ilusão', prop: '_habilidadesUsadas' },
                { id: 'pare', icone: '🚫', titulo: 'Pare', prop: '_habilidadesUsadas' },
                { id: 'ultimaChance', icone: '🎰', titulo: 'Última Chance', prop: '_habilidadesUsadas' },
                { id: 'frenesi', icone: '🔥', titulo: 'Frenesi', prop: 'modoTrapaceiro' },
            ];

            skills.forEach((skill) => {
                const el = document.createElement('div');

                // Determinar se foi gasto
                let gasto = false;
                if (skill.id === 'paciencia') {
                    gasto = p.armaPassivaTipo !== 'especial';
                } else if (skill.id === 'frenesi') {
                    // Frenesi: quando o contador virtual atinge 8 ou mais (Art. 16.4)
                    gasto = p.contadorVirtual < 8;
                } else if (skill.prop === 'reversoUsado') {
                    gasto = p.reversoUsado || false;
                } else if (skill.prop === '_debugSkills') {
                    gasto = p._debugSkills[skill.id] || false;
                } else if (skill.prop === '_habilidadesUsadas') {
                    gasto = p._habilidadesUsadas[skill.id] || false;
                }

                el.className = `habilidade-trapaceiro ${gasto ? 'habilidade-gasta' : ''}`;
                el.textContent = skill.icone;
                el.title = skill.titulo + (skill.id === 'frenesi' ? (gasto ? ' (Inativo)' : ' (ATIVO 🔥)') : (gasto ? ' (Gasto)' : ' (Disponível)'));
                el.onclick = () => {
                    // Toggle para debug
                    if (skill.id === 'paciencia') {
                        // Aqui na verdade é o toggle da Arma Especial via emoji 🔫
                        const ehEspecial = p.armaPassivaTipo === 'especial';
                        p.armaPassivaTipo = ehEspecial ? 'normal' : 'especial';

                        if (p.armaPassivaTipo === 'especial') {
                            p.arma.bala = 5; // m1=6/6
                            p.arma.contador = 0; // c1=0
                            p.contadorVirtual = 0; // v1=0
                            console.log(`🔧 Dev: ${p.nome} reativou Arma Especial (m1=6/6 c1=0 v1=0).`);
                        } else {
                            // Sorteia nova bala para arma normal para permitir manipulação dev
                            p.arma.bala = Math.floor(Math.random() * 6);
                            console.log(`🔧 Dev: ${p.nome} desativou Arma Especial -> Normal (m1=${p.arma.bala + 1}/6).`);
                        }
                    } else if (skill.id === 'frenesi') {
                        // Debug: Forçar estado de Frenesi (v1=8)
                        if (p.contadorVirtual < 8) {
                            p.contadorVirtual = 8;
                            console.log(`🔧 Dev: ${p.nome} forçado ao Frenesi (v1=8).`);
                        } else {
                            p.contadorVirtual = 0;
                            console.log(`🔧 Dev: ${p.nome} saiu do Frenesi.`);
                        }
                    } else if (skill.prop === 'reversoUsado') {
                        p.reversoUsado = !p.reversoUsado;
                    } else if (skill.prop === '_debugSkills') {
                        p._debugSkills[skill.id] = !p._debugSkills[skill.id];
                    } else {
                        if (!p._habilidadesUsadas) p._habilidadesUsadas = {};
                        p._habilidadesUsadas[skill.id] = !p._habilidadesUsadas[skill.id];
                    }

                    // Chama renderizarListaJogadores para atualizar tanto a lista (cor marcador) quanto o HUD
                    if (window.Aplicativo && window.Aplicativo.renderizarListaJogadores) {
                        window.Aplicativo.renderizarListaJogadores();
                    } else {
                        ParteRenderizacao.renderizarHudTrapaceiroDev();
                    }
                };
                col.appendChild(el);
            });

            hud.appendChild(col);
        });
    },

    renderizarPaineisLaterais() {
        const cartaMesa = document.getElementById('carta-mesa-jogo');
        if (!cartaMesa) return;

        const container = cartaMesa.parentNode;

        // 1. Painel Esquerdo: Lupa do Detetive (Modo Trapaceiro)
        let lupa = document.getElementById('painel-detetive-lupa');
        const mostrarLupa = ESTADO.jogo.modoTrapaceiro && ESTADO.jogo.mesasCompletadas >= 1;

        if (mostrarLupa) {
            if (!lupa) {
                lupa = document.createElement('div');
                lupa.id = 'painel-detetive-lupa';
                lupa.className = 'painel-lateral-mesa';
                container.insertBefore(lupa, cartaMesa);
            }
            lupa.innerHTML = `
                <div onclick="Aplicativo.pedirPistasDetetive()" title="Pedir pistas ao Detetive" style="cursor:pointer; font-size: 2.2rem; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5)); transform: scale(1.1);">🔍</div>
                <div style="font-size: 0.7rem; font-weight: bold; color: var(--ouro); text-shadow: 1px 1px 1px #000; letter-spacing: 1px;">PISTAS</div>
            `;
        } else if (lupa) {
            lupa.remove();
        }

        // 2. Painel Direito: Ampulheta Dev (Modo Dev)
        let ampulheta = document.getElementById('painel-dev-turno');
        if (ESTADO.devMode) {
            if (!ampulheta) {
                ampulheta = document.createElement('div');
                ampulheta.id = 'painel-dev-turno';
                ampulheta.className = 'painel-lateral-mesa';
                container.insertBefore(ampulheta, cartaMesa.nextSibling);
            }
            const rodada = (ESTADO.jogo.turnosMesa % 3) + 1;
            ampulheta.innerHTML = `
                <div onclick="Aplicativo.avancarTurno()" title="Avançar Turno (Dev)" style="cursor:pointer; font-size: 2.2rem; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5)); transform: scale(1.1);">⌛</div>
                <div style="font-size: 0.7rem; font-weight: bold; color: var(--ouro); text-shadow: 1px 1px 1px #000; letter-spacing: 1px;">TURNO ${rodada}</div>
            `;
        } else if (ampulheta) {
            ampulheta.remove();
        }
    },

    _obterEstadoBotao(indice, p, bloqueado) {
        if (!p.vivo)
            return {
                tipo: 'morto',
            };

        const atirando = ESTADO.jogo.atirando;
        const caosAtivo = ESTADO.jogo.caos.ativo;
        const escolhedorCaos =
            caosAtivo &&
            ESTADO.jogo.caos.fila[ESTADO.jogo.caos.indiceEscolhaAtual];

        if (ESTADO.jogo.vinganca.ativo) {
            const ehVingador =
                parseInt(indice) === ESTADO.jogo.vinganca.indiceVingador;
            if (ehVingador) {
                if (p.emDesespero)
                    return {
                        tipo: 'desespero',
                        desabilitado: true,
                    };
                return {
                    tipo: 'passar',
                    desabilitado: atirando || bloqueado,
                };
            }
            return {
                tipo: 'alvo',
                desabilitado: atirando || bloqueado,
            };
        }

        if (this.doseAtivo) {
            if (this.indiceJusticeiro === null)
                return {
                    tipo: 'escolhedor_dose',
                    desabilitado: bloqueado,
                };
            return {
                tipo: 'alvo_dose',
                desabilitado: atirando || bloqueado,
            };
        }

        if (caosAtivo) {
            if (indice === escolhedorCaos)
                return {
                    tipo: 'atirador_caos',
                };
            if (escolhedorCaos !== undefined)
                return {
                    tipo: 'mirar_caos',
                    desabilitado: atirando || bloqueado,
                };
        }

        if (ESTADO.jogo.ehMassacre) {
            if (indice === ESTADO.jogo.indiceProtegido)
                return {
                    tipo: 'protegido_massacre',
                };
            return {
                tipo: 'atirar_massacre',
            };
        }

        if (this.modoDuelo) {
            return {
                tipo: 'proteger_duelo',
                desabilitado: atirando || bloqueado,
            };
        }

        return {
            tipo: 'atirar_padrao',
            desabilitado: atirando || bloqueado,
        };
    },

    renderizarListaJogadores() {
        const lista = document.getElementById('lista-jogadores-jogo');
        lista.innerHTML = '';
        const botaoDuelo = document.getElementById('botao-alternar-duelo');
        const botaoCaos = document.getElementById('botao-alternar-caos');
        const botaoDose = document.getElementById('botao-alternar-dose');

        const bloqueado = ESTADO.jogo.botoesBloqueados;
        const ehDev = ESTADO.devMode;

        let mostrarBotoes =
            !ESTADO.jogo.atirando &&
            !(ESTADO.jogo.ehMassacre && ESTADO.jogo.atirando) &&
            !(this.doseAtivo && this.indiceJusticeiro !== null) &&
            !(
                ESTADO.jogo.caos.ativo &&
                ESTADO.jogo.caos.indiceEscolhaAtual >=
                ESTADO.jogo.caos.fila.length
            );

        if (ESTADO.jogo.vinganca.ativo && !ESTADO.jogo.atirando)
            mostrarBotoes = true;

        if (botaoDuelo) {
            botaoDuelo.disabled = bloqueado;
            botaoDuelo.style.display =
                mostrarBotoes &&
                    !ESTADO.jogo.vinganca.ativo &&
                    ESTADO.jogo.modoMassacre
                    ? 'block'
                    : 'none';
            botaoDuelo.style.opacity =
                this.modoDuelo || bloqueado ? '1' : '0.7';
        }
        if (botaoCaos) {
            botaoCaos.disabled = bloqueado;
            botaoCaos.style.display =
                mostrarBotoes &&
                    !ESTADO.jogo.vinganca.ativo &&
                    ESTADO.jogo.modoCaos
                    ? 'block'
                    : 'none';
            botaoCaos.style.opacity =
                ESTADO.jogo.caos.ativo || bloqueado ? '1' : '0.7';
        }
        if (botaoDose) {
            botaoDose.disabled = bloqueado;
            botaoDose.style.display =
                mostrarBotoes &&
                    !ESTADO.jogo.vinganca.ativo &&
                    ESTADO.jogo.modoDoseDupla
                    ? 'block'
                    : 'none';
            botaoDose.style.opacity = this.doseAtivo || bloqueado ? '1' : '0.7';
        }

        this.renderizarHudTrapaceiroDev();

        const ehCaosSel = ESTADO.jogo.caos.ativo;
        let indiceEscolhedor = -1;
        if (
            ehCaosSel &&
            ESTADO.jogo.caos.fila.length > 0 &&
            ESTADO.jogo.caos.indiceEscolhaAtual < ESTADO.jogo.caos.fila.length
        ) {
            indiceEscolhedor =
                ESTADO.jogo.caos.fila[ESTADO.jogo.caos.indiceEscolhaAtual];
        }

        ESTADO.jogo.jogadores.forEach((p, indice) => {
            const ehIniciante = indice === ESTADO.jogo.indiceVez;

            // Verificar se este jogador é alvo de alguém no modo Caos
            let ehAlvoMirado = false;
            let aguardandoResultado = false;
            let tremarUmaVez = false;
            if (ehCaosSel && p.vivo) {
                const votosAnteriores = p._votosAnteriores || 0;
                const votosAtuais = ESTADO.jogo.caos.votos[indice] || 0;

                // Verificar se alguém está mirando neste jogador
                for (let atirador in ESTADO.jogo.caos.alvos) {
                    if (ESTADO.jogo.caos.alvos[atirador] === indice) {
                        ehAlvoMirado = true;
                        break;
                    }
                }

                // Tremer uma vez quando recebe um novo voto
                if (votosAtuais > votosAnteriores) {
                    tremarUmaVez = true;
                    p._votosAnteriores = votosAtuais;
                }

                // Aguardando resultado = todos já escolheram e estão prontos para disparar
                aguardandoResultado = ehAlvoMirado && (ESTADO.jogo.caos.indiceEscolhaAtual >= ESTADO.jogo.caos.fila.length);
            }

            let emojiExibicao = '';
            let classeEmojiExtra = '';

            if (!p.vivo) {
                emojiExibicao = '💀';
            } else if (ESTADO.jogo.mostrandoTransformacaoMassacre) {
                // FASE DE TRANSFORMAÇÃO DO MASSACRE
                if (indice === ESTADO.jogo.indiceProtegido) {
                    emojiExibicao = '😇';
                    classeEmojiExtra = 'emoji-flutuar';
                } else {
                    emojiExibicao = '😭';
                    classeEmojiExtra = 'emoji-transformar';
                }
            } else if (ESTADO.jogo.caos.mostrandoAlivio && ehAlvoMirado) {
                // Se estiver no momento de alívio do Caos
                emojiExibicao = '😮‍💨';
            } else if (p.vivo && ehCaosSel && aguardandoResultado && ehAlvoMirado) {
                // Jogadores que são alvos e estão aguardando o resultado ficam congelados
                emojiExibicao = '🥶';
            } else if (p.vivo && ehCaosSel) {
                // No modo Caos, os emojis de tensão por votos se sobressaem (Art. 31/32)
                const votos = ESTADO.jogo.caos.votos[indice] || 0;
                if (votos === 1) emojiExibicao = '😟';
                else if (votos === 2) emojiExibicao = '😨';
                else if (votos >= 3) emojiExibicao = '😱';
                else if (p.contadorVirtual >= 6) emojiExibicao = '😅';
                else if (p.emDesespero) emojiExibicao = '😱';
                else emojiExibicao = CONFIGURACAO.emojis.personagens[p.perfil];
            } else if (p.contadorVirtual >= 6) {
                emojiExibicao = '😅';
            } else if (p.emDesespero) {
                emojiExibicao = '😱';
            } else {
                emojiExibicao = CONFIGURACAO.emojis.personagens[p.perfil];
            }


            const estadoBotao = this._obterEstadoBotao(indice, p, bloqueado);
            let htmlBotao = '';

            switch (estadoBotao.tipo) {
                case 'morto':
                    htmlBotao = `<span class="shot-glass" style="display:none;"></span>`;
                    break;
                case 'desespero':
                    htmlBotao =
                        '<button class="botao-velho-oeste secundario pequeno" disabled>😱 DESESPERO</button>';
                    break;
                case 'passar':
                    const estiloDesabilitado = estadoBotao.desabilitado
                        ? 'background: #555; border-color: #333; color: #aaa;'
                        : '';
                    htmlBotao = `<button class="botao-velho-oeste secundario pequeno" style="${estiloDesabilitado}" ${estadoBotao.desabilitado ? 'disabled' : ''} onclick="Aplicativo.manipularVingancaPassar()">PASSAR</button>`;
                    break;
                case 'alvo':
                    htmlBotao = `<button class="botao-velho-oeste perigo pequeno" ${estadoBotao.desabilitado ? 'disabled' : ''} onclick="Aplicativo.manipularTiroVinganca(${indice})">ALVO</button>`;
                    break;
                case 'escolhedor_dose':
                    htmlBotao = `<button class="botao-velho-oeste btn-ouro pequeno" ${estadoBotao.desabilitado ? 'disabled' : ''} onclick="Aplicativo.definirJusticeiro(${indice})"><span style="display: flex; align-items:center; justify-content:center; gap: 5px; white-space: nowrap;">JUSTICEIRO 🔫</span></button>`;
                    break;
                case 'alvo_dose':
                    htmlBotao = `<button class="botao-velho-oeste btn-alvo pequeno" ${estadoBotao.desabilitado ? 'disabled' : ''} onclick="Aplicativo.manipularTiro(${indice})">ALVO</button>`;
                    break;
                case 'atirador_caos':
                    htmlBotao = `<button class="botao-velho-oeste pequeno" style="background:#444; color:#fff; cursor:default;">Justiceiro</button>`;
                    break;
                case 'mirar_caos':
                    htmlBotao = `<button class="botao-velho-oeste btn-mirar pequeno" ${estadoBotao.desabilitado ? 'disabled' : ''} onclick="Aplicativo.manipularEscolhaCaos(${indice})"><span style="display: flex; align-items:center; gap: 5px; white-space: nowrap;">🎯 Mirar</span></button>`;
                    break;
                case 'protegido_massacre':
                    htmlBotao = `<button class="botao-velho-oeste btn-proteger pequeno" disabled><span style="display: flex; align-items:center; gap: 5px; white-space: nowrap;">🕊️ PROTEGIDO</span></button>`;
                    break;
                case 'atirar_massacre':
                    htmlBotao = `<button class="botao-velho-oeste btn-atirar pequeno" disabled><span style="display: flex; align-items:center; gap: 5px; white-space: nowrap;">🔥 FOGO</span></button>`;
                    break;
                case 'proteger_duelo':
                    htmlBotao = `<button class="botao-velho-oeste btn-proteger pequeno" ${estadoBotao.desabilitado ? 'disabled' : ''} onclick="Aplicativo.manipularTiro(${indice})"><span style="display: flex; align-items:center; gap: 5px; white-space: nowrap;">🛡️ PROTEGER</span></button>`;
                    break;
                case 'atirar_padrao':
                    htmlBotao = `<button class="botao-velho-oeste perigo pequeno" ${estadoBotao.desabilitado ? 'disabled' : ''} onclick="Aplicativo.manipularTiro(${indice})">ATIRAR</button>`;
                    break;
            }

            let htmlEstatisticasDev = '';
            let htmlPapel = '';

            if (ehDev && p.vivo) {
                const papel = ESTADO.jogo.papeis[indice];
                const ehTrapaceiro = papel === 'trapaceiro';

                const textoPapel = ehTrapaceiro
                    ? '🎭 TRAPACEIRO'
                    : '😇 INOCENTE';
                const classePapel = ehTrapaceiro
                    ? 'papel-trapaceiro'
                    : 'papel-inocente';
                htmlPapel = `<div class="rotulo-papel-jogador ${classePapel}">${textoPapel}</div>`;

                const camaraReal = p.arma.contador;
                const ehEspecial = ehTrapaceiro && p.armaPassivaTipo === 'especial';

                // Lei do Bar Art. 23.3/23.4: Marcador (Rosa/Amarelo) + Contador (Branco)
                const classeMarcadorPassiva = ehEspecial ? 'marcador-rosa' : 'marcador-amarelo';
                const valorMarcadorPassiva = ehEspecial ? "6/6" : (p.arma.bala + 1) + "/6";

                // Ponto 3: Brilho alaranjado se o próximo for fatal
                const prontoFatalPassiva = p.arma.contador === p.arma.bala ? 'contador-fatal' : '';

                let htmlColunaPrincipal = `
                    <div class="coluna-marcadores">
                        <div class="item-estatistica ${classeMarcadorPassiva} interativo" 
                             style="font-family:'Courier Prime', monospace"
                             title="Marcador da Bala (Passiva) - Clique para mover" 
                             onclick="Aplicativo.manipularBalaDev(${indice})">${valorMarcadorPassiva}</div>
                        <div class="item-estatistica contador-branco interativo ${prontoFatalPassiva}" 
                             style="font-family:'Courier Prime', monospace"
                             title="Contador de Disparos - Clique para incrementar"
                             onclick="Aplicativo.manipularContadorDev(${indice})">${camaraReal}/6</div>
                    </div>
                `;

                let htmlMarcadorLetal = '';
                if (ehTrapaceiro) {
                    const posicaoAtaque = p.armaAtaque ? p.armaAtaque.bala + 1 : '?';
                    const contadorLetal = p.armaAtaque ? p.armaAtaque.contador : '0';
                    const prontoFatalLetal = p.armaAtaque.contador === p.armaAtaque.bala ? 'contador-fatal' : '';

                    htmlMarcadorLetal = `
                        <div class="coluna-marcadores">
                            <div class="item-estatistica marcador-vermelho interativo" 
                                 style="font-family:'Courier Prime', monospace"
                                 title="Arma Letal (4 câmaras) - Clique para mover" 
                                 onclick="Aplicativo.manipularBalaDev(${indice}, 'letal')">${posicaoAtaque}/4</div>
                            <div class="item-estatistica contador-branco interativo ${prontoFatalLetal}" 
                                 style="font-family:'Courier Prime', monospace"
                                 title="Contador Letal - Clique para incrementar"
                                 onclick="Aplicativo.manipularContadorDev(${indice}, 'letal')">${contadorLetal}/4</div>
                        </div>
                    `;
                }

                htmlEstatisticasDev = `
                    <div class="linha-estatisticas-debug">
                        ${htmlMarcadorLetal}
                        ${htmlColunaPrincipal}
                    </div>
                `;
            }

            const div = document.createElement('div');
            const classeDestaque =
                ehIniciante &&
                    !ehCaosSel &&
                    !this.doseAtivo &&
                    !ESTADO.jogo.vinganca.ativo
                    ? 'iniciante'
                    : '';
            const ehEscolhedorCaos = indice === indiceEscolhedor;

            div.className = `carta-jogador ${!p.vivo ? 'morto' : ''} ${classeDestaque} ${ehEscolhedorCaos ? 'destaque-caos' : ''}`;

            const classeEmojiTremor = classeEmojiExtra || ((ESTADO.jogo.caos.mostrandoAlivio && ehAlvoMirado)
                ? 'emoji-aliviado'
                : (aguardandoResultado ? 'emoji-alvo-caos' : (tremarUmaVez ? 'emoji-shake' : '')));

            div.innerHTML = `
                <div style="display:flex; align-items:center; flex: 1;">
                    <span class="emoji-grande ${classeEmojiTremor}">${emojiExibicao}</span>
                    <div>
                        <div style="font-weight:bold; font-size:1.3rem">${p.nome}</div>
                        ${htmlPapel}
                    </div>
                </div>
                
                <div style="flex: 1; text-align: center;">
                    ${!p.vivo && ehDev ? `<button class="botao-ressuscitar-dev" onclick="Aplicativo.reviverJogadorDev(${indice})" title="Reviver">${ESTADO.jogo.papeis[indice] === 'trapaceiro' ? '😈' : '😇'}</button>` : ''}
                </div>

                <div style="display:flex; align-items:center; flex: 1; justify-content: flex-end;">
                    ${htmlEstatisticasDev}
                    <div class="${p.contadorVirtual >= 8 ? 'contador-fatal' : ''}" style="font-size:1.2rem; font-weight:bold; opacity:0.8; margin-right: 10px; padding: 2px 4px; border-radius: 4px;">${p.contadorVirtual}/6</div>
                    ${htmlBotao}
                </div>
            `;
            lista.appendChild(div);
        });
    },

    atualizarInterfaceJogo() {
        document.getElementById('info-mesa-jogo').textContent =
            `Mesa de ${ESTADO.jogo.cartaMesa}`;
        const exibicaoCarta = document.getElementById('carta-mesa-jogo');
        const nomeImagem =
            CONFIGURACAO.cartas[ESTADO.jogo.cartaMesa] || 'card-back.png';
        exibicaoCarta.style.backgroundImage = `url('${CONFIGURACAO.caminhos.img}${nomeImagem}')`;
        document.getElementById('status-jogo').innerHTML = '';
        document.getElementById('area-narrador-jogo').textContent = '';
        const nomeJogador = ESTADO.jogo.jogadores[ESTADO.jogo.indiceVez].nome;
        document.getElementById('info-iniciante').innerHTML =
            `★ <b>${nomeJogador}</b> começa essa bagaça`;
        this.renderizarListaJogadores();
        this.renderizarPaineisLaterais();
    },
};
