// src/js/utils.js
// Funções utilitárias usadas no jogo. Comentários diretos e funcionais.

/* ============================================================
   1) Embaralhar array (Fisher–Yates)
   - usado para randomizar perfis dos jogadores
   ============================================================ */
export function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ============================================================
   2) Tempo de leitura
   - usado para timing de falas do narrador e falas dos players
   - mínimo 3s, máximo 4s
   ============================================================ */
export function calcularTempoLeitura(frase) {
  const base = 3000;
  const extra = frase.length * 20;
  const total = base + extra;
  return Math.max(3000, Math.min(4000, total));
}

/* ============================================================
   3) Próximo jogador vivo
   - avança para o próximo player que ainda está vivo
   - retorna o índice do próximo vivo
   ============================================================ */
export function getNextAliveIndex(players, fromIndex) {
  const total = players.length;
  if (!total) return null;

  let i = (fromIndex + 1) % total;

  // loop até voltar para o mesmo índice
  while (i !== fromIndex) {
    if (players[i].vivo) return i;
    i = (i + 1) % total;
  }

  return fromIndex; // se nenhum outro vivo
}

/* ============================================================
   4) Nome exibido na interface
   - corta nomes longos para evitar quebrar layout
   ============================================================ */
export function formatDisplayName(name) {
  if (name.length <= 20) return name;
  return name.slice(0, 20) + "...";
}

/* ============================================================
   5) Classe para tamanho do nome
   - útil para aplicar classes CSS diferentes (short/medium/long)
   ============================================================ */
export function getNameLengthClass(name) {
  if (name.length <= 10) return "short";
  if (name.length <= 20) return "medium";
  return "long";
}
