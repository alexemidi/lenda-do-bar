// src/js/sounds.js
const soundFiles = {
  intro: "src/assets/sounds/intro-mesa.mp3",
  cock:  "src/assets/sounds/cocking-a-revolver.mp3",
  shot:  "src/assets/sounds/gun-shot.mp3",
  empty: "src/assets/sounds/empty-gun.mp3"
};

const audioMap = {};
let defaultVolume = 0.9;
let initialized = false;

export function initSounds() {
  if (initialized) return;
  Object.entries(soundFiles).forEach(([key, path]) => {
    try {
      const a = new Audio(path);
      a.preload = "auto";
      a.volume = defaultVolume;
      audioMap[key] = a;
    } catch (e) {
      console.warn(`[sounds] erro ao criar Audio(${path}):`, e);
    }
  });
  initialized = true;
  console.log("[sounds] initSounds -> carregados:", Object.keys(audioMap));
}

// toca um som pelo key: 'intro'|'cock'|'shot'|'empty'
// options: { volume, playbackRate, loop }
export function playSound(key, options = {}) {
  const s = audioMap[key];
  if (!s) {
    console.warn(`[sounds] sound key not found: "${key}"`);
    return undefined;
  }
  const audio = s.cloneNode(true);
  if (options.volume !== undefined) audio.volume = options.volume;
  if (options.playbackRate !== undefined) audio.playbackRate = options.playbackRate;
  audio.loop = !!options.loop;
  audio.play().catch(err => {
    console.warn(`[sounds] Falha ao tocar '${key}':`, err);
  });
  return audio;
}

export function setMasterVolume(v) {
  defaultVolume = v;
  Object.values(audioMap).forEach(a => a.volume = v);
}
