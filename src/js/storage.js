// src/js/storage.js
// Responsável por salvar/carregar jogadores no localStorage.

const STORAGE_KEY = "mentiroso_de_bar_players";

/**
 * Lê a lista de jogadores salvos no localStorage.
 * Retorna sempre um array de strings.
 */
export function loadPlayers() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error("Erro ao ler jogadores do localStorage:", e);
    return [];
  }
}

/**
 * Salva a lista completa de jogadores no localStorage.
 */
export function savePlayers(players) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (e) {
    console.error("Erro ao salvar jogadores no localStorage:", e);
  }
}

/**
 * Adiciona um jogador novo (se ainda não existir).
 * Retorna o array atualizado.
 */
export function addPlayer(name) {
  const players = loadPlayers();
  if (!players.includes(name)) {
    players.push(name);
    savePlayers(players);
  }
  return players;
}

/**
 * Remove um jogador da lista.
 * Retorna o array atualizado.
 */
export function deletePlayer(name) {
  const players = loadPlayers().filter(p => p !== name);
  savePlayers(players);
  return players;
}

/**
 * Remove todos os jogadores salvos.
 */
export function clearPlayers() {
  savePlayers([]);
}
