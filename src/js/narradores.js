/* =====================================================
   2. CONSTANTE DE NARRADORES E NPCs ESPECIAIS (DATA_NARRADORES)
   ===================================================== */
export const DATA_NARRADORES = {
    // --- Morte: O NPC especial ---
    morte: {
        // Falas após cada "Click" ou "Pow" (falha ou sucesso do tiro no jogo normal)
        clickLines: [
            "Ainda não.", 
            "Hoje não.", 
            "Não dessa vez.", 
            "Ficou pra depois.", 
            "Por pouco, hein.",
            "Passou batido.", 
            "Quase.", 
            "Outra hora talvez.", 
            "Não agora.", 
            "Escapou."
        ],
        // Fala quando alguém morre no massacre
        massacreDeath: "Venha, eu te levo para a luz.",
        
        // Falas quando ninguém morre no massacre
        massacreNoDeath: [
            "Adiem o inevitável. Eu espero.",
            "Minha paciência é eterna.",
            "Vocês brincam com a sorte.",
            "O destino foi apenas adiado."
        ],
        
        // Fala quando o modo massacre é ativado (botão pressionado)
        massacreStart: "Vou observar de perto."
    },

    // --- Diabo: O outro NPC especial ---
    diabo: {
        intro: "Isso está ficando interessante.",
        taunts: [
            "👿 Fulano tá rindo demais… acaba com essa alegria dele.",
            "👿 Se eu fosse você, eu atirava no fulano.",
            "👿 Fulano tá muito quieto… sempre desconfie dos quietos.",
            "👿 Ouvi fulano dizendo que você não tem coragem, vai deixar?",
            "👿 Fulano tá confiante demais. Acaba logo com isso.",
            "👿 Mira no fulano para eu ver o que acontece.",
            "👿 Fulano xingou sua mãe, eu não deixava.",
            "👿 Fulano disse que ia atirar em você.",
            "👿 Fulano tá tirando onda com sua cara. Vai ficar só olhando?",
            "👿 Fulano lhe chamou de frouxo ali na mesa… eu mesmo ouvi."
        ],
        outro: "😈 É assim que eu gosto MuahahaHAHAHA...",
        results: {
            none: ["👿 Que palhaçada foi essa? Esse jogo é ridículo.", "👿 Tá de brincadeira! Ninguém?"],
            one: ["😈 Eu tenho tantos planos para você..."],
            many: ["😈 Eu adoro esse jogo hahahaha"]
        }
    },

    // --- Narradores Padrão ---
    roles: { 
        Sabio: {
            intro: "🧙‍♂️ Lembrem-se que em cada mentira há risco, e em cada risco pode faltar um gole no próximo drink.",
            playerStart: "{nome}, o destino escolheu você. Comece.",
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
        Engraçado: {
            intro: "🤭 Não vale dedo no olho nem nas partes baixas… vocês sabem bem por quê.",
            playerStart: "Bora logo, {nome}, primeiro as damas kkk!",
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
        Indiferente: {
            intro: "😒 Se alguém morrer, me avisem. Posso não estar prestando atenção.",
            playerStart: "{nome}, você começa. Acaba logo com isso.",
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
        Assustado: {
            intro: "😨 Galera, só lembrando... Aponta essa arma pra longe de mim, por favor.",
            playerStart: "{nome}, vai você primeiro... por favor.",
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
    }
};