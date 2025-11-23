// src/js/profiles.js
// Perfis de jogadores e narradores — falas conforme código original.

export const emojiPerfil = {
  Marrento: "😎",
  Covarde: "🫣",
  Piadista: "😜",
  Entediado: "🙄",
  Nordestino: "😠",
  Esfomeado: "😋"
};

export const emojiNarrador = {
  Merlin: "🧙‍♂️",
  Wade: "🤭",
  Jaiminho: "😒",
  Firmino: "😨"
};

export const perfisJogador = {
  Marrento: {
    before: [
      "Vamos ver se a sorte está do meu lado.",
      "Eu não erro, no máximo a realidade me desobedece.",
      "Confia que o pai tá on.",
      "Se a morte quer me levar, vai ter que ser na marra."
    ],
    afterSurvive: [
      "Tá vendo? Até a morte me respeita.",
      "Eu sou tão brabo que até o perigo desiste.",
      "Se era pra me assustar, precisa tentar mais forte.",
      "Eu não sobrevivo: eu humilho o perigo."
    ]
  },

  Covarde: {
    before: [
      "Alguém quer ir no meu lugar?",
      "Eu com um mal pressentimento sobre isso.",
      "Se der ruim, não fala pra minha mãe que eu me mijei… de novo.",
      "Só quero sair daqui inteiro, por favor."
    ],
    afterSurvive: [
      "Meu coração tá tipo: Se você não parar eu paro.",
      "Caramba, meu coração bateu até errado.",
      "Acho que minha alma ficou pelo caminho.",
      "Sobrevivi, mas acho que vou precisar de terapia."
    ]
  },

  Piadista: {
    before: [
      "Se eu morrer, pelo menos não pago a conta.",
      "Já sobrevivi a grupo de família, isso aqui é fichinha.",
      "Essa arma aqui já viu mais mentira que WhatsApp em época de eleição.",
      "Relaxa, eu sou personagem principal, teoricamente não morro agora.",
      "Alguém avisa o roteirista que eu tô pronto pra próxima cena?",
      "Se isso der errado, já deixei meu currículo no céu.",
  
    ],
    afterSurvive: [
      "Podem respirar, o alívio cômico ainda tá vivo.",
      "Vocês esperavam o quê? Protagonista morrendo no meio do filme?",
      "Podem aplaudir, mas sem exagero, tô acostumado.",
      "Sobrevivi de novo, tô quase virando série regular.",
      "Ufa! Já pensou perder o personagem mais engraçado?"
    ]
  },

  Entediado: {
    before: [
      "Já vivi coisa pior… tipo segunda-feira.",
      "A vida é uma fila: eu só tô esperando minha vez.",
      "É só mais um capítulo, com ou sem continuação.",
      "Se eu cair, me acordem quando acabar.",
      "Se eu morrer agora, pelo menos não pego trânsito na volta."

    ],
    afterSurvive: [
      "Pelo visto não era minha vez ainda.",
      "Ok, continuei vivo. Que tédio!",
      "Olha só… estou tentando me matar vocês erram.",
      
    ]
  },

  Nordestino: {
    before: [
      "Se for hoje, que seja ligeiro. Num tenho tempo pra frescura.",
      "Bora, desgraça! Ou vai ou racha, porra!.",
      "Eu tô virado no mói de coentro.",
      "Vamo simbora, que hoje tem risca faca."
    ],
    afterSurvive: [
      "Rapadura é doce, mas né mole não.",
      "Tá pensando que beiço de jegue é arroz doce.",
      "Sobrevivi? Eita porra… agora sim o bicho vai pegar.",
      "Oxe, essa foi por um triz!",
      "A bala olhou e disse: Seloko num compensa"
    ]
  },

  Esfomeado: {
    before: [
      "Eu tô tremendo, mas é de fome mesmo.",
      "Se eu não morrer tá me devendo uma tapioca.",
      "Se der certo, me tragam cuscuz. Se der errado… enterra com farinha.",
      "Se der ruim fala pro meu nutri que eu não vou precisar mais dele."
    ],
    afterSurvive: [
      "Sobrevivi, miseráveis. Agora quero meu pastel com caldo de cana.",
      "Tô vivo, fala que não preciso mais de nutri.",
      "Se a bala tivesse gosto de bacon, talvez eu até encarava ela.",
      "Deu bom, agora vamos comer e morar"
    ]
  }
};

export const narradores = {
  Sabio: {
    intro: "🧙‍♂️ Lembrem-se que em cada mentira há risco, e em cada risco pode faltar um gole no próximo drink.",
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
    intro: "🤭 Não vale dedo no olho nem nas partes baixas… vocês sabem bem por quê.",
    mesaIntro: {
      K: "Mesa de Rei: Respeita a autoridade.",
      Q: "Mesa de Rainha: Cuidado! Ela é mais perigosa que a arma.",
      A: "Mesa de Ás: Modo hard ativado, meus consagrados."
    },
    killLines: {
      Piadista: "Eita! O estressadinho levou um sossega leão.",
      Nordestino: "Pelo menos agora ele não tá gritando com ninguém.",
      Marrento: "Agora o jogo tá uma bosta, a pessoa mais sexy foi embora.",
      default: "Parem de cair assim, tô ficando sem piada nova."
    },
    winner: [
      "{nome}, parabéns, mentiu tão bem que até eu quase acreditei.",
      "A mesa aplaude, {nome}. Ah não, é só o gelo batendo no copo mesmo."
    ]
  },

  Entediado: {
    intro: "😒 Se alguém morrer, me avisem. Posso não estar prestando atenção.",
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
    intro: "😨 Galera, só lembrando... Aponta essa arma pra longe de mim, por favor.",
    mesaIntro: {
      K: "Mesa de Rei: Se comportem.",
      Q: "Mesa de Rainha: Tentem pelo menos não fazer nada idiota… é difícil, eu sei.",
      A: "Mesa de Ás: alguém segura minha mão? Por segurança psicológica."
    },
    killLines: {
      Covarde: "Eu sabia! Eu devia ter ido embora!",
      Nordestino: "Será que ele morreu mesmo? Ainda tá com cara de bravo.",
      Entediado: "Ele caiu tão devagar que eu achei que tava só alongando!",
      default: "Cuidado! Ele quase me acertou."
    },
    winner: [
      "Vitória do {nome}! Ótimo… agora que tal jogo da velha? É mais seguro.",
      "Parabéns do {nome}… agora vamos embora antes que alguém tente outra rodada."
    ]
  }
};
