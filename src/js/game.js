// src/js/game.js
// Lógica principal do jogo, com animação de mesa em 4s (back -> front -> back -> front).

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
  screenMesa,
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
  mesaNarrator,
  mesaCardIntro,
  showScreen
} from "./ui.js";

/* ===========================================================
   Estado global
   =========================================================== */
let slots = [];
let currentSlotIndex = null;
let savedPlayers = [];

let gamePlayers = [];
let narradorPerfil = null;
let starterIndex = null;
let isShooting = false;

const mesaOrdem = ["K", "Q", "A"];
let currentMesaIndex = 0;
let mesaShotsCount = 0;

/* ===========================================================
   Inicialização
   =========================================================== */
function init() {
  savedPlayers = loadPlayers();
  initSlots();
  setupEvents();
  showScreen(screenStart);
}

/* ===========================================================
   Slots UI
   =========================================================== */
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
    span.textContent = name || "Selecione um jogador";
    div.appendChild(span);

    const btnSelect = document.createElement("button");
    btnSelect.textContent = "Selecionar";
    btnSelect.className = "secondary";
    btnSelect.onclick = () => {
      currentSlotIndex = index;
      showPlayerSelectScreen();
    };
    div.appendChild(btnSelect);

    const btnRemove = document.createElement("button");
    btnRemove.textContent = "Remover";
    btnRemove.className = "danger";
    btnRemove.onclick = () => {
      slots[index] = null;
      renderSlots();
      updateStartGameButton();
    };
    div.appendChild(btnRemove);

    slotsContainer.appendChild(div);
  });
}

function updateStartGameButton() {
  const filled = slots.filter(n => n).length;
  btnStartGame.disabled = filled < 2;
}

/* ===========================================================
   Seleção / storage
   =========================================================== */
function renderSavedPlayersList() {
  savedPlayersList.innerHTML = "";

  const usados = new Set(slots.filter(Boolean));
  const disponiveis = savedPlayers.filter(n => !usados.has(n));

  if (!disponiveis.length) {
    const p = document.createElement("p");
    p.textContent = "Nenhum jogador disponível.";
    savedPlayersList.appendChild(p);
    return;
  }

  disponiveis.forEach(name => {
    const row = document.createElement("div");
    row.className = "player-row";

    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => {
      if (currentSlotIndex !== null) {
        slots[currentSlotIndex] = name;
        currentSlotIndex = null;
        renderSlots();
        updateStartGameButton();
      }
      showScreen(screenSetup);
    };
    row.appendChild(btn);

    const del = document.createElement("button");
    del.textContent = "X";
    del.className = "danger btn-delete";
    del.onclick = () => {
      if (confirm(`Remover "${name}" da lista de jogadores?`)) {
        savedPlayers = savedPlayers.filter(n => n !== name);
        savePlayers(savedPlayers);
        slots = slots.map(s => (s === name ? null : s));
        renderSlots();
        updateStartGameButton();
        renderSavedPlayersList();
      }
    };
    row.appendChild(del);

    savedPlayersList.appendChild(row);
  });
}

function showPlayerSelectScreen() {
  newPlayerNameInput.value = "";
  renderSavedPlayersList();
  showScreen(screenSelectPlayer);
  newPlayerNameInput.focus();
}

/* ===========================================================
   Entidades
   =========================================================== */
function criarArma() {
  return {
    numCamaras: 6,
    balaPos: Math.floor(Math.random() * 6),
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

function getCardEmoji(player) {
  return player.vivo ? emojiPerfil[player.perfil] : "💀";
}

/* ===========================================================
   Mesa (sorteio, UI e animação)
   =========================================================== */
function updateMesaUI() {
  const carta = mesaOrdem[currentMesaIndex];
  if (mesaInfoEl) mesaInfoEl.textContent = `Mesa de ${carta}`;

  const mesaCardFace = document.getElementById("mesaCardFace");
  if (mesaCardFace) {
    const map = { K: "king-hearts.png", Q: "queen-diamonds.png", A: "ace-spades.png" };
    const file = map[carta] || "card-back.png";
    mesaCardFace.style.backgroundImage = `url("src/assets/imgs/${file}")`;
  }
}

function initMesa() {
  currentMesaIndex = Math.floor(Math.random() * mesaOrdem.length);
  mesaShotsCount = 0;
  updateMesaUI();
}

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

/* ===========================================================
   Narrador
   =========================================================== */
function narradorIntro() {
  if (!narradorPerfil) return 0;
  const narr = narradores[narradorPerfil];
  if (!narr || !narr.intro) return 0;

  const emoji = emojiNarrador[narradorPerfil] || "";
  const msg = `Narrador ${emoji}: "${narr.intro}"`;
  statusEl.textContent = msg;
  log(msg);
  return calcularTempoLeitura(msg);
}

function narradorMesaIntro(isInicial) {
  if (!narradorPerfil) return 0;
  const narr = narradores[narradorPerfil];

  const carta = mesaOrdem[currentMesaIndex];
  const line = narr.mesaIntro?.[carta];
  if (!line) return 0;

  const emoji = emojiNarrador[narradorPerfil] || "";
  const msg = `Narrador ${emoji}: "${line}"`;
  statusEl.textContent = msg;
  log(msg);
  return calcularTempoLeitura(msg);
}

function narradorKill(player) {
  const narr = narradores[narradorPerfil];
  if (!narr) return 0;

  const lines = narr.killLines;
  const template = lines[player.perfil] || lines.default;
  const txt = template.replace("{nome}", player.nome);
  const emoji = emojiNarrador[narradorPerfil] || "";

  const msg = `Narrador ${emoji}: "${txt}"`;
  statusEl.textContent = msg;
  log(msg);

  return calcularTempoLeitura(msg);
}

/* ===========================================================
   Render / Log
   =========================================================== */
function log(msg) {
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

function renderGamePlayers() {
  gamePlayersContainer.innerHTML = "";

  gamePlayers.forEach((player, index) => {
    const div = document.createElement("div");
    div.className = "game-player";
    if (!player.vivo) div.classList.add("dead");

    const left = document.createElement("div");
    left.className = "gp-left";

    const emoji = document.createElement("span");
    emoji.className = "gp-emoji";
    emoji.textContent = getCardEmoji(player);
    left.appendChild(emoji);

    const name = document.createElement("span");
    name.className = "player-name";
    name.textContent = formatDisplayName(player.nome);
    left.appendChild(name);

    const right = document.createElement("div");
    right.className = "gp-right";

    const shots = document.createElement("span");
    shots.className = "gp-shots";
    shots.textContent = `${player.tiros}/${player.arma.numCamaras}`;
    right.appendChild(shots);

    const btn = document.createElement("button");
    btn.textContent = "Atirar";
    btn.className = "danger";
    btn.disabled = !player.vivo || isShooting;
    btn.onclick = () => shoot(index);
    right.appendChild(btn);

    div.appendChild(left);
    div.appendChild(right);

    gamePlayersContainer.appendChild(div);
  });
}

/* ===========================================================
   Tiro (fluxo)
   =========================================================== */
function shoot(index) {
  if (isShooting) return;

  const player = gamePlayers[index];
  if (!player || !player.vivo) return;

  const arma = player.arma;
  if (!arma.ativa) {
    statusEl.textContent = `${player.nome} já usou a arma.`;
    return;
  }

  const perfil = perfisJogador[player.perfil];

  // fala antes
  const fraseBefore = perfil.before[player.beforeIndex];
  player.beforeIndex = (player.beforeIndex + 1) % perfil.before.length;
  const emoji = emojiPerfil[player.perfil];
  const msgBefore = `${player.nome} ${emoji}: "${fraseBefore}"`;

  isShooting = true;
  statusEl.textContent = msgBefore;
  log(msgBefore);
  renderGamePlayers();

  const morreu = arma.posAtual === arma.balaPos;
  const tempoBefore = calcularTempoLeitura(fraseBefore);

  setTimeout(() => {
    const efeito = morreu ? "💥 BUUM!" : "*CLIQUE*";
    statusEl.textContent = efeito;
    log(efeito);

    setTimeout(() => {
      player.tiros++;

      let mesaMudou = false;

      if (morreu) {
        player.vivo = false;
        arma.ativa = false;

        const msgHit = `${player.nome} levou o tiro! 💀`;
        statusEl.textContent = msgHit;
        log(msgHit);

        mesaMudou = registrarDisparoMesa();

        const next = getNextAliveIndex(gamePlayers, index);
        starterIndex = next;
        updateStarterInfo();
        renderGamePlayers();

        const tempoKill = narradorKill(player);

        if (mesaMudou) {
          setTimeout(() => {
            const tMesa = narradorMesaIntro(false);
            setTimeout(() => finishShot(), tMesa);
          }, tempoKill);
        } else {
          setTimeout(() => finishShot(), tempoKill);
        }

      } else {
        arma.posAtual = (arma.posAtual + 1) % arma.numCamaras;

        const fraseAfter = perfil.afterSurvive[player.afterIndex];
        player.afterIndex = (player.afterIndex + 1) % perfil.afterSurvive.length;

        const msgAfter = `${player.nome} ${emoji}: "${fraseAfter}"`;
        statusEl.textContent = msgAfter;
        log(msgAfter);

        mesaMudou = registrarDisparoMesa();

        const next = getNextAliveIndex(gamePlayers, index);
        starterIndex = next;
        updateStarterInfo();
        renderGamePlayers();

        const tempoAfter = calcularTempoLeitura(fraseAfter);

        if (mesaMudou) {
          setTimeout(() => {
            const tMesa = narradorMesaIntro(false);
            setTimeout(() => finishShot(), tMesa);
          }, tempoAfter);
        } else {
          setTimeout(() => finishShot(), tempoAfter);
        }
      }
    }, 700);

  }, tempoBefore);
}

function finishShot() {
  const acabou = checarFimDeJogo();
  if (!acabou) {
    isShooting = false;
    renderGamePlayers();
  }
}

/* ===========================================================
   Fim de jogo / vitória
   =========================================================== */
function checarFimDeJogo() {
  const vivos = gamePlayers.filter(p => p.vivo);
  if (vivos.length <= 1) {
    isShooting = false;

    const vencedor = vivos[0] || null;

    if (vencedor) {
      const narr = narradores[narradorPerfil];
      let linha = null;
      if (narr && narr.winner?.length) {
        linha = narr.winner[Math.floor(Math.random() * narr.winner.length)];
        linha = linha.replace("{nome}", vencedor.nome);
      }

      if (linha) {
        statusEl.textContent = linha;
        log(linha);
        setTimeout(() => showWinScreen(vencedor.nome), 2000);
      } else {
        const msg = `${vencedor.nome} venceu a rodada!`;
        statusEl.textContent = msg;
        log(msg);
        setTimeout(() => showWinScreen(vencedor.nome), 1200);
      }

    } else {
      const msg = "Ninguém sobreviveu...";
      statusEl.textContent = msg;
      log(msg);
      setTimeout(() => showWinScreen(null), 1200);
    }

    return true;
  }
  return false;
}

function showWinScreen(nome) {
  winMessageEl.textContent = nome
    ? `${nome} venceu a rodada! 🍻`
    : "Dessa vez ninguém levou o título...";
  showScreen(screenWin);
}

/* ===========================================================
   Start game + sincronização da animação de intro (4s)
   =========================================================== */
function startGame() {
  const nomes = slots.filter(Boolean);
  if (nomes.length < 2) {
    alert("Selecione ao menos 2 jogadores.");
    return;
  }

  // escolhe narrador aleatório
  const narrKeys = Object.keys(narradores);
  narradorPerfil = narrKeys[Math.floor(Math.random() * narrKeys.length)];

  // sorteia a mesa ANTES da animação para manter sincronização
  initMesa();

  // prepara o introCard (mostra back inicialmente, e front será a carta sorteada)
  const carta = mesaOrdem[currentMesaIndex];
  const map = { K: "king-hearts.png", Q: "queen-diamonds.png", A: "ace-spades.png" };
  const file = map[carta] || "card-back.png";

  // atualiza a face da intro (front) e o back
  if (mesaCardIntro) {
    const front = mesaCardIntro.querySelector(".intro-front");
    const back = mesaCardIntro.querySelector(".intro-back");
    if (front) front.style.backgroundImage = `url("src/assets/imgs/${file}")`;
    if (back) back.style.backgroundImage = `url("src/assets/imgs/card-back.png")`;

    // garante que a classe animating reforce o reflow para poder reiniciar a animação
    mesaCardIntro.classList.remove("animating");
    void mesaCardIntro.offsetWidth;
    mesaCardIntro.classList.add("animating");
  }

  // mostra tela da mesa com a animação rodando
  showScreen(screenMesa);

  // narrador na tela da mesa
  if (mesaNarrator) mesaNarrator.textContent = narradores[narradorPerfil]?.intro || "";

  // tempo do narrador + animação: queremos esperar a animação de 4s terminar antes de ir ao jogo
  const tempoIntroNarr = narradorIntro() || 1400;
  // ANIM é 4000ms conforme pedido
  const ANIM = 4000;
  const waitFor = Math.max(tempoIntroNarr, ANIM) + 200;

  // quando a animação terminar (animationend) — avançar para o jogo
  let handled = false;
  const onAnimEnd = (ev) => {
    // filtra apenas quando o container termina sua animação
    if (ev.target !== mesaCardIntro) return;
    if (handled) return;
    handled = true;

    // remove classe e listener
    mesaCardIntro.classList.remove("animating");
    mesaCardIntro.removeEventListener("animationend", onAnimEnd);

    // limpa narrador intro text
    if (mesaNarrator) mesaNarrator.textContent = "";

    // avança para montar o jogo
    startGameCore(nomes);
  };

  if (mesaCardIntro) {
    mesaCardIntro.addEventListener("animationend", onAnimEnd);
    // fallback: caso animationend não dispare (navegador estranho), usa timeout
    setTimeout(() => {
      if (!handled) onAnimEnd({ target: mesaCardIntro });
    }, waitFor + 300);
  } else {
    // sem elemento de animação, ir direto (defensivo)
    setTimeout(() => startGameCore(nomes), Math.max(tempoIntroNarr, ANIM));
  }
}

function startGameCore(nomesSelecionados) {
  const todosPerfis = Object.keys(perfisJogador);
  const embaralhados = shuffleArray(todosPerfis);
  const perfisUsados = embaralhados.slice(0, nomesSelecionados.length);

  gamePlayers = nomesSelecionados.map((n, i) =>
    criarGamePlayer(n, perfisUsados[i])
  );

  starterIndex = Math.floor(Math.random() * gamePlayers.length);

  logEl.textContent = "";
  renderGamePlayers();

  // mostra tela do jogo
  showScreen(screenGame);

  // garante que carta central mostre a MESMA carta sorteada
  updateMesaUI();

  // exibe starter abaixo da carta (com nome em negrito)
  updateStarterInfo();

  isShooting = false;
  renderGamePlayers();
}

/* ===========================================================
   Helpers UI
   =========================================================== */
function updateStarterInfo() {
  if (starterIndex === null) {
    starterInfoEl.textContent = "";
    return;
  }
  const p = gamePlayers[starterIndex];
  // destaque nome em negrito — inserimos via innerHTML mas com cuidado (nome vem do usuário)
  if (p) {
    // escape simples: substituir < > para evitar injeção básica (nunca confie em conteúdo externo)
    const safeName = String(p.nome).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    starterInfoEl.innerHTML = `Agora é a vez de: <b>${safeName}</b>`;
  } else {
    starterInfoEl.textContent = "";
  }
}

/* ===========================================================
   Eventos
   =========================================================== */
function setupEvents() {
  btnGoSetup.onclick = () => showScreen(screenSetup);
  btnBackToStart.onclick = () => showScreen(screenStart);

  btnBackToSetup.onclick = () => {
    currentSlotIndex = null;
    showScreen(screenSetup);
  };

  btnAddPlayer.onclick = () => {
    const name = newPlayerNameInput.value.trim();
    if (!name) return;

    if (!savedPlayers.includes(name)) {
      savedPlayers = addPlayer(name);
    }

    if (currentSlotIndex !== null) {
      slots[currentSlotIndex] = name;
      currentSlotIndex = null;
      renderSlots();
      updateStartGameButton();
      showScreen(screenSetup);
    } else {
      renderSavedPlayersList();
    }

    newPlayerNameInput.value = "";
  };

  btnStartGame.onclick = startGame;
  btnRestartGame.onclick = startGame;
  btnNewGame.onclick = () => showScreen(screenSetup);

  btnWinRepeat.onclick = startGame;
  btnWinSetup.onclick = () => showScreen(screenSetup);
}

/* ===========================================================
   Bootstrap
   =========================================================== */
init();

/* ===========================================================
   Exports (úteis para debug)
   =========================================================== */
export {
  startGame,
  renderSavedPlayersList,
  renderGamePlayers
};
