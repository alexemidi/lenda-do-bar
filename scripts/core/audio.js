import { CONFIGURACAO } from './config.js';

export const SistemaAudio = {
    cache: {},
    musicaFundo: null,
    inicializado: false,
    inicializar() {
        if (this.inicializado) return;
        Object.keys(CONFIGURACAO.sons).forEach((chave) => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = CONFIGURACAO.caminhos.som + CONFIGURACAO.sons[chave];
            audio.onerror = () => {
                if (CONFIGURACAO.somReserva)
                    audio.src =
                        CONFIGURACAO.somReserva + CONFIGURACAO.sons[chave];
            };
            this.cache[chave] = audio;
        });
        this.inicializado = true;
    },
    tocar(chave, repetir = false) {
        this.inicializar();
        const base = this.cache[chave];
        if (!base) return;
        const audio = new Audio();
        audio.loop = repetir;
        audio.preload = 'auto';
        audio.volume = 0.9;
        audio.src = base.src;
        audio.play().catch(() => {
            if (base.__fallback) {
                audio.src = base.__fallback;
                audio.play().catch(() => { });
            }
        });
        try {
            audio.currentTime = 0;
        } catch (e) { }
        return audio;
    },
    tocarRepetir(chave) {
        this.pararRepetir();
        this.musicaFundo = this.tocar(chave, true);
    },
    pararRepetir() {
        if (this.musicaFundo) {
            try {
                this.musicaFundo.pause();
            } catch (e) { }
            this.musicaFundo = null;
        }
    },
};
