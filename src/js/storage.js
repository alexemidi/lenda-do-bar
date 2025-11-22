/* =========================================================
   STORAGE.JS — Gerenciamento de jogadores no localStorage
   ========================================================= */

/*
  Este arquivo cuida de:
  - carregar e salvar jogadores armazenados no celular
  - evitar nomes duplicados
  - remover nomes não usados
  - manter compatibilidade com versões futuras do jogo

  Ele exporta funções simples para o restante do projeto:
  - loadPlayers()
  - savePlayers()
  - addPlayer(name)
  - deletePlayer(name)
  - getAvailablePlayers(slots)
*/


/* =========================================================
   CHAVE DO LOCALSTORAGE
   ========================================================= */

const STORAGE_KEY = "mentiroso_de_bar_players";

let playersCache = []; // cache interno em memória


/* =========================================================
   CARREGAR JOGADORES SALVOS
   ========================================================= */

export function loadPlayers() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    playersCache = [];
    return playersCache;
  }

  try {
    const parsed = JSON.parse(data);
    playersCache = Array.isArray(parsed) ? parsed : [];
  } catch {
    playersCache = [];
  }

  return playersCache;
}


/* =========================================================
   SALVAR NO LOCALSTORAGE
   ========================================================= */

export function savePlayers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playersCache));
}


/* =========================================================
   ADICIONAR NOVO JOGADOR
   ========================================================= */

export function addPlayer(name) {
  // ignora strings vazias
  if (!name || typeof name !== "string") return false;

  name = name.trim();

  // impede duplicatas
  if (playersCache.includes(name)) return false;

  playersCache.push(name);
  savePlayers();
  return true;
}


/* =========================================================
   REMOVER JOGADOR DEFINITIVAMENTE
   ========================================================= */

export function deletePlayer(name) {
  playersCache = playersCache.filter(n => n !== name);
  savePlayers();
}


/* =========================================================
   OBTER LISTA DE JOGADORES DISPONÍVEIS
   ========================================================= */

/*
  Filtra jogadores já usados nos slots da partida atual.
  Assim não aparece "Alex" duas vezes.
*/

export function getAvailablePlayers(slots) {
  const usados = new Set(slots.filter(Boolean));
  return playersCache.filter(name => !usados.has(name));
}


/* =========================================================
   EXPORT DEFAULT (opcional)
   Permite importar como:
   import storage from './storage.js'
   storage.loadPlayers()
   ========================================================= */

export default {
  loadPlayers,
  savePlayers,
  addPlayer,
  deletePlayer,
  getAvailablePlayers
};
