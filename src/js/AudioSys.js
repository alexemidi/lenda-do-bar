import { CONFIG } from './config.js';

export const AudioSys = {
    cache: {}, bgm: null, initialized: false,
    init() {
        if (this.initialized) return;
        Object.keys(CONFIG.sounds).forEach(key => {
            const audio = new Audio(); audio.preload = 'auto';
            audio.src = CONFIG.paths.snd + CONFIG.sounds[key];
            this.cache[key] = audio;
            this.cache[key].__fallback = CONFIG.fallbackSnd + CONFIG.sounds[key];
        });
        this.initialized = true;
    },
    play(key, loop = false) {
        this.init();
        const base = this.cache[key];
        if (!base) return;
        const audio = new Audio();
        audio.loop = loop; audio.preload = 'auto'; audio.volume = 0.9; audio.src = base.src;
        audio.play().catch(() => { if (base.__fallback) { audio.src = base.__fallback; audio.play().catch(() => {}); } });
        try { audio.currentTime = 0; } catch (e) {}
        return audio;
    },
    playLoop(key) { this.stopLoop(); this.bgm = this.play(key, true); },
    stopLoop() { if (this.bgm) { try { this.bgm.pause(); } catch (e) {} this.bgm = null; } }
};