/* =========================================================
   UTILS.JS — Funções utilitárias usadas no jogo inteiro
   ========================================================= */

/*
  Este arquivo NÃO tem lógica do jogo.
  Ele contém apenas funções genéricas e úteis que podem ser
  reutilizadas em qualquer parte do projeto.

  Elas são importadas por game.js, ui.js, etc.
*/


/* =========================================================
   EMBARALHAR ARRAYS (Fisher–Yates)
   ========================================================= */

/*
  Função clássica para embaralhar arrays sem viés.

  Exemplo de uso:
  const perfisMisturados = shuffleArray(["A", "B", "C"]);
*/

export function shuffleArray(array) {
  const arr = array.slice(); // copia para não alterar o original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


/* =========================================================
   TEMPO DE LEITURA DE FRASES (antes do tiro)
   ========================================================= */

/*
  Calcula quanto tempo a frase deve ficar na tela antes do tiro.

  - mínimo: 3 segundos
  - máximo: 4 segundos
  - aumenta levemente conforme o tamanho da frase

  Isso dá tempo real para os jogadores lerem.
*/

export function calcularTempoLeitura(frase) {
  const base = 3000;            // 3 segundos mínimo
  const extra = frase.length * 20;  // 20 ms por caractere
  const total = base + extra;
  return Math.max(3000, Math.min(4000, total));
}


/* =========================================================
   FORMATAÇÃO DO NOME — depende do tamanho
   ========================================================= */

/*
  Regras:
  - até 10 caracteres → nome normal
  - até 20 → letra um pouco menor
  - mais de 20 → corta com "..."
*/

export function formatDisplayName(name) {
  if (name.length <= 10) return name; // curto
  if (name.length <= 20) return name; // médio
  return name.slice(0, 20) + "...";   // longo
}

/*
  Cada nome recebe uma classe CSS:
  short / medium / long
*/

export function getNameLengthClass(name) {
  if (name.length <= 10) return "short";
  if (name.length <= 20) return "medium";
  return "long";
}


/* =========================================================
   PEGAR O PRÓXIMO ÍNDICE VIVO
   ========================================================= */

/*
  Dado o índice atual, retorna o próximo jogador vivo.

  - Passa pelos mortos automaticamente
  - Loop circular (se estiver no último, volta ao primeiro)
*/

export function getNextAliveIndex(players, fromIndex) {
  const n = players.length;

  if (n === 0) return null;

  let i = (fromIndex + 1) % n;

  while (i !== fromIndex) {
    if (players[i].vivo) return i;
    i = (i + 1) % n;
  }

  return fromIndex; // se só sobrou 1 jogador vivo
}
