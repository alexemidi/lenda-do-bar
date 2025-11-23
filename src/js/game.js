// src/js/game.js
// Lógica principal do jogo com correção: após o 3º disparo espera a fala, vai para a tela "mesa" (intro) e volta ao jogo.
// Usa os módulos: profiles.js, utils.js, storage.js, ui.js

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
    // updateMesaUI will be called by caller after transition returns to game
    return true;
  }
  return false;
}

/* Função que executa a transição para tela 'mesa' (intro) e volta ao jogo.
   Preserva o estado dos jogadores. */
function gotoMesaTransitionAndReturn() {
  // prepara imagens do introCard (front = carta sorteada, back = verso)
  const carta = mesaOrdem[currentMesaIndex];
  const map = { K: "king-hearts.png", Q: "queen-diamonds.png", A: "ace-spades.png" };
  const file = map[carta] || "card-back.png";

  if (mesaCardIntro) {
    const front = mesaCardIntro.querySelector(".intro-front");
    const back = mesaCardIntro.querySelector(".intro-back");
    if (front) front.style.backgroundImage = `url("src/assets/imgs/${file}")`;
    if (back) back.style.backgroundImage = `url("src/assets/imgs/card-back.png")`;
  }

  // mostrar a tela da mesa
  if (mesaNarrator) mesaNarrator.textContent = narradores[narradorPerfil]?.intro || "";
  showScreen(screenMesa);

  // iniciar animação
  if (mesaCardIntro) {
    mesaCardIntro.classList.remove("animating");
    void mesaCardIntro.offsetWidth;
    mesaCardIntro.classList.add("animating");
  }

  // garantir retorno ao jogo quando a animação acabar
  let handled = false;
  const onEnd = (ev) => {
    if (ev && ev.target !== mesaCardIntro) return;
    if (handled) return;
    handled = true;

    // cleanup anim class + listener
    if (mesaCardIntro) {
      mesaCardIntro.classList.remove("animating");
      mesaCardIntro.removeEventListener("animationend", onEnd);
    }
    if (mesaNarrator) mesaNarrator.textContent = "";

    // atualizar a carta central da tela do jogo para a MESMA carta sorteada
    updateMesaUI();

    // --- CORREÇÃO IMPORTANTE ---
    // Liberar os tiros ANTES de renderizar a UI, assim os botões voltarão habilitados.
    isShooting = false;

    // voltar para a tela de jogo
    showScreen(screenGame);

    // atualizar starter e UI
    updateStarterInfo();
    renderGamePlayers();
  };

  if (mesaCardIntro) {
    mesaCardIntro.addEventListener("animationend", onEnd);
    // fallback caso animationend não ocorra (timeout levemente maior que animação)
    setTimeout(() => {
      if (!handled) onEnd({ target: mesaCardIntro });
    }, 4300);
  } else {
    // sem animação: retorno imediato
    setTimeout(() => {
      if (!handled) onEnd();
    }, 300);
  }
}

/* ===========================================================
   Narrador
   =========================================================== */
function narradorIntro() {
  if (!narradorPerfil) return 0;
  const narr = narradores[narradorPerfil];
  if (!narr || !narr.intro) return 0;

  const emoji = emojiNarrador[narradorPerfil] || "";
  const msg = `${emoji} ${narr.intro}`;
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

/* ============================
   renderGamePlayers (modificado)
   ============================ */
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

    // Nome do jogador com regras de fonte e truncamento
    const name = document.createElement("span");
    name.className = "player-name";

    // Regras:
    // - se <= 15 chars => Fonte P. dos jogadores (grande)
    // - se > 15 chars  => Fonte M. dos jogadores (médio)
    // Truncamento com "..." é feito pelo CSS se o texto exceder o espaço.
    const rawName = String(player.nome || "");
    const len = rawName.length;

    if (len <= 15) {
      // Fonte P. dos jogadores
      name.classList.add("player-name-large"); // /* Fonte P. dos jogadores */
    } else {
      // Fonte M. dos jogadores
      name.classList.add("player-name-medium"); // /* Fonte M. dos jogadores */
    }

    // sempre colocamos o nome completo no title para tooltip
    name.textContent = rawName;
    name.title = rawName;

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
   Tiro (fluxo) — ajustado para manejar transição de mesa após 3 disparos
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

  // fala before
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
    log(`${efeito}`);

    setTimeout(() => {
      player.tiros++;

      // registrar se a mesa mudou (3 disparos)
      let mesaMudou = false;

      if (morreu) {
        player.vivo = false;
        arma.ativa = false;

        const msgHit = `${player.nome} levou o tiro! 💀`;
        statusEl.textContent = msgHit;
        log(msgHit);

        mesaMudou = registrarDisparoMesa();

        // define próximo starter
        const next = getNextAliveIndex(gamePlayers, index);
        starterIndex = next;
        updateStarterInfo();
        renderGamePlayers();

        // tempo da fala do narrador sobre a morte
        const tempoKill = narradorKill(player);

        // checar se fim de jogo (alguém venceu) — se sim, interrompe transição de mesa
        const acabou = checarFimDeJogo();
        if (acabou) {
          // partida acabou — nada mais a fazer
          return;
        }

        if (mesaMudou) {
          // espera o tempo do narrador, depois vai para tela da mesa e retorna
          setTimeout(() => {
            gotoMesaTransitionAndReturn();
          }, tempoKill);
        } else {
          // não mudou de mesa — permite continuar após tempo do narrador
          setTimeout(() => {
            isShooting = false;
            renderGamePlayers();
          }, tempoKill);
        }

      } else {
        // sobreviveu
        arma.posAtual = (arma.posAtual + 1) % arma.numCamaras;

        const fraseAfter = perfil.afterSurvive[player.afterIndex];
        player.afterIndex = (player.afterIndex + 1) % perfil.afterSurvive.length;

        const msgAfter = `${player.nome} ${emoji}: "${fraseAfter}"`;
        statusEl.textContent = msgAfter;
        log(msgAfter);

        mesaMudou = registrarDisparoMesa();

        // define próximo starter
        const next = getNextAliveIndex(gamePlayers, index);
        starterIndex = next;
        updateStarterInfo();
        renderGamePlayers();

        const tempoAfter = calcularTempoLeitura(fraseAfter);

        // checar fim de jogo (por segurança — normalmente não muda aqui)
        const acabou = checarFimDeJogo();
        if (acabou) return;

        if (mesaMudou) {
          // esperar tempoAfter, então ir para tela da mesa e retornar
          setTimeout(() => {
            gotoMesaTransitionAndReturn();
          }, tempoAfter);
        } else {
          // não mudou de mesa — volta ao estado normal após tempoAfter
          setTimeout(() => {
            isShooting = false;
            renderGamePlayers();
          }, tempoAfter);
        }
      }
    }, 700);
  }, tempoBefore);
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
   Start game + sincronização intro
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

  // sorteia a mesa ANTES da animação
  initMesa();

  // preparar introCard (front = carta sorteada)
  const carta = mesaOrdem[currentMesaIndex];
  const map = { K: "king-hearts.png", Q: "queen-diamonds.png", A: "ace-spades.png" };
  const file = map[carta] || "card-back.png";

  if (mesaCardIntro) {
    const front = mesaCardIntro.querySelector(".intro-front");
    const back = mesaCardIntro.querySelector(".intro-back");
    if (front) front.style.backgroundImage = `url("src/assets/imgs/${file}")`;
    if (back) back.style.backgroundImage = `url("src/assets/imgs/card-back.png")`;

    mesaCardIntro.classList.remove("animating");
    void mesaCardIntro.offsetWidth;
    mesaCardIntro.classList.add("animating");
  }

  showScreen(screenMesa);
  if (mesaNarrator) mesaNarrator.textContent = narradores[narradorPerfil]?.intro || "";

  const tempoIntroNarr = narradorIntro() || 1500;
  const ANIM = 10000;
  const waitFor = Math.max(tempoIntroNarr, ANIM) + 500;

  let handled = false;
  const onAnimEnd = (ev) => {
    if (ev.target !== mesaCardIntro) return;
    if (handled) return;
    handled = true;
    if (mesaCardIntro) {
      mesaCardIntro.classList.remove("animating");
      mesaCardIntro.removeEventListener("animationend", onAnimEnd);
    }
    if (mesaNarrator) mesaNarrator.textContent = "";
    startGameCore(nomes);
  };

  if (mesaCardIntro) {
    mesaCardIntro.addEventListener("animationend", onAnimEnd);
    setTimeout(() => {
      if (!handled) onAnimEnd({ target: mesaCardIntro });
    }, waitFor + 300);
  } else {
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

  showScreen(screenGame);

  // carta central exibe a carta sorteada anteriormente
  updateMesaUI();

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
  if (p) {
    const safeName = String(p.nome).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    starterInfoEl.innerHTML = `<b>${safeName}</b> começa essa bagaça!`;
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
   Exports
   =========================================================== */
export {
  startGame,
  renderSavedPlayersList,
  renderGamePlayers
};
