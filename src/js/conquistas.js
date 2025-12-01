export const ACHIEVEMENTS_DEF = [
    // --- VISÍVEIS ---
    { id: 'first_win', emoji: '🏆', name: 'Nasce uma Lenda', desc: 'Venceu a partida pela primeira vez.', check: (s, c) => s.wins === 1 },
    { id: 'vip_client', emoji: '🤠', name: 'Cliente VIP', desc: 'Jogou 20 partidas completas.', check: (s, c) => s.matches >= 20 },
    { id: 'win_10', emoji: '💀', name: 'O Terror da Mesa', desc: 'Ganhou 10 partidas.', check: (s, c) => s.wins >= 10 },
    { id: 'die_10', emoji: '🤕', name: 'Alvo Fácil', desc: 'Morreu 10 vezes.', check: (s, c) => s.hits >= 10 },
    { id: 'die_5_6', emoji: '😨', name: 'Último Suspiro', desc: 'Ficou faltando só um disparo (5/6).', check: (s, c) => c.didDodgeLastShotBefore },
    { id: 'massacre_3_deaths', emoji: '🩸', name: 'Banho de Sangue', desc: '3 ou mais morreram num massacre.', check: (s, c) => c.isMassacre && c.massacreDeaths >= 3 },
    { id: 'chaos_luck', emoji: '🍀', name: 'Sorte no Caos', desc: 'Faltando dois disparos para morrer acertou outro jogador.', check: (s, c) => c.chaosLuckHit },

    // --- OCULTAS ---
    { id: 'die_1_6', emoji: '⏱️', name: 'Speedrun do Além', desc: 'Morreu no primeiro disparo.', isHidden: true, check: (s, c) => c.diedOnShot === 1 },
    { id: 'cat_lives', emoji: '🐈', name: 'Sete Vidas', desc: 'Acumulou 70 sobrevivências.', isHidden: true, check: (s, c) => s.dodges >= 70 },
    { id: 'win_last_shot', emoji: '😎', name: 'Um pé na cova', desc: 'Venceu por um triz (5/6).', isHidden: true, check: (s, c) => c.didWinLastShotBefore && s.wins >= 1 },
    { id: 'win_streak_3', emoji: '🔥', name: 'Imorrível', desc: 'Ganhou 3 partidas seguidas.', isHidden: true, check: (s, c) => s._meta.winStreak >= 3 },
    { id: 'no_shot_win', emoji: '🤖', name: 'Tá de Hack', desc: 'Venceu sem disparar (0/6).', isHidden: true, check: (s, c) => s.wins >= 1 && s.dodges === 0 && s.hits === 0 },
    { id: 'untouchable', emoji: '⚖️', name: 'O Intocável', desc: 'Ganhou tendo sido protegido na rodada final.', isHidden: true, check: (s, c) => c.wasProtectedWinner },
    { id: 'king_table', emoji: '👑', name: 'Rei da Mesa', desc: 'Ganhou 20 ou mais partidas.', isHidden: true, check: (s, c) => s.wins >= 20 },
    { id: 'legend_legends', emoji: '🧙‍♂️', name: 'Lenda das Lendas', desc: 'Ganhou 50 ou mais partidas.', isHidden: true, check: (s, c) => s.wins >= 50 },
    { id: 'dreaming_beyond', emoji: '😭', name: 'Estão Deixando a Gente Sonhar... No Além', desc: 'Primeiro a morrer três vezes seguidas.', isHidden: true, check: (s, c) => s._meta.dieStreak >= 3 },
    { id: 'die_stubborn', emoji: '☠️', name: 'Morreu de Teimoso', desc: 'Morreu na última bala (6/6).', isHidden: true, check: (s, c) => c.diedOnShot === 6 },
    { id: 'die_50', emoji: '😭', name: 'Não estou suportando mais', desc: 'Morreu 50 ou mais vezes.', isHidden: true, check: (s, c) => s.hits >= 50 },
    { id: 'die_100', emoji: '🪦', name: 'Veterano do Além', desc: 'Morreu 100 ou mais vezes.', isHidden: true, check: (s, c) => s.hits >= 100 },
    { id: 'saint_intern', emoji: '😇', name: 'O Santo era Estagiário', desc: 'Morreu na segunda bala (2/6).', isHidden: true, check: (s, c) => c.diedOnShot === 2 },
    { id: 'public_enemy', emoji: '🎯', name: 'Inimigo Público nº 1', desc: 'Sobreviveu ao Caos sendo alvo de 3 ou mais jogadores.', isHidden: true, check: (s, c) => c.publicEnemySurvived },
    { id: 'devil_listener', emoji: '😈', name: 'Deu ouvido ao mau', desc: 'Atirou em quem o Diabo mandou.', isHidden: true, check: (s, c) => c.listenedToDevil },
    { id: 'hope_last', emoji: '📉', name: 'A Esperança é a última que morre... Você não.', desc: 'Sobreviveu ao caos na 5/6, mas morreu logo em seguida.', isHidden: true, check: (s, c) => c.hopeLastDies },
    { id: 'zombie_bar', emoji: '🧟', name: 'Zumbi do Bar', desc: 'Jogou 50 ou mais, mas ganhou menos de 5.', isHidden: true, check: (s, c) => s.matches >= 50 && s.wins < 5 },
    { id: 'me_and_you', emoji: '💞', name: 'Agora sou eu e você meu gostoso!', desc: 'Quando os dois se miram e morrem.', isHidden: true, check: (s, c) => c.mutualChaosDeath }
];