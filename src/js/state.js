import { Storage } from './Storage.js';

// Tenta carregar a config salva. Se não existir, o padrão é tudo desligado (false).
const savedConfig = Storage.get('config', { massacre: false, chaos: false });

export let STATE = {
    slots: Storage.get('slots', Array(6).fill(null)),
    db: Storage.get('db', []),
    stats: Storage.get('stats', {}),
    achieved: Storage.get('achieved', {}),
    game: { 
        active: false, 
        players: [], 
        turnIndex: 0, 
        mesaCard: 'A', 
        mesaShots: 0, 
        narrator: null, 
        isShooting: false, 
        isMassacre: false, 
        protectedIdx: null, 
        lastProtectedIdx: null, 
        roundUnlocks: [], 
        deathLinesDeck: [], 
        deathLineIdx: 0, 
        
        // AQUI ESTÁ A MUDANÇA: Usa o que foi carregado
        massacreMode: savedConfig.massacre, 
        chaosMode: savedConfig.chaos,
        
        chaos: { active: false, queue: [], currentPickIdx: 0, targets: {}, votes: {}, devilTarget: null }
    }
};