// src/js/ui.js
// Responsável por acessar elementos do DOM e trocar de tela.

// ----- Telas -----
export const screenStart        = document.getElementById("screen-start");
export const screenSetup        = document.getElementById("screen-setup");
export const screenSelectPlayer = document.getElementById("screen-select-player");
export const screenGame         = document.getElementById("screen-game");
export const screenWin          = document.getElementById("screen-win");

// ----- Botões principais -----
export const btnGoSetup     = document.getElementById("btnGoSetup");
export const btnBackToStart = document.getElementById("btnBackToStart");
export const btnBackToSetup = document.getElementById("btnBackToSetup");
export const btnStartGame   = document.getElementById("btnStartGame");

export const btnAddPlayer   = document.getElementById("btnAddPlayer");

export const btnRestartGame = document.getElementById("btnRestartGame");
export const btnNewGame     = document.getElementById("btnNewGame");

export const btnWinRepeat   = document.getElementById("btnWinRepeat");
export const btnWinSetup    = document.getElementById("btnWinSetup");

// ----- Inputs e listas -----
export const slotsContainer       = document.getElementById("slotsContainer");
export const savedPlayersList     = document.getElementById("savedPlayersList");
export const newPlayerNameInput   = document.getElementById("newPlayerName");

export const gamePlayersContainer = document.getElementById("gamePlayersContainer");
export const mesaInfoEl           = document.getElementById("mesaInfo");
export const starterInfoEl        = document.getElementById("starterInfo");
export const statusEl             = document.getElementById("status");
export const logEl                = document.getElementById("log");

export const winMessageEl         = document.getElementById("winMessage");

// ----- Controle de telas -----
export function showScreen(screenEl) {
  const allScreens = [
    screenStart,
    screenSetup,
    screenSelectPlayer,
    screenGame,
    screenWin
  ];

  allScreens.forEach(s => s.classList.remove("active"));
  screenEl.classList.add("active");
}
