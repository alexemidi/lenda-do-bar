// src/js/profiles.js
// Perfis de jogadores e narradores — falas conforme código original.

export const emojiPerfil = {
  Marrento: "😎",
  Covarde: "🫣",
  Piadista: "😜",
  Entediado: "🙄",
  Raivoso: "😠",
  Esfomeado: "😋"
};

export const emojiNarrador = {
  Sabio: "🧙‍♂️",
  Piadista: "🤭",
  Entediado: "😒",
  Covarde: "😨"
};

export const perfisJogador = {
  Marrento: {
    before: [
      "Vamos ver se a sorte está do meu lado.",
      "Eu não erro, no máximo a realidade me desobedece.",
      "Olha bem, porque vocês não vão ver isso todo dia."
    ],
    afterSurvive: [
      "Sorte? Não. Hábito.",
      "Acho que a bala está com medo.",
      "Se a morte quiser me levar, vai ter que marcar horário."
    ]
  },

  Covarde: {
    before: [
      "Alguém quer ir no meu lugar?",
      "Eu devia estar em casa vendo série, não fazendo isso.",
      "Se der ruim, digam à minha mãe que eu tentei."
    ],
    afterSurvive: [
      "Se isso não me matou, o susto quase matou. 😰",
      "Eu quero um copo de água, ou de álcool, qualquer coisa.",
      "Sobrevivi, mas minha alma ficou pelo caminho."
    ]
  },

  Piadista: {
    before: [
      "Se eu morrer, pelo menos não pago a conta.",
      "Já sobrevivi a grupo de família, isso aqui é fichinha.",
      'Se eu cair, por favor coloquem "foi uma porcaria, mas era gente boa" na lápide.',
      "Essa arma aqui já viu mais mentira que WhatsApp em época de eleição.",
      "Relaxa, eu sou personagem principal, teoricamente não morro agora."
    ],
    afterSurvive: [
      "Podem respirar, o alívio cômico ainda tá vivo.",
      "Vocês esperavam o quê? Protagonista morrendo no meio do filme?",
      "Podem aplaudir, mas sem exagero, tô acostumado."
    ]
  },

  Entediado: {
    before: [
      "Tanto faz o resultado, eu tô em paz.",
      "A vida é isso: às vezes bar, às vezes bala.",
      "É só mais um capítulo, com ou sem continuação."
    ],
    afterSurvive: [
      "Pelo visto não era minha vez ainda.",
      "Só mais uma experiência pra coleção.",
      "Mais um dia emprestado do universo."
    ]
  },

  Raivoso: {
    before: [
      "Tá rindo do quê? Na próxima eu pego a MINHA arma.",
      "Eu quero ver quem tem mais coragem: eu ou esse tambor.",
      "Só de raiva, eu tô mais calmo que vocês acham."
    ],
    afterSurvive: [
      "Quem apostou contra, perdeu. E eu cobro no olhar.",
      "Continua rindo... uma hora a sorte acaba.",
      "Sobrevivi. Agora sim vocês têm motivo pra se preocupar."
    ]
  },

  Esfomeado: {
    before: [
      "Depois disso aqui, alguém traz um petisco.",
      "Isso devia valer, no mínimo, um rodízio depois.",
      "Se eu cair, dividam minha parte da porção... mas chorem um pouco antes."
    ],
    afterSurvive: [
      "A bala passou, mas a fome ficou igual.",
      "Sobrevivi. Ainda dá tempo de pedir sobremesa.",
      "Se a bala tivesse gosto de bacon, talvez eu até encarava ela."
    ]
  }
};

export const narradores = {
  Sabio: {
    intro: "Lembrem-se: em cada mentira há risco, e em cada risco pode faltar um gole no próximo brinde.",
    mesaIntro: {
      K: "Mesa de Rei: o poder é fachada, as balas não se curvam a coroas.",
      Q: "Mesa de Rainha: subestimar a realeza sempre cobra seu preço.",
      A: "Mesa de Ás: o momento em que sorte e imprudência se confundem."
    },
    killLines: {
      Esfomeado: "Até a fome cobra a conta uma hora.",
      Marrento: "A arrogância sempre encontra o próprio fim.",
      Covarde: "Fugir do risco não adiou o inevitável, só deixou mais doloroso.",
      default: "Mais uma lição escrita em chumbo para quem quiser aprender."
    },
    winner: [
      "{nome}, mentiu melhor do que todos, mas lembre-se: até a sorte cansa.",
      "Hoje o título é seu, {nome}. Só não esqueça que toda vitória tem um preço."
    ]
  },

  Piadista: {
    intro: "Não vale dedo no olho nem nas partes baixas… vocês sabem bem por quê.",
    mesaIntro: {
      K: "Mesa de Rei: Respeita a autoridade.",
      Q: "Mesa de Rainha: Cuidado! Ela é mais perigosa que a arma.",
      A: "Mesa de Ás: Modo hard ativado, meus consagrados."
    },
    killLines: {
      Piadista: "Eita! O estressadinho levou um sossega leão.",
      Raivoso: "Pelo menos agora ele não tá gritando com ninguém.",
      Marrento: "Agora o jogo tá uma bosta, a pessoa mais sexy foi embora.",
      default: "Parem de cair assim, tô ficando sem piada nova."
    },
    winner: [
      "{nome}, parabéns, mentiu tão bem que até eu quase acreditei.",
      "A mesa aplaude, {nome}. Ah não, é só o gelo batendo no copo mesmo."
    ]
  },

  Entediado: {
    intro: "Se alguém morrer, me avisem. Posso não estar prestando atenção.",
    mesaIntro: {
      K: "Mesa de Rei. Grande coisa.",
      Q: "Mesa de Rainha. Tentem não passar tanta vergonha.",
      A: "Mesa de Ás. Pelo menos muda o desenho."
    },
    killLines: {
      Piadista: "Até que enfim calou a boca.",
      Esfomeado: "No céu tem pão? E morreu... Próximo.",
      Entediado: "Pelo menos agora ele não precisa fingir interesse.",
      default: "Mais um que caiu. Nada novo."
    },
    winner: [
      "Parabéns, {nome}. Você venceu. Agora posso ir embora?",
      "{nome} ganhou. Se alguém se importar, finge que comemora."
    ]
  },

  Covarde: {
    intro: "Galera, só lembrando: aponta essa arma pra longe de mim, por favor.",
    mesaIntro: {
      K: "Mesa de Rei: Se comportem.",
      Q: "Mesa de Rainha: Tentem pelo menos não fazer nada idiota… é difícil, eu sei.",
      A: "Mesa de Ás: alguém segura minha mão? Por segurança psicológica."
    },
    killLines: {
      Covarde: "Eu sabia! Eu devia ter ido embora!",
      Raivoso: "Será que ele morreu mesmo? Ainda tá com cara de bravo.",
      Entediado: "Ele caiu tão devagar que eu achei que tava só alongando!",
      default: "Cuidado! Ele quase me acertou."
    },
    winner: [
      "Vitória do {nome}! Ótimo… agora que tal jogo da velha? É mais seguro.",
      "Parabéns do {nome}… agora vamos embora antes que alguém tente outra rodada."
    ]
  }
};
