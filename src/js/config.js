import { DATA_NARRADORES } from './narradores.js';
import { DATA_PERFIS } from './personagens.js';

/* =====================================================
   3. CONSTANTE DE CONFIGURAÇÃO GERAL (CONFIG)
   ===================================================== */
export const CONFIG = {
    paths: {
        // Caminhos relativos
        img: 'src/assets/imgs/',
        snd: 'src/assets/sounds/' 
    },
    fallbackSnd: 'src/assets/sounds/',
    cards: { K: "king-hearts.png", Q: "queen-diamonds.png", A: "ace-spades.png" },
    sounds: { 
        intro: 'six-shots-left.mp3', 
        rotation: 'rotation-suspense.mp3', 
        cock: 'cocking-a-revolver.mp3', 
        shot: 'gun-shot.mp3', 
        empty: 'empty-gun.mp3' 
    },
    emojis: { 
        Marrento: "😎", Covarde: "🫣", Piadista: "😜", Entediado: "🙄", 
        Nordestino: "😠", Esfomeado: "😋", Sabio: "🧙‍♂️", Morte: "💀",
        Diabo: "😈",
        Engraçado: "🤭", Indiferente: "😒", Assustado: "😨"
    },
    
    // --- MAPEAMENTO DOS DADOS (Conectando com narradores.js) ---
    
    // Agora 'deathLines' puxa do objeto 'morte.clickLines'
    deathLines: DATA_NARRADORES.morte.clickLines, 
    
    // Expõe o objeto completo da Morte para o app usar as outras falas (massacre, start, etc)
    morte: DATA_NARRADORES.morte,                 
    
    diabo: DATA_NARRADORES.diabo,
    narradores: DATA_NARRADORES.roles,
    
    // Perfis dos jogadores
    perfis: DATA_PERFIS
};