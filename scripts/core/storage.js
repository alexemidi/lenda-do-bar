export const Armazenamento = {
    obter(chave, padrao) {
        try {
            const val = localStorage.getItem('mentiroso_' + chave);
            return val ? JSON.parse(val) : padrao;
        } catch {
            return padrao;
        }
    },
    definir(chave, valor) {
        localStorage.setItem('mentiroso_' + chave, JSON.stringify(valor));
    },
};
