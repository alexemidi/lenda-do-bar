import { ParteRenderizacao } from './ui/game-render.js';
import { ParteFluxo } from './ui/game-flow.js';
import { ParteConfiguracao } from './ui/config.js';
import { ParteEstatisticas } from './ui/stats.js';
import { ParteModos } from './modes/index.js';

const Aplicativo = {
    ...ParteRenderizacao,
    ...ParteFluxo,
    ...ParteConfiguracao,
    ...ParteEstatisticas,
    ...ParteModos,
};

window.Aplicativo = Aplicativo;

window.onload = () => {
    try {
        Aplicativo.inicializar();
    } catch (error) {
        console.error('Erro no Aplicativo:', error);
    }
};
