import { CONFIG } from './config.js';
import { STATE } from './state.js';
import { ACHIEVEMENTS_DEF } from './conquistas.js';
import { View } from './view.js';
import { Storage } from './Storage.js'; 

export const Logic = {
    getNarrator() {
        const keys = Object.keys(CONFIG.narradores);
        return keys[Math.floor(Math.random() * keys.length)];
    },
    createPlayer(name, perfilFixo) {
        return { name, perfil: perfilFixo, alive: true, shotsTaken: 0, gun: { chamber: 0, bullet: Math.floor(Math.random() * 6) }, lines: { before: 0, afterSurvive: 0 } };
    },
    rotateTable(forceNext = false) {
        const order = ['K','Q','A']; 
        if (forceNext || STATE.game.mesaShots >= 3) {
            let idx = order.indexOf(STATE.game.mesaCard);
            if(idx === -1) idx = 0;
            STATE.game.mesaCard = order[(idx + 1) % order.length];
            STATE.game.mesaShots = 0;
            return true;
        }
        return false;
    },
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    checkAchievements(pName, events, notify = true) {
        if (!pName) return;
        
        if (!STATE.stats[pName]) {
            STATE.stats[pName] = { wins:0, hits:0, dodges:0, matches: 0, _meta: {} };
        }
        if (!STATE.stats[pName]._meta) {
            STATE.stats[pName]._meta = {};
        }

        const stats = STATE.stats[pName];
        if (!STATE.achieved[pName]) STATE.achieved[pName] = [];
        
        ACHIEVEMENTS_DEF.forEach(ach => {
            if (!STATE.achieved[pName].includes(ach.id)) {
                if (ach.check(stats, events)) {
                    STATE.achieved[pName].push(ach.id);
                    if (notify) View.showToast(pName, ach);
                    else STATE.game.roundUnlocks.push(ach.id);
                }
            }
        });
        Storage.set('stats', STATE.stats);
        Storage.set('achieved', STATE.achieved);
    }
};