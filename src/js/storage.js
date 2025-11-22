// src/js/storage.js
// Persistência de jogadores usando localStorage — simples, segura e com fallback.

// chave usada no localStorage
const STORAGE_KEY = "mentiroso_de_bar_players";

/**
 * Lê a lista de jogadores do localStorage.
 * Retorna sempre um array (vazio se não existir ou JSON inválido).
 */
export function loadPlayers() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("[storage] JSON inválido em localStorage:", e);
    return [];
  }
}

/**
 * Salva a lista completa de jogadores.
 * Usa try/catch para evitar quebrar a aplicação em caso de quota ou erro.
 */
export function savePlayers(players) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players || []));
  } catch (e) {
    console.error("[storage] erro ao salvar jogadores:", e);
  }
}

/**
 * Adiciona um jogador (se não existir) e retorna o array atualizado.
 * Evita duplicatas exatas (case-sensitive).
 */
export function addPlayer(name) {
  if (!name || typeof name !== "string") return loadPlayers();
  const players = loadPlayers();
  if (!players.includes(name)) {
    players.push(name);
    savePlayers(players);
  }
  return players;
}

/**
 * Remove todas as ocorrências exatas do nome e retorna o array atualizado.
 */
export function deletePlayer(name) {
  if (!name) return loadPlayers();
  const players = loadPlayers().filter(p => p !== name);
  savePlayers(players);
  return players;
}

/**
 * Limpa todos os jogadores (utilitário).
 */
export function clearPlayers() {
  savePlayers([]);
}
