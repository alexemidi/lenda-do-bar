/* =========================================================
   UI.JS — Contém todo o gerenciamento visual do jogo
   ========================================================= */

/*
  Neste arquivo ficam APENAS funções de interface:

  - Criar telas
  - Atualizar listas
  - Renderizar cards de jogadores
  - Atualizar mesa, falas e log
  - Controlar visibilidade das telas

  A lógica do jogo NÃO fica aqui.
  Este arquivo trabalha lado a lado com game.js.
*/


/* =========================================================
   IMPORTS
   ========================================================= */

import { playerEmojis } from "./profiles.js";
import { getAvailablePlayers } from "./storage.js";
import {
  formatDisplayName,
  getNameLengthClass
} from "./utils.js";


/* =========================================================
   REFERÊNCIAS ÀS TELAS (criadas dinamicamente no index)
   ========================================================= */

const app = document.getElementById("app");

// containers que serão criados nas telas
let screenStart, screenSetup, screenSelect, screenGame, screenWin;


/* =========================================================
   FUNÇÃO PRINCIPAL: CRIAR TODAS AS TELAS
   ========================================================= */

export function buildScreens() {
  app.innerHTML = `
    <!-- ============================== -->
    <!-- TELA 1 — INÍCIO -->
    <!-- ============================== -->
    <div id="screen-start" class="screen active">
      <h1>O Mentiroso do Bar</h1>
      <p style="text-align:center;">Selecione de 2 a 4 jogadores e comece a partida.</p>
      <button class="primary" id="btnGoSetup">Jogar</button>
    </div>

    <!-- ============================== -->
    <!-- TELA 2 — CONFIGURAÇÃO -->
    <!-- ============================== -->
    <div id="screen-setup" class="screen">
      <h2>Selecionar jogadores</h2>
      <p>Escolha de 2 a 4 jogadores para a partida.</p>

      <div id="slotsContainer"></div>

      <button class="primary" id="btnStartGame" disabled>Iniciar partida</button>
      <button class="danger" id="btnBackToStart">Voltar</button>
    </div>

    <!-- ============================== -->
    <!-- TELA 3 — SELEÇÃO / CADASTRO -->
    <!-- ============================== -->
    <div id="screen-select-player" class="screen">
      <h2>Escolher jogador</h2>

      <div class="input-row">
        <input type="text" id="newPlayerName" placeholder="Novo jogador">
        <button class="secondary" id="btnAddPlayer">+ Adicionar</button>
      </div>

      <p>Jogadores salvos:</p>
      <div id="savedPlayersList" class="players-list"></div>

      <button class="danger" id="btnBackToSetup">Cancelar</button>
    </div>

    <!-- ============================== -->
    <!-- TELA 4 — PARTIDA -->
    <!-- ============================== -->
    <div id="screen-game" class="screen">
      <h2>O Mentiroso do Bar</h2>

      <div id="mesaInfo"></div>
      <div id="starterInfo"></div>

      <div id="gamePlayersContainer" class="game-players"></div>

      <div id="status">Clique em um jogador para atirar.</div>

      <div id="log"></div>

      <div class="top-actions">
        <button class="secondary" id="btnRestartGame">Reiniciar partida</button>
        <button class="danger" id="btnNewGame">Nova seleção</button>
      </div>
    </div>

    <!-- ============================== -->
    <!-- TELA 5 — VITÓRIA -->
    <!-- ============================== -->
    <div id="screen-win" class="screen">
      <h2>Parabéns!</h2>
      <p id="winMessage" style="text-align:center; margin-bottom:16px;"></p>
      <button class="primary" id="btnWinRepeat">Repetir jogadores</button>
      <button class="secondary" id="btnWinSetup">Voltar para seleção</button>
    </div>
  `;

  // salvar referências
  screenStart  = document.getElementById("screen-start");
  screenSetup  = document.getElementById("screen-setup");
  screenSelect = document.getElementById("screen-select-player");
  screenGame   = document.getElementById("screen-game");
  screenWin    = document.getElementById("screen-win");
}


/* =========================================================
   TROCAR TELAS
   ========================================================= */

export function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}


/* =========================================================
   1) TELA DE CONFIGURAÇÃO — SLOTS
   ========================================================= */

export function renderSlots(slots, onSelect, onRemove) {
  const container = document.getElementById("slotsContainer");
  container.innerHTML = "";

  slots.forEach((name, index) => {
    const div = document.createElement("div");
    div.className = "slot";

    const label = document.createElement("div");
    label.className = "slot-name";
    label.textContent = name || "Selecione um jogador";
    div.appendChild(label);

    const btnSelect = document.createElement("button");
    btnSelect.textContent = "Selecionar";
    btnSelect.className = "secondary";
    btnSelect.onclick = () => onSelect(index);
    div.appendChild(btnSelect);

    const btnRemove = document.createElement("button");
    btnRemove.textContent = "Remover";
    btnRemove.className = "danger";
    btnRemove.onclick = () => onRemove(index);
    div.appendChild(btnRemove);

    container.appendChild(div);
  });
}


/* =========================================================
   2) LISTA DE JOGADORES SALVOS
   ========================================================= */

export function renderSavedPlayers(slots, savedPlayers, onSelect, onDelete) {
  const list = document.getElementById("savedPlayersList");
  list.innerHTML = "";

  const disponiveis = getAvailablePlayers(slots);

  if (disponiveis.length === 0) {
    list.innerHTML = "<p>Nenhum jogador disponível.</p>";
    return;
  }

  disponiveis.forEach(name => {
    const row = document.createElement("div");
    row.className = "player-row";

    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => onSelect(name);
    row.appendChild(btn);

    const btnDel = document.createElement("button");
    btnDel.textContent = "X";
    btnDel.className = "danger btn-delete";
    btnDel.onclick = () => onDelete(name);
    row.appendChild(btnDel);

    list.appendChild(row);
  });
}


/* =========================================================
   3) TELA DE JOGO — RENDERIZAR CARDS
   ========================================================= */

export function renderGamePlayers(players, onShoot) {
  const container = document.getElementById("gamePlayersContainer");
  container.innerHTML = "";

  players.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "game-player";
    if (!p.vivo) card.classList.add("dead");

    // === LADO ESQUERDO: EMOJI + NOME ===
    const left = document.createElement("div");
    left.className = "gp-left";

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "gp-emoji";
    emojiSpan.textContent = p.vivo ? playerEmojis[p.perfil] : "💀";
    left.appendChild(emojiSpan);

    const nameSpan = document.createElement("span");
    nameSpan.textContent = formatDisplayName(p.nome);
    nameSpan.classList.add("player-name", getNameLengthClass(p.nome));
    left.appendChild(nameSpan);

    // === LADO DIREITO: TIROS + BOTÃO ===
    const right = document.createElement("div");
    right.className = "gp-right";

    const shots = document.createElement("span");
    shots.className = "gp-shots";
    shots.textContent = `${p.tiros}/6`;
    right.appendChild(shots);

    const btn = document.createElement("button");
    btn.textContent = "Atirar";
    btn.className = "danger";
    btn.disabled = !p.vivo || p.isShooting;
    btn.onclick = () => onShoot(index);
    right.appendChild(btn);

    card.appendChild(left);
    card.appendChild(right);

    container.appendChild(card);
  });
}


/* =========================================================
   ATUALIZAR A MESA (K / Q / A)
   ========================================================= */

export function updateMesa(carta, nomeMesa) {
  document.getElementById("mesaInfo").textContent =
    `Mesa de ${carta} - ${nomeMesa}`;
}


/* =========================================================
   ATUALIZAR O JOGADOR DA VEZ
   ========================================================= */

export function updateStarterDisplay(name) {
  document.getElementById("starterInfo").textContent =
    name ? `Agora é a vez de: ${name}` : "";
}


/* =========================================================
   MOSTRAR FALA ATUAL
   ========================================================= */

export function updateStatus(texto) {
  document.getElementById("status").textContent = texto;
}


/* =========================================================
   ADICIONAR TEXTO AO LOG
   ========================================================= */

export function addLog(texto) {
  const log = document.getElementById("log");
  log.textContent += texto + "\n";
  log.scrollTop = log.scrollHeight;
}


/* =========================================================
   TELA DE VITÓRIA
   ========================================================= */

export function showWinMessage(texto) {
  document.getElementById("winMessage").textContent = texto;
}
