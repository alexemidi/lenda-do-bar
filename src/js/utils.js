// src/js/utils.js
// Funções utilitárias genéricas: não conhecem DOM nem HTML.

/**
 * Embaralha um array (retorna uma cópia).
 * Algoritmo de Fisher–Yates.
 */
export function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Calcula um tempo de leitura em milissegundos
 * com base no tamanho da frase.
 * - base: 3000ms
 * - +20ms por caractere
 * - mínimo 3000, máximo 4000
 */
export function calcularTempoLeitura(frase) {
  const base = 3000;
  const extra = frase.length * 20;
  const total = base + extra;
  return Math.max(3000, Math.min(4000, total));
}

/**
 * Dado um array de jogadores e um índice,
 * retorna o índice do próximo jogador vivo (player.vivo === true).
 * Se não achar ninguém, retorna o próprio índice.
 */
export function getNextAliveIndex(players, fromIndex) {
  const n = players.length;
  if (n === 0) return null;
  let i = (fromIndex + 1) % n;
  while (i !== fromIndex) {
    if (players[i].vivo) return i;
    i = (i + 1) % n;
  }
  return fromIndex;
}

/**
 * Formata o nome para exibição:
 * - até 10 caracteres: normal
 * - até 20: normal
 * - mais de 20: corta e coloca "..."
 */
export function formatDisplayName(name) {
  if (name.length <= 10) return name;
  if (name.length <= 20) return name;
  return name.slice(0, 20) + "...";
}

/**
 * Retorna uma classe de tamanho para estilizar o nome:
 * - short: até 10
 * - medium: até 20
 * - long: acima de 20
 */
export function getNameLengthClass(name) {
  if (name.length <= 10) return "short";
  if (name.length <= 20) return "medium";
  return "long";
}
