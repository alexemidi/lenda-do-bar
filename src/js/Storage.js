export const Storage = {
    get(key, def) { try { return JSON.parse(localStorage.getItem('mentiroso_' + key)) || def; } catch { return def; } },
    set(key, val) { localStorage.setItem('mentiroso_' + key, JSON.stringify(val)); }
};
