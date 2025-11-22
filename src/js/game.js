/* =========================================================
   GAME.JS — Motor principal do jogo
   ========================================================= */

/*
  Este arquivo coordena TODO o fluxo da partida:

  - slots de jogadores
  - seleção
  - início do jogo
  - sorteio do narrador
  - sorteio de perfis dos jogadores
  - gerenciamento da mesa
  - tiros e mortes
  - fal falha / bum
  - ordem correta das falas
  - fim do jogo

  Ele se comunica COM:
    ui.js      → interface gráfica
    profiles.js→ perfis dos jogadores e narradores
    utils.js   → funções auxiliares
    storage.js → jogadores salvos
*/


/* =========================================================
   IMPORTS
   ========================================================= */

import { playerProfiles, narratorProfiles, playerEmojis } from "./profiles.js";
import { shuffleArray, calcularTempoLeitura, getNextAliveIndex } from "./utils.js";
import { loadPlayers, addPlayer, deletePlayer, getAvailablePlayers } from "./storage.js";

import {
  buildScreens,
  showScreen,
  renderSlots,
  renderSavedPlayers,
  renderGamePlayers,
  updateMesa,
  updateStarterDisplay,
  updateStatus,
  addLog,
  showWinMessage
} from "./ui.js";


/* =========================================================
   ESTADO GLOBAL DO JOGO
   ========================================================= */

let slots = [null, null, null, null];   // até 4 jogadores
let savedPlayers = [];                  // lista salva no celular
let currentSlotIndex = null;            // slot selecionado para escolher jogador

let gamePlayers = [];                   // jogadores da partida
let narrador = null;                    // narrador sorteado
let cartaAtual = "K";                   // K → Q → A → K...
let contagemMesa = 0;                   // 0,1,2 (muda após 3 tiros)
let ordemMesa = ["K", "Q", "A"];        // rotação
let starterIndex = null;                // jogador que inicia a mão
let jogoAtivo = false;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

init();

function init() {
  savedPlayers = loadPlayers();
  buildScreens();
  vincularEventosInicio();
}


/* =========================================================
   VINCULAR EVENTOS DA TELA 1 (INÍCIO)
   ========================================================= */

function vincularEventosInicio() {
  document.getElementById("btnGoSetup").onclick = () => {
    carregarSetups();
    showScreen("screen-setup");
  };
}


/* =========================================================
   CARREGAR TELA DE CONFIGURAÇÃO
   ========================================================= */

function carregarSetups() {
  renderSlots(slots, abrirSelecaoJogador, removerSlotJogador);

  document.getElementById("btnStartGame").onclick = iniciarPartida;
  document.getElementById("btnBackToStart").onclick = () =>
    showScreen("screen-start");

  checarBotaoInicio();
}


/* =========================================================
   ABRIR TELA DE SELEÇÃO DE JOGADOR
   ========================================================= */

function abrirSelecaoJogador(slotIndex) {
  currentSlotIndex = slotIndex;

  renderSavedPlayers(
    slots,
    savedPlayers,
    selecionarJogadorExistente,
    deletarJogadorSalvo
  );

  document.getElementById("btnAddPlayer").onclick = adicionarNovoJogador;

  document.getElementById("btnBackToSetup").onclick = () => {
    showScreen("screen-setup");
  };

  showScreen("screen-select-player");
}


/* =========================================================
   ADICIONAR NOVO JOGADOR (E JÁ COLOCAR NO SLOT)
   ========================================================= */

function adicionarNovoJogador() {
  const input = document.getElementById("newPlayerName");
  const nome = input.value.trim();

  if (!nome) return;

  if (savedPlayers.includes(nome)) {
    alert("Esse nome já está salvo!");
    return;
  }

  addPlayer(nome);
  savedPlayers = loadPlayers();

  slots[currentSlotIndex] = nome;
  input.value = "";

  carregarSetups();
  showScreen("screen-setup");
}


/* =========================================================
   SELECIONAR JOGADOR EXISTENTE
   ========================================================= */

function selecionarJogadorExistente(name) {
  slots[currentSlotIndex] = name;
  carregarSetups();
  showScreen("screen-setup");
}


/* =========================================================
   DELETAR JOGADOR DA MEMÓRIA
   ========================================================= */

function deletarJogadorSalvo(name) {
  deletePlayer(name);
  savedPlayers = loadPlayers();

  renderSavedPlayers(slots, savedPlayers, selecionarJogadorExistente, deletarJogadorSalvo);
}


/* =========================================================
   REMOVER JOGADOR DO SLOT
   ========================================================= */

function removerSlotJogador(index) {
  slots[index] = null;
  carregarSetups();
}


/* =========================================================
   ATIVAR / DESATIVAR BOTÃO DE INICIAR PARTIDA
   ========================================================= */

function checarBotaoInicio() {
  const selecionados = slots.filter(s => s !== null).length;
  document.getElementById("btnStartGame").disabled = selecionados < 2;
}


/* =========================================================
   INICIAR A PARTIDA
   ========================================================= */

function iniciarPartida() {
  const nomes = slots.filter(Boolean);

  // sorteio aleatório de perfis
  const perfisDisponiveis = shuffleArray(Object.keys(playerProfiles)).slice(0, nomes.length);

  gamePlayers = nomes.map((nome, i) => ({
    nome,
    perfil: perfisDisponiveis[i],
    vivo: true,
    tiros: 0,
    isShooting: false
  }));

  // sorteio do narrador
  const narradores = Object.keys(narratorProfiles);
  narrador = narradores[Math.floor(Math.random() * narradores.length)];

  // sorteio do jogador inicial
  starterIndex = Math.floor(Math.random() * gamePlayers.length);

  cartaAtual = "K";
  contagemMesa = 0;
  jogoAtivo = true;

  prepararTelaJogo();
}


/* =========================================================
   PREPARAR TELA DE JOGO
   ========================================================= */

function prepararTelaJogo() {
  showScreen("screen-game");
  updateMesa("K", "Reis");

  const starterName = gamePlayers[starterIndex].nome;
  updateStarterDisplay(starterName);

  renderGamePlayers(gamePlayers, jogadorAtira);

  setTimeout(() => {
    updateStatus(narratorProfiles[narrador].intro);
    addLog(`🗣️ Narrador (${narrador}): ${narratorProfiles[narrador].intro}`);
  }, 400);

  setTimeout(() => {
    const falaMesa = narratorProfiles[narrador].mesaIntro[cartaAtual];
    updateStatus(falaMesa);
    addLog(`Mesa: ${falaMesa}`);
  }, 3400);

  vincularBotoesPartida();
}


/* =========================================================
   VÍNCULO DOS BOTÕES DURANTE A PARTIDA
   ========================================================= */

function vincularBotoesPartida() {
  document.getElementById("btnRestartGame").onclick = reiniciarPartida;
  document.getElementById("btnNewGame").onclick = () => showScreen("screen-setup");
}


/* =========================================================
   LÓGICA DO TIRO
   ========================================================= */

function jogadorAtira(index) {
  if (!jogoAtivo || !gamePlayers[index].vivo) return;

  const jogador = gamePlayers[index];
  jogador.isShooting = true;

  const frase = sortearFraseAntes(jogador);
  const tempo = calcularTempoLeitura(frase);

  updateStatus(`${playerEmojis[jogador.perfil]} ${jogador.nome}: ${frase}`);
  addLog(`🎤 ${jogador.nome}: ${frase}`);

  renderGamePlayers(gamePlayers, jogadorAtira);

  setTimeout(() => {
    executarTiro(index);
  }, tempo);
}


/* =========================================================
   EXECUTAR TIRO
   ========================================================= */

function executarTiro(index) {
  const jogador = gamePlayers[index];
  jogador.tiros++;

  const roleta = Math.floor(Math.random() * 6);

  if (roleta === 0) {
    // morreu
    jogador.vivo = false;
    updateStatus("💥 BUM!");
    addLog(`💥 ${jogador.nome} morreu!`);

    // Interação do narrador
    const perfil = jogador.perfil;
    const killSet = narratorProfiles[narrador].killLines;

    const falaNarrador =
      killSet[perfil] || killSet.default;

    setTimeout(() => {
      updateStatus(`🗣️ Narrador: ${falaNarrador}`);
      addLog(`🗣️ Narrador (${narrador}): ${falaNarrador}`);
    }, 1500);

    verificarFimDeJogo();

  } else {
    // não morreu
    updateStatus("🔫 *CLIQUE*");
    addLog(`🔫 ${jogador.nome}: clique!`);

    const frase = sortearFraseDepois(jogador);

    setTimeout(() => {
      updateStatus(`${playerEmojis[jogador.perfil]} ${jogador.nome}: ${frase}`);
      addLog(`🎤 ${jogador.nome}: ${frase}`);
    }, 1500);

    atualizarMesa();
  }

  jogador.isShooting = false;
  renderGamePlayers(gamePlayers, jogadorAtira);
}


/* =========================================================
   ATUALIZAR A MESA (K → Q → A → K)
   ========================================================= */

function atualizarMesa() {
  contagemMesa++;

  if (contagemMesa >= 3) {
    contagemMesa = 0;

    const idx = ordemMesa.indexOf(cartaAtual);
    const proximo = (idx + 1) % ordemMesa.length;
    cartaAtual = ordemMesa[proximo];

    const nomes = { K: "Reis", Q: "Rainhas", A: "Ás" };
    updateMesa(cartaAtual, nomes[cartaAtual]);

    setTimeout(() => {
      const fala = narratorProfiles[narrador].mesaIntro[cartaAtual];
      updateStatus(fala);
      addLog(`Mesa: ${fala}`);
    }, 1500);
  }
}


/* =========================================================
   FRASES ANTES E DEPOIS DO TIRO
   ========================================================= */

function sortearFraseAntes(j) {
  const arr = playerProfiles[j.perfil].before;
  return arr[Math.floor(Math.random() * arr.length)];
}

function sortearFraseDepois(j) {
  const arr = playerProfiles[j.perfil].afterSurvive;
  return arr[Math.floor(Math.random() * arr.length)];
}


/* =========================================================
   VERIFICAR FIM DE JOGO
   ========================================================= */

function verificarFimDeJogo() {
  const vivos = gamePlayers.filter(p => p.vivo);

  if (vivos.length === 1) {
    const vencedor = vivos[0];

    const falas = narratorProfiles[narrador].winner;
    const falaFinal = falas[Math.floor(Math.random() * falas.length)]
      .replace("{nome}", vencedor.nome);

    setTimeout(() => {
      updateStatus(`🗣️ Narrador: ${falaFinal}`);
      addLog(`🗣️ Narrador (${narrador}): ${falaFinal}`);
    }, 1500);

    setTimeout(() => {
      showWinMessage(falaFinal);
      showScreen("screen-win");
    }, 3500);
  }
}


/* =========================================================
   REINICIAR PARTIDA COM OS MESMOS JOGADORES
   ========================================================= */

function reiniciarPartida() {
  iniciarPartida();
}
