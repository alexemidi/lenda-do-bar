// src/js/ui.js
// Mapeamento dos elementos do DOM + troca de telas.
// Versão atualizada: inclui confirmação ao excluir jogador.

import { deletePlayer } from "./storage.js";

/**
 * Helper para obter elemento por id com aviso se não existir.
 */
function $id(id) {
  const el = document.getElementById(id);
  if (!el) console.error(`[ui.js] Elemento "${id}" não encontrado.`);
  return el;
}

/* ============================
   Telas principais (ordem lógica)
   ============================ */
export const screenStart        = $id("screen-start");
export const screenSetup        = $id("screen-setup");
export const screenSelectPlayer = $id("screen-select-player");
export const screenMesa         = $id("screen-mesa");
export const screenGame         = $id("screen-game");
export const screenWin          = $id("screen-win");

/* ============================
   Botões principais
   ============================ */
export const btnGoSetup     = $id("btnGoSetup");
export const btnBackToStart = $id("btnBackToStart");
export const btnBackToSetup = $id("btnBackToSetup");
export const btnStartGame   = $id("btnStartGame");

export const btnAddPlayer   = $id("btnAddPlayer");

export const btnRestartGame = $id("btnRestartGame");
export const btnNewGame     = $id("btnNewGame");

export const btnWinRepeat   = $id("btnWinRepeat");
export const btnWinSetup    = $id("btnWinSetup");

/* ============================
   Inputs e containers dinâmicos
   ============================ */
export const slotsContainer       = $id("slotsContainer");
export const savedPlayersList     = $id("savedPlayersList");
export const newPlayerNameInput   = $id("newPlayerName");

export const gamePlayersContainer = $id("gamePlayersContainer");
export const mesaInfoEl           = $id("mesaInfo");
export const starterInfoEl        = $id("starterInfo");
export const statusEl             = $id("status");
export const logEl                = $id("log");

export const winMessageEl         = $id("winMessage");

/* ============================
   Elementos da tela MESA (antes intro)
   ============================ */
export const mesaCardIntro   = $id("introCard");
export const mesaNarrator    = $id("mesaNarrator");

/* mini-card — atualmente NÃO usado, mas mantido para compatibilidade */
export const miniCardContainer = $id("miniCardContainer");

/* ============================
   Controle geral de telas
   ============================ */
export function showScreen(screenEl) {
  const allScreens = [
    screenStart,
    screenSetup,
    screenSelectPlayer,
    screenMesa,
    screenGame,
    screenWin
  ].filter(Boolean);

  allScreens.forEach(s => s.classList.remove("active"));

  if (!screenEl) {
    console.error("[ui.js] showScreen recebeu tela inválida.");
    return;
  }

  screenEl.classList.add("active");
}

/* ============================
   Renderização dos jogadores salvos
   (usado na tela SELECT PLAYER)
   ============================ */

/**
 * Renderiza a lista de jogadores com botão de excluir + confirmação.
 * 
 * IMPORTANTE: essa função será chamada pelo game.js.
 */
export function renderSavedPlayersListUI(savedPlayers, slots, savePlayersFn, rerenderFn) {
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

    const btnSelect = document.createElement("button");
    btnSelect.textContent = name;
    btnSelect.onclick = () => rerenderFn("select", name);
    row.appendChild(btnSelect);

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "X";
    btnDelete.className = "danger btn-delete";

    btnDelete.onclick = () => {
      const ok = confirm(`Deseja remover permanentemente "${name}"?`);
      if (!ok) return;

      // remove do storage
      const updated = deletePlayer(name);
      savePlayersFn(updated);

      // limpa slots que tinham esse nome
      const newSlots = slots.map(s => (s === name ? null : s));

      rerenderFn("delete", { updatedPlayers: updated, updatedSlots: newSlots });
    };

    row.appendChild(btnDelete);
    savedPlayersList.appendChild(row);
  });
}
