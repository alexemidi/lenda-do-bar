// src/js/game.js
// Orquestrador: seleção de jogadores + montagem da partida +
// tiro com falas + narrador + mesa (K/Q/A).

import {
  perfisJogador,
  narradores,
  emojiPerfil,
  emojiNarrador
} from "./profiles.js";

import {
  shuffleArray,
  calcularTempoLeitura,
  formatDisplayName,
  getNameLengthClass,
  getNextAliveIndex
} from "./utils.js";

import {
  loadPlayers,
  savePlayers,
  addPlayer
} from "./storage.js";

import {
  screenStart,
  screenSetup,
  screenSelectPlayer,
  screenGame,
  screenWin,
  btnGoSetup,
  btnBackToStart,
  btnBackToSetup,
  btnStartGame,
  btnAddPlayer,
  btnRestartGame,
  btnNewGame,
  btnWinRepeat,
  btnWinSetup,
  slotsContainer,
  savedPlayersList,
  newPlayerNameInput,
  gamePlayersContainer,
  mesaInfoEl,
  starterInfoEl,
  statusEl,
  logEl,
  winMessageEl,
  showScreen
} from "./ui.js";

// ===== ESTADO =====

// seleção de jogadores
let slots = [];            // array de 4 posições (null ou nome)
let currentSlotIndex = null;
let savedPlayers = [];     // nomes cadastrados (espelho do localStorage)

// partida em andamento
let gamePlayers = [];      // jogadores da partida (objetos completos)
let narradorPerfil = null; // "Sabio", "Piadista", etc.
let starterIndex = null;   // índice de quem começa a mão
let isShooting = false;    // trava pra não clicar em vários tiros ao mesmo tempo

// mesa (K / Q / A)
const mesaOrdem = ["K", "Q", "A"];
let currentMesaIndex = 0;
let mesaShotsCount = 0;

// ===== INICIALIZAÇÃO GERAL =====

function init() {
  console.log("game.js inicializado.");

  savedPlayers = loadPlayers();
  console.log("Jogadores salvos:", savedPlayers);

  initSlots();
  setupEvents();

  const startParagraph = screenStart.querySelector("p");
  if (startParagraph) {
    startParagraph.textContent =
      "Selecione de 2 a 4 jogadores e comece a partida.";
  }

  showScreen(screenStart);
}

// ===== SLOTS DE SELEÇÃO =====

function initSlots() {
  slots = [null, null, null, null];
  renderSlots();
  updateStartGameButton();
}

function renderSlots() {
  slotsContainer.innerHTML = "";

  slots.forEach((name, index) => {
    const div = document.createElement("div");
    div.className = "slot";

    const span = document.createElement("div");
    span.className = "slot-name";
    span.textContent = name ? name : "Selecione um jogador";
    div.appendChild(span);

    const btnSelect = document.createElement("button");
    btnSelect.textContent = "Selecionar";
    btnSelect.className = "secondary";
    btnSelect.addEventListener("click", () => {
      currentSlotIndex = index;
      showPlayerSelectScreen();
    });
    div.appendChild(btnSelect);

    const btnClear = document.createElement("button");
    btnClear.textContent = "Remover";
    btnClear.className = "danger";
    btnClear.addEventListener("click", () => {
      slots[index] = null;
      renderSlots();
      updateStartGameButton();
    });
    div.appendChild(btnClear);

    slotsContainer.appendChild(div);
  });
}

function updateStartGameButton() {
  const filled = slots.filter(name => !!name).length;
  btnStartGame.disabled = filled < 2;
}

// ===== LISTA DE JOGADORES SALVOS =====

function renderSavedPlayersList() {
  savedPlayersList.innerHTML = "";

  const usados = new Set(slots.filter(Boolean));
  const disponiveis = savedPlayers.filter(name => !usados.has(name));

  if (disponiveis.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Nenhum jogador disponível. Cadastre novos nomes.";
    savedPlayersList.appendChild(p);
    return;
  }

  disponiveis.forEach((name) => {
    const row = document.createElement("div");
    row.className = "player-row";

    const btnSelect = document.createElement("button");
    btnSelect.textContent = name;
    btnSelect.addEventListener("click", () => {
      if (currentSlotIndex !== null) {
        slots[currentSlotIndex] = name;
        renderSlots();
        updateStartGameButton();
      }
      currentSlotIndex = null;
      showScreen(screenSetup);
    });
    row.appendChild(btnSelect);

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "X";
    btnDelete.className = "danger btn-delete";
    btnDelete.title = "Excluir jogador da lista";
    btnDelete.addEventListener("click", () => {
      if (confirm(`Remover "${name}" da lista de jogadores?`)) {
        savedPlayers = savedPlayers.filter(n => n !== name);
        savePlayers(savedPlayers);

        slots = slots.map(s => (s === name ? null : s));
        renderSlots();
        updateStartGameButton();
        renderSavedPlayersList();
      }
    });
    row.appendChild(btnDelete);

    savedPlayersList.appendChild(row);
  });
}

function showPlayerSelectScreen() {
  newPlayerNameInput.value = "";
  renderSavedPlayersList();
  showScreen(screenSelectPlayer);
  newPlayerNameInput.focus();
}

// ===== ARMA E JOGADORES DA PARTIDA =====

function criarArma() {
  const NUM_CAMARAS = 6;
  return {
    numCamaras: NUM_CAMARAS,
    balaPos: Math.floor(Math.random() * NUM_CAMARAS),
    posAtual: 0,
    ativa: true
  };
}

function criarGamePlayer(nome, perfilNome) {
  return {
    nome,
    perfil: perfilNome,
    vivo: true,
    tiros: 0,
    arma: criarArma(),
    beforeIndex: 0,
    afterIndex: 0
  };
}

function getPerfilEmoji(perfil) {
  return emojiPerfil[perfil] || "";
}

function getCardEmoji(player) {
  return player.vivo ? getPerfilEmoji(player.perfil) : "💀";
}

// ===== MESA (K / Q / A) =====

function updateMesaUI() {
  const carta = mesaOrdem[currentMesaIndex];
  const nomesMesa = { K: "Reis", Q: "Damas", A: "As" };
  const nome = nomesMesa[carta] || "";
  mesaInfoEl.textContent = `Mesa de ${carta} - ${nome}`;
}

function initMesa() {
  currentMesaIndex = Math.floor(Math.random() * mesaOrdem.length);
  mesaShotsCount = 0;
  updateMesaUI();
}

// retorna true se mudou de mesa
function registrarDisparoMesa() {
  mesaShotsCount++;
  if (mesaShotsCount >= 3) {
    mesaShotsCount = 0;
    currentMesaIndex = (currentMesaIndex + 1) % mesaOrdem.length;
    updateMesaUI();
    return true;
  }
  return false;
}

// ===== NARRADOR =====

function narradorIntro() {
  if (!narradorPerfil) return 0;
  const narr = narradores[narradorPerfil];
  if (!narr || !narr.intro) return 0;
  const emoji = emojiNarrador[narradorPerfil] || "";
  const msg = `Narrador ${emoji}: "${narr.intro}"`;
  log(msg);
  statusEl.textContent = msg;
  return calcularTempoLeitura(msg);
}

function narradorMesaIntro(isInicial) {
  if (!narradorPerfil) return 0;
  const narr = narradores[narradorPerfil];
  if (!narr || !narr.mesaIntro) return 0;

  const carta = mesaOrdem[currentMesaIndex];
  const line = narr.mesaIntro[carta];
  if (!line) return 0;

  const emoji = emojiNarrador[narradorPerfil] || "";
  const msg = `Narrador ${emoji}: "${line}"`;
  log(msg);
  statusEl.textContent = msg;
  return calcularTempoLeitura(msg);
}

function narradorKill(player) {
  if (!narradorPerfil) return 0;
  const narr = narradores[narradorPerfil];
  if (!narr || !narr.killLines) return 0;

  const lines = narr.killLines;
  const template = lines[player.perfil] || lines.default;
  if (!template) return 0;

  const text = template.replace("{nome}", player.nome);
  const emoji = emojiNarrador[narradorPerfil] || "";
  const msg = `Narrador ${emoji}: "${text}"`;
  log(msg);
  statusEl.textContent = msg;
  return calcularTempoLeitura(msg);
}

function getNarradorWinnerLine(nome) {
  if (!narradorPerfil) return null;
  const narr = narradores[narradorPerfil];
  if (!narr || !narr.winner || narr.winner.length === 0) return null;
  const idx = Math.floor(Math.random() * narr.winner.length);
  return narr.winner[idx].replace("{nome}", nome);
}

// ===== INFO "AGORA É A VEZ DE..." =====

function updateStarterInfo() {
  if (starterIndex === null || !gamePlayers.length) {
    starterInfoEl.textContent = "";
    return;
  }
  if (!gamePlayers[starterIndex] || !gamePlayers[starterIndex].vivo) {
    const idx = gamePlayers.findIndex(p => p.vivo);
    if (idx === -1) {
      starterInfoEl.textContent = "";
      return;
    }
    starterIndex = idx;
  }
  const p = gamePlayers[starterIndex];
  starterInfoEl.textContent = `Agora é a vez de: ${p.nome}`;
}

// ===== LOG =====

function log(msg) {
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

// ===== RENDER DOS JOGADORES =====

function renderGamePlayers() {
  gamePlayersContainer.innerHTML = "";

  gamePlayers.forEach((player, index) => {
    const div = document.createElement("div");
    div.className = "game-player";
    if (!player.vivo) {
      div.classList.add("dead");
    }

    const left = document.createElement("div");
    left.className = "gp-left";

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "gp-emoji";
    emojiSpan.textContent = getCardEmoji(player);
    left.appendChild(emojiSpan);

    const nameSpan = document.createElement("span");
    nameSpan.classList.add("player-name");
    const nameClass = getNameLengthClass(player.nome);
    nameSpan.classList.add(nameClass);
    nameSpan.textContent = formatDisplayName(player.nome);
    left.appendChild(nameSpan);

    const right = document.createElement("div");
    right.className = "gp-right";

    const shotsSpan = document.createElement("span");
    shotsSpan.className = "gp-shots";
    shotsSpan.textContent = `${player.tiros}/${player.arma.numCamaras}`;
    right.appendChild(shotsSpan);

    const btnShoot = document.createElement("button");
    btnShoot.textContent = "Atirar";
    btnShoot.className = "danger";
    btnShoot.disabled = !player.vivo || isShooting;
    btnShoot.addEventListener("click", () => {
      shoot(index);
    });
    right.appendChild(btnShoot);

    div.appendChild(left);
    div.appendChild(right);

    gamePlayersContainer.appendChild(div);
  });
}

// ===== TIRO (FALAS + MESA + NARRADOR NA MORTE) =====

function shoot(index) {
  if (isShooting) return;

  const player = gamePlayers[index];
  if (!player || !player.vivo) return;

  const arma = player.arma;
  if (!arma.ativa) {
    statusEl.textContent = `${player.nome} já usou a arma dele.`;
    return;
  }

  const perfil = perfisJogador[player.perfil] || perfisJogador.Marrento;

  // fala antes do tiro
  const beforePhrases = perfil.before;
  const fraseBefore = beforePhrases[player.beforeIndex % beforePhrases.length];
  player.beforeIndex = (player.beforeIndex + 1) % beforePhrases.length;

  const emoji = getPerfilEmoji(player.perfil);
  const msgBefore = `${player.nome} ${emoji}: "${fraseBefore}"`;
  statusEl.textContent = msgBefore;
  log(msgBefore);

  isShooting = true;
  renderGamePlayers();

  const morreu = (arma.posAtual === arma.balaPos);
  const tempoLeitura = calcularTempoLeitura(fraseBefore);

  setTimeout(() => {
    const efeito = morreu ? "💥 BUUM!" : "*CLIQUE*";
    statusEl.textContent = efeito;
    log(efeito);

    const tempoEfeito = 700;

    setTimeout(() => {
      player.tiros++;

      // vamos decidir se a mesa muda DEPOIS de decidir se morreu ou não,
      // mas ainda não chamar narrador da mesa aqui.
      let mesaMudou = false;

      if (morreu) {
        player.vivo = false;
        arma.ativa = false;
        const msgHit = `${player.nome} levou o tiro! 💀`;
        log(msgHit);
        statusEl.textContent = msgHit;

        // registra o disparo só depois do resultado
        mesaMudou = registrarDisparoMesa();

        // atualiza turno/visual
        const nextIdx = getNextAliveIndex(gamePlayers, index);
        starterIndex = nextIdx;
        updateStarterInfo();
        renderGamePlayers();

        // sequência do narrador:
        // 1) fala da morte
        // 2) se a mesa mudou, depois que ele termina, fala da nova mesa
        const tempoKill = narradorKill(player);
        const killDelay = tempoKill || 0;

        if (mesaMudou) {
          setTimeout(() => {
            const tempoMesa = narradorMesaIntro(false);
            const mesaDelay = tempoMesa || 0;

            setTimeout(() => {
              const acabou = checarFimDeJogo();
              if (!acabou) {
                isShooting = false;
                renderGamePlayers();
              }
            }, mesaDelay);
          }, killDelay);
        } else {
          setTimeout(() => {
            const acabou = checarFimDeJogo();
            if (!acabou) {
              isShooting = false;
              renderGamePlayers();
            }
          }, killDelay);
        }

      } else {
        // NÃO MORREU
        arma.posAtual = (arma.posAtual + 1) % arma.numCamaras;

        const afterPhrases = perfil.afterSurvive;
        const fraseAfter = afterPhrases[player.afterIndex % afterPhrases.length];
        player.afterIndex = (player.afterIndex + 1) % afterPhrases.length;

        const msgAfter = `${player.nome} ${emoji}: "${fraseAfter}"`;
        statusEl.textContent = msgAfter;
        log(msgAfter);

        mesaMudou = registrarDisparoMesa();

        const nextIdx = getNextAliveIndex(gamePlayers, index);
        starterIndex = nextIdx;
        updateStarterInfo();
        renderGamePlayers();

        const tempoAfter = calcularTempoLeitura(fraseAfter);
        const afterDelay = tempoAfter || 0;

        if (mesaMudou) {
          // espera o tempo da fala do jogador, depois o narrador anuncia a mesa
          setTimeout(() => {
            const tempoMesa = narradorMesaIntro(false);
            const mesaDelay = tempoMesa || 0;

            setTimeout(() => {
              const acabou = checarFimDeJogo();
              if (!acabou) {
                isShooting = false;
                renderGamePlayers();
              }
            }, mesaDelay);
          }, afterDelay);
        } else {
          setTimeout(() => {
            const acabou = checarFimDeJogo();
            if (!acabou) {
              isShooting = false;
              renderGamePlayers();
            }
          }, afterDelay);
        }
      }
    }, tempoEfeito);
  }, tempoLeitura);
}

// ===== FIM DE JOGO =====

function checarFimDeJogo() {
  const vivos = gamePlayers.filter(p => p.vivo);
  if (vivos.length <= 1) {
    isShooting = false;
    const vencedor = vivos[0] || null;

    if (vencedor) {
      const linhaNarrador = getNarradorWinnerLine(vencedor.nome);
      if (linhaNarrador) {
        const emojiN = emojiNarrador[narradorPerfil] || "";
        const msg = `Narrador ${emojiN}: "${linhaNarrador}"`;
        statusEl.textContent = msg;
        log(msg);
        setTimeout(() => {
          showWinScreen(vencedor.nome);
        }, 2000);
      } else {
        const msg = `${vencedor.nome} venceu a rodada!`;
        statusEl.textContent = msg;
        log(msg);
        setTimeout(() => {
          showWinScreen(vencedor.nome);
        }, 1200);
      }
    } else {
      const msg = "Ninguém sobreviveu nessa rodada... 😵";
      statusEl.textContent = msg;
      log(msg);
      setTimeout(() => {
        showWinScreen(null);
      }, 1200);
    }
    return true;
  }
  return false;
}

function showWinScreen(vencedorNome) {
  if (vencedorNome) {
    winMessageEl.textContent =
      `${vencedorNome} venceu a rodada! O melhor mentiroso do bar da mesa. 🍻`;
  } else {
    winMessageEl.textContent =
      "Dessa vez ninguém levou o título... só bala. 😵";
  }
  showScreen(screenWin);
}

// ===== INICIAR / REINICIAR PARTIDA =====

function startGame() {
  const nomesSelecionados = slots.filter(Boolean);
  if (nomesSelecionados.length < 2) {
    alert("Selecione pelo menos 2 jogadores para iniciar.");
    return;
  }

  const todosPerfis = Object.keys(perfisJogador);
  const perfisEmbaralhados = shuffleArray(todosPerfis);
  const perfisEscolhidos = perfisEmbaralhados.slice(0, nomesSelecionados.length);

  gamePlayers = nomesSelecionados.map((nome, idx) =>
    criarGamePlayer(nome, perfisEscolhidos[idx])
  );

  console.log("Jogadores da partida:", gamePlayers);

  const narrKeys = Object.keys(narradores);
  narradorPerfil = narrKeys[Math.floor(Math.random() * narrKeys.length)];
  console.log("Narrador sorteado:", narradorPerfil);

  starterIndex = Math.floor(Math.random() * gamePlayers.length);
  updateStarterInfo();

  logEl.textContent = "";
  mesaInfoEl.textContent = "Mesa de ?";

  renderGamePlayers();
  showScreen(screenGame);

  // Intro do narrador + primeira mesa, travando os tiros
  isShooting = true;

  const tempoIntro = narradorIntro() || 3000;

  setTimeout(() => {
    initMesa();
    const tempoMesa = narradorMesaIntro(true) || 3000;

    setTimeout(() => {
      isShooting = false;
      renderGamePlayers();
    }, tempoMesa);
  }, tempoIntro);
}

// ===== EVENTOS =====

function setupEvents() {
  btnGoSetup.addEventListener("click", () => {
    showScreen(screenSetup);
  });

  btnBackToStart.addEventListener("click", () => {
    showScreen(screenStart);
  });

  btnBackToSetup.addEventListener("click", () => {
    currentSlotIndex = null;
    showScreen(screenSetup);
  });

  btnAddPlayer.addEventListener("click", () => {
    const name = newPlayerNameInput.value.trim();
    if (!name) return;

    if (!savedPlayers.includes(name)) {
      savedPlayers = addPlayer(name);
    }

    if (currentSlotIndex !== null) {
      slots[currentSlotIndex] = name;
      renderSlots();
      updateStartGameButton();
      currentSlotIndex = null;
      showScreen(screenSetup);
    } else {
      renderSavedPlayersList();
    }

    newPlayerNameInput.value = "";
  });

  btnStartGame.addEventListener("click", () => {
    startGame();
  });

  btnRestartGame.addEventListener("click", () => {
    startGame();
  });

  btnNewGame.addEventListener("click", () => {
    showScreen(screenSetup);
  });

  btnWinRepeat.addEventListener("click", () => {
    startGame();
  });

  btnWinSetup.addEventListener("click", () => {
    showScreen(screenSetup);
  });
}

// ===== INICIALIZAÇÃO =====
init();
