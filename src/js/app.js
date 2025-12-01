import { STATE } from './state.js';
import { Storage } from './Storage.js';
import { View } from './view.js';
import { Logic } from './logic.js';
import { AudioSys } from './AudioSys.js';
import { CONFIG } from './config.js';
import { ACHIEVEMENTS_DEF } from './conquistas.js';

export const App = {
    currentSlot: null,
    duelMode: false, 

    // --- FUNÇÃO AUXILIAR DE STATUS ---
    updateStatus(emoji, text) {
        const gs = document.getElementById('game-status');
        if (!gs) return;
        
        if (!emoji && !text) {
            gs.innerHTML = '';
            return;
        }

        gs.innerHTML = `
            <div class="status-emoji-area">${emoji}</div>
            <div class="status-text-area">${text}</div>
        `;
    },

    saveConfig() {
        Storage.set('config', {
            massacre: STATE.game.massacreMode,
            chaos: STATE.game.chaosMode
        });
    },

    init() {
        this.renderSetup();
        if (!STATE.slots || STATE.slots.length === 0) {
            STATE.slots = [null,null,null,null,null,null];
        } else if (STATE.slots.filter(Boolean).length === 0) {
            STATE.slots = [null,null,null,null,null,null];
        }
        
        if (!localStorage.getItem('mentiroso_visited')) {
            View.showModal("BEM-VINDO!", "Como é sua primeira vez, recomendamos ler as regras antes de começar.", [
                { text: "LER REGRAS", class: "primary", action: () => { View.closeModal(); App.goTo('rules'); localStorage.setItem('mentiroso_visited', 'true'); } },
                { text: "JÁ SEI JOGAR", class: "secondary", action: () => { View.closeModal(); localStorage.setItem('mentiroso_visited', 'true'); } }
            ]);
        }
    },
    goTo(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById('screen-' + screenId);
        if(target) target.classList.add('active');
        if (screenId === 'stats') this.renderStats();
    },
    exitRules() {
        if (STATE.game && STATE.game.active) this.goTo('game');
        else this.goTo('start');
    },

    toggleMassacreConfig() {
        const sw = document.getElementById('massacre-toggle');
        const chaosSw = document.getElementById('chaos-toggle');
        const count = STATE.slots.filter(Boolean).length;

        STATE.game.massacreMode = sw.checked;

        if (count >= 6) {
            if (!STATE.game.massacreMode && !STATE.game.chaosMode) {
                STATE.game.chaosMode = true;
                chaosSw.checked = true;
            }
        } else if (count <= 4) {
            if (STATE.game.massacreMode && STATE.game.chaosMode) {
                STATE.game.chaosMode = false;
                chaosSw.checked = false;
            }
        }

        this.saveConfig();
        this.renderSetup(); 
        
        if (STATE.game.massacreMode) {
            const t = document.getElementById('systemToast');
            t.textContent = "O Valete entrou na festa. Dancem 🔥";
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 1500);
        }
    },
    toggleChaosConfig() {
        const sw = document.getElementById('chaos-toggle');
        const massSw = document.getElementById('massacre-toggle');
        const count = STATE.slots.filter(Boolean).length;

        STATE.game.chaosMode = sw.checked;

        if (count >= 6) {
            if (!STATE.game.chaosMode && !STATE.game.massacreMode) {
                STATE.game.massacreMode = true;
                massSw.checked = true;
            }
        } else if (count <= 4) {
            if (STATE.game.chaosMode && STATE.game.massacreMode) {
                STATE.game.massacreMode = false;
                massSw.checked = false;
            }
        }

        this.saveConfig();
        this.renderSetup(); 
        
        if (STATE.game.chaosMode) {
            const t = document.getElementById('systemToast');
            t.textContent = "O Caos está liberado 😈";
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 1500);
        }
    },

    renderSetup() {
        const container = document.getElementById('slots-container');
        if(!container) return;
        container.innerHTML = '';
        
        const currentSlots = STATE.slots || [null,null,null,null,null,null];
        const filled = currentSlots.filter(Boolean).length;
        
        const massacreSwitch = document.getElementById('massacre-toggle');
        const chaosSwitch = document.getElementById('chaos-toggle');
        
        if(massacreSwitch) massacreSwitch.checked = STATE.game.massacreMode;
        if(chaosSwitch) chaosSwitch.checked = STATE.game.chaosMode;

        if (filled >= 6 && !STATE.game.massacreMode && !STATE.game.chaosMode) {
            STATE.game.massacreMode = true; 
            if(massacreSwitch) massacreSwitch.checked = true;
            this.saveConfig();
        }

        const slotsToShow = Math.min(6, Math.max(2, filled + 1));
        for (let i=0;i<slotsToShow;i++) {
            const name = currentSlots[i];
            const div = document.createElement('div');
            div.className = 'slot-row';
            if (!name) {
                div.innerHTML = `<span class="slot-name" style="opacity:0.5; font-style:italic">Vazio...</span>
                                 <button class="western-btn secondary small" onclick="App.openSelect(${i})">Selecionar</button>`;
            } else {
                div.innerHTML = `<span class="slot-name">${name}</span>
                                 <div style="display:flex; gap:4px;">
                                     <button class="tiny-btn bg-blue" onclick="App.moveSlot(${i}, -1)" style="${i === 0 ? 'visibility:hidden' : ''}">▲</button>
                                     <button class="tiny-btn bg-blue" onclick="App.moveSlot(${i}, 1)" style="${i >= filled-1 ? 'visibility:hidden' : ''}">▼</button>
                                     <button class="tiny-btn bg-red" onclick="App.clearSlot(${i})">X</button>
                                 </div>`;
            }
            container.appendChild(div);
        }
        const btnStart = document.getElementById('btn-start-match');
        if(btnStart) btnStart.disabled = filled < 2;
        
        Storage.set('slots', currentSlots);
    },
    moveSlot(idx, dir) {
        if (!STATE.slots) return;
        const targetIdx = idx + dir;
        if (targetIdx < 0 || targetIdx >= STATE.slots.length) return;

        const tmp = STATE.slots[idx];
        STATE.slots[idx] = STATE.slots[targetIdx]; 
        STATE.slots[targetIdx] = tmp;
        
        const compact = STATE.slots.filter(Boolean);
        STATE.slots = compact.concat(Array(6-compact.length).fill(null));
        this.renderSetup();
    },
    clearSlot(idx) {
        if (!STATE.slots) return;
        STATE.slots[idx] = null;
        const compact = STATE.slots.filter(Boolean);
        STATE.slots = compact.concat(Array(6-compact.length).fill(null));
        this.renderSetup();
    },
    renderDBList() {
        const dbList = document.getElementById('db-list'); 
        if(!dbList) return;
        dbList.innerHTML = '';
        
        const used = STATE.slots ? STATE.slots.filter(Boolean) : [];
        const avail = STATE.db.filter(n => !used.includes(n));
        
        if (avail.length === 0) dbList.innerHTML = '<p style="text-align:center; opacity:0.6">Nenhum salvo.</p>';
        
        avail.forEach(pName => {
            const row = document.createElement('div'); row.className = 'db-row';
            const nameBtn = document.createElement('button'); nameBtn.className = 'db-name-btn';
            nameBtn.textContent = pName;
            nameBtn.onclick = () => { STATE.slots[this.currentSlot] = pName; this.goTo('setup'); this.renderSetup(); };
            
            const delBtn = document.createElement('button'); delBtn.className = 'db-remove-btn'; delBtn.textContent = 'EXPULSAR';
            delBtn.onclick = () => this.confirmDeletePlayer(pName);
            
            row.appendChild(nameBtn); row.appendChild(delBtn); dbList.appendChild(row);
        });
    },
    openSelect(idx) {
        this.currentSlot = idx;
        this.renderDBList();
        this.goTo('database');
    },
    addNewPlayerDB() {
        const input = document.getElementById('new-player-input');
        const val = input.value.trim();
        
        if(!STATE.slots) STATE.slots = [null,null,null,null,null,null];

        if (STATE.slots.includes(val)) {
            View.showModal("JÁ ESTÁ NA MESA!", `O jogador "${val}" já foi selecionado.`, [ { text: "Ops, foi mal", class: "primary", action: () => View.closeModal() } ]);
            return;
        }
        if (val && !STATE.db.includes(val)) {
            STATE.db.push(val); 
            Storage.set('db', STATE.db); 
            
            if (!STATE.stats[val]) {
                STATE.stats[val] = { wins:0, hits:0, dodges:0, matches: 0, _meta: { winStreak: 0, dieStreak: 0 } };
                Storage.set('stats', STATE.stats);
            }

            input.value = '';
            STATE.slots[this.currentSlot] = val;
            this.goTo('setup');
            this.renderSetup();
        }
    },
    confirmOrder() {
        const players = STATE.slots.filter(Boolean);
        if (players.length === 2) this.showLoading();
        else {
            View.showModal("A ORDEM ESTÁ CORRETA?", "Sentido anti-horário é para a direita 😒", [
                { text: "SIM, BORA!", class: "primary", action: () => this.showLoading() },
                { text: "NÃO, PERA", class: "secondary", action: () => View.closeModal() }
            ]);
        }
    },
    showLoading() {
        View.closeModal(); this.goTo('loading');
        const count = STATE.slots.filter(Boolean).length;
        const isM = STATE.game.massacreMode;
        const isC = STATE.game.chaosMode;
        let info = "";

        if (count <= 4) {
            const base = "<b>6</b> Reis, <b>6</b> Damas, <b>6</b> Ases";
            if (isM) info = `${base}, <b>1</b> Coringa e <b>1</b> Valete.`;
            else if (isC) info = `${base}, <b>1</b> Coringa e <b>1</b> Carta 8.`;
            else info = `${base} e <b>2</b> Coringas.`;
        } 
        else if (count === 5) {
            const base = "<b>7</b> Reis, <b>7</b> Damas, <b>7</b> Ases";
            if (isM && isC) info = `${base}, <b>1</b> Coringa, <b>1</b> Valete e <b>1</b> Carta 8.`;
            else if (isM) info = `${base}, <b>2</b> Coringas e <b>1</b> Valete.`;
            else if (isC) info = `${base}, <b>2</b> Coringas e <b>1</b> Carta 8.`;
            else info = `${base} e <b>3</b> Coringas.`;
        } 
        else {
            const base = "<b>8</b> Reis, <b>8</b> Damas, <b>8</b> Ases";
            if (isM && isC) info = `${base}, <b>2</b> Coringas, <b>1</b> Valete e <b>1</b> Carta 8.`;
            else if (isM) info = `${base}, <b>2</b> Coringas e <b>2</b> Valetes.`;
            else if (isC) info = `${base}, <b>2</b> Coringas e <b>2</b> Cartas 8.`;
            else info = `${base} e <b>4</b> Coringas.`;
        }

        const deckInfo = document.getElementById('deck-config-info');
        if(deckInfo) deckInfo.innerHTML = info;
        
        setTimeout(() => { this.startIntro(); }, 4000);
    },
    startIntro() {
        const playersNames = STATE.slots.filter(Boolean);
        STATE.game.active = true; STATE.game.isShooting = false; STATE.game.isMassacre = false;
        STATE.game.protectedIdx = null; STATE.game.lastProtectedIdx = null; STATE.game.roundUnlocks = [];
        STATE.game.chaos = { active: false, queue: [], currentPickIdx: 0, targets: {}, votes: {}, devilTarget: null };

        const perfisDisponiveis = Object.keys(CONFIG.perfis);
        for (let i = perfisDisponiveis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [perfisDisponiveis[i], perfisDisponiveis[j]] = [perfisDisponiveis[j], perfisDisponiveis[i]];
        }
        STATE.game.players = playersNames.map((name, idx) => Logic.createPlayer(name, perfisDisponiveis[idx % perfisDisponiveis.length]));
        STATE.game.turnIndex = Math.floor(Math.random() * playersNames.length);
        STATE.game.narrator = Logic.getNarrator();
        STATE.game.mesaCard = ['K','Q','A'][Math.floor(Math.random()*3)];
        STATE.game.mesaShots = 0;
        
        STATE.game.deathLinesDeck = [...CONFIG.morte.clickLines];
        Logic.shuffle(STATE.game.deathLinesDeck);
        STATE.game.deathLineIdx = 0;
        this.runRotationAnim(true);
    },
    runRotationAnim(isIntro = false) {
        this.goTo('rotation');
        if (isIntro) {
            AudioSys.play('intro'); 
        } else {
            AudioSys.play('rotation'); 
        }
        
        const cardFace = document.getElementById('rot-card-front');
        const imgName = CONFIG.cards[STATE.game.mesaCard] || 'card-back.png';
        if(cardFace) cardFace.style.backgroundImage = `url('${CONFIG.paths.img}${imgName}')`;
        
        const narratorElm = document.getElementById('rot-narrator');
        if(narratorElm) {
            if (isIntro) {
                narratorElm.textContent = CONFIG.narradores[STATE.game.narrator].intro;
                document.getElementById('rot-title').textContent = "A CARTA DA MESA É...";
            } else {
                const mesaLine = (CONFIG.narradores[STATE.game.narrator].mesaIntro || {})[STATE.game.mesaCard] || '';
                const narrEmoji = CONFIG.emojis[STATE.game.narrator] || '💀';
                narratorElm.textContent = `${narrEmoji} ${mesaLine}`;
            }
        }
        const flipper = document.getElementById('card-flipper');
        if(flipper) {
            flipper.classList.remove('flip-anim'); 
            void flipper.offsetWidth; 
            flipper.classList.add('flip-anim');
            setTimeout(() => { flipper.style.transform = 'rotateY(540deg)'; this.startGameScreen(); }, 6000);
        }
    },

    startGameScreen() {
        STATE.game.isShooting = false; 
        STATE.game.isMassacre = false; 
        this.duelMode = false;
        STATE.game.chaos.active = false;
        
        this.goTo('game'); 
        this.updateGameUI(); 
        
        const logBox = document.getElementById('game-log'); 
        if(logBox) logBox.innerHTML = '';

        // --- CORREÇÃO 1: BOTÕES DESABILITADOS (CINZA) INICIALMENTE ---
        const btnChaos = document.getElementById('btn-chaos-toggle');
        const btnDuel = document.getElementById('btn-duel-toggle');
        if(btnChaos) btnChaos.disabled = true;
        if(btnDuel) btnDuel.disabled = true;
        // -------------------------------------------------------------
        
        const narr = CONFIG.narradores[STATE.game.narrator];
        const narrEmoji = CONFIG.emojis[STATE.game.narrator] || '💀';
        
        const mesaLine = (narr.mesaIntro || {})[STATE.game.mesaCard] || '';
        this.updateStatus(narrEmoji, mesaLine);
        
        this.log(narr.intro);
        this.log(`${narrEmoji} ${mesaLine}`);
        
        const pName = STATE.game.players[STATE.game.turnIndex].name;

        setTimeout(() => {
            const startPhrase = narr.playerStart 
                ? narr.playerStart.replace('{nome}', pName) 
                : `${pName}, você começa.`;
            
            this.updateStatus(narrEmoji, startPhrase);
            this.log(`🎲 ${startPhrase}`);
            
            const starterInfo = document.getElementById('starter-info');
            if(starterInfo) starterInfo.innerHTML = `★ <b>${pName}</b>, é com você.`;

            setTimeout(() => {
                this.updateStatus(null, null); 
                
                // --- CORREÇÃO 1: REATIVAR BOTÕES ---
                if(btnChaos) btnChaos.disabled = false;
                if(btnDuel) btnDuel.disabled = false;
                // -----------------------------------
            }, 2500);
            
        }, 2500);
    },

    toggleDuelMode() {
        if (STATE.game.isShooting || STATE.game.chaos.active) return;
        this.duelMode = !this.duelMode;
        this.renderPlayersList();
    },
    
    toggleChaosMode() {
        if (STATE.game.isShooting || STATE.game.chaos.active) return;
        STATE.game.chaos.active = true;
        STATE.game.isShooting = true; 
        this.duelMode = false;

        STATE.game.chaos.targets = {};
        STATE.game.chaos.votes = {};
        STATE.game.chaos.devilTarget = null;
        
        const players = STATE.game.players;
        let queue = [];
        let startIdx = STATE.game.turnIndex;
        for (let i = 0; i < players.length; i++) {
            let idx = (startIdx + i) % players.length;
            if (players[idx].alive) queue.push(idx);
        }
        STATE.game.chaos.queue = queue;
        STATE.game.chaos.currentPickIdx = 0; 

        this.renderPlayersList();
        
        const devilIntro = CONFIG.diabo.intro;
        this.updateStatus("😈", devilIntro);
        this.log(`😈 ${devilIntro}`);

        setTimeout(() => {
            this.nextChaosPicker();
        }, 2000);
    },

    nextChaosPicker() {
        const queue = STATE.game.chaos.queue;
        const currentQueueIdx = STATE.game.chaos.currentPickIdx;
        if (currentQueueIdx >= queue.length) {
            this.resolveChaos();
            return;
        }
        const pickerIdx = queue[currentQueueIdx];
        const pickerName = STATE.game.players[pickerIdx].name;
        const starterInfo = document.getElementById('starter-info');
        if(starterInfo) starterInfo.innerHTML = `<span style="color:var(--chaos-light); text-shadow:0 0 5px var(--chaos)">★ <b>${pickerName}</b> escolha alguém para testar a sorte</span>`;
        
        const targets = STATE.game.players.filter((p, i) => p.alive && i !== pickerIdx);
        const randomTarget = targets[Math.floor(Math.random() * targets.length)];
        
        STATE.game.chaos.devilTarget = randomTarget ? STATE.game.players.indexOf(randomTarget) : null;
        const taunts = CONFIG.diabo.taunts;
        let taunt = taunts[Math.floor(Math.random() * taunts.length)];
        taunt = taunt.replace(/fulano/gi, randomTarget ? randomTarget.name : 'alguém');
        
        const cleanTaunt = taunt.replace(/👿|😈/g, '').trim();
        this.updateStatus("👿", cleanTaunt);

        this.renderPlayersList();
    },
    handleChaosPick(targetIdx) {
        const queue = STATE.game.chaos.queue;
        const pickerRealIdx = queue[STATE.game.chaos.currentPickIdx];
        STATE.game.chaos.targets[pickerRealIdx] = targetIdx;
        STATE.game.chaos.votes[targetIdx] = (STATE.game.chaos.votes[targetIdx] || 0) + 1;
        STATE.game.chaos.currentPickIdx++;
        this.nextChaosPicker();
    },

    resolveChaos() {
        const starterInfo = document.getElementById('starter-info');
        if(starterInfo) starterInfo.innerHTML = "";
        
        const rawMsg = CONFIG.diabo.outro;
        const devilMsg = rawMsg.replace(/👿|😈/g, '').trim();

        this.updateStatus("😈", devilMsg);
        this.log(rawMsg);
        this.renderPlayersList();

        setTimeout(() => {
            const players = STATE.game.players;
            const shooters = STATE.game.chaos.queue;
            
            shooters.forEach((sIdx, i) => {
                setTimeout(() => AudioSys.play('cock'), i * 100);
            });

            setTimeout(() => {
                let anyBang = false;
                shooters.forEach(sIdx => {
                    const s = players[sIdx];
                    if (s.gun.chamber === s.gun.bullet) anyBang = true;
                });
                
                AudioSys.play(anyBang ? 'shot' : 'empty');

                if (anyBang) {
                    document.body.classList.add('shake-screen');
                    setTimeout(() => document.body.classList.remove('shake-screen'), 500);
                }

                let deaths = [];
                
                shooters.forEach(shooterIdx => {
                    const shooter = players[shooterIdx];
                    const isBang = (shooter.gun.chamber === shooter.gun.bullet);
                    const targetIdx = STATE.game.chaos.targets[shooterIdx];
                    
                    if (targetIdx === STATE.game.chaos.devilTarget) {
                        Logic.checkAchievements(shooter.name, { listenedToDevil: true }, true);
                    }
                    if (isBang && shooter.gun.chamber >= 4) {
                        Logic.checkAchievements(shooter.name, { chaosLuckHit: true }, true);
                    }

                    if (isBang) {
                        shooter.gun.chamber = 0;
                        shooter.shotsTaken = 0; 
                        shooter.gun.bullet = Math.floor(Math.random() * 6); 

                        const target = players[targetIdx];
                        if (target.alive && !deaths.includes(target)) {
                            deaths.push(target);
                        }
                        const bIdx = targetIdx;
                        if (STATE.game.chaos.targets[bIdx] === shooterIdx) {
                            const shooterB = players[bIdx];
                            if (shooterB.gun.chamber === shooterB.gun.bullet) {
                                Logic.checkAchievements(shooter.name, { mutualChaosDeath: true }, false);
                                Logic.checkAchievements(target.name, { mutualChaosDeath: true }, false);
                            }
                        }
                    } else {
                        shooter.gun.chamber++;
                        shooter.shotsTaken++;
                    }
                });

                deaths.forEach(d => {
                    d.alive = false;
                    if (!STATE.stats[d.name]) STATE.stats[d.name] = { wins:0, hits:0, dodges:0 };
                    STATE.stats[d.name].hits++;
                    STATE.stats[d.name]._meta = { ...STATE.stats[d.name]._meta, dieStreak: (STATE.stats[d.name]._meta?.dieStreak || 0) + 1, winStreak: 0 };
                    Logic.checkAchievements(d.name, { diedOnShot: d.shotsTaken }, true); 
                });

                Object.keys(STATE.game.chaos.votes).forEach(tIdxStr => {
                    const tIdx = parseInt(tIdxStr);
                    const p = players[tIdx];
                    if (p.alive && STATE.game.chaos.votes[tIdx] >= 3) {
                        Logic.checkAchievements(p.name, { publicEnemySurvived: true }, true);
                    }
                });
                
                STATE.game.mesaShots++;
                this.renderPlayersList();
                
                let resultMsg = "";
                const rConf = CONFIG.diabo.results;
                if (deaths.length === 0) {
                    resultMsg = rConf.none[Math.floor(Math.random() * rConf.none.length)];
                }
                else if (deaths.length < 3) resultMsg = rConf.one[0];
                else resultMsg = rConf.many[0];

                const cleanResult = resultMsg.replace(/👿|😈/g, '').trim();
                this.updateStatus("😈", cleanResult);

                this.log(resultMsg);
                if (deaths.length > 0) this.log(`💀 Mortos no Caos: ${deaths.map(d=>d.name).join(', ')}`);

                setTimeout(() => {
                    STATE.game.chaos.active = false;
                    STATE.game.isShooting = false;
                    STATE.game.chaos.votes = {};

                    const alive = players.filter(p => p.alive);
                    if (alive.length <= 1) {
                         this.checkGameFlow(0); 
                    } else {
                        const nextStart = alive[Math.floor(Math.random() * alive.length)];
                        STATE.game.turnIndex = players.indexOf(nextStart);
                        this.updateGameUI();
                        this.log(`🎲 O destino escolheu ${nextStart.name} para recomeçar.`);
                    }
                }, 4000);

            }, 1000 + (shooters.length * 100));

        }, 2000); 
    },

    triggerMassacre(protectedIdx) {
        if (STATE.game.isShooting) return;
        STATE.game.isShooting = true; STATE.game.isMassacre = true; STATE.game.protectedIdx = protectedIdx;
        this.duelMode = false; 
        const players = STATE.game.players;
        this.renderPlayersList();
        
        // --- FRASE QUANDO ATIVA O MODO ---
        this.updateStatus("💀", CONFIG.morte.massacreStart);
        this.log(`☠️ Morte: ${CONFIG.morte.massacreStart}`);
        
        // 1. DELAY INICIAL (300ms)
        setTimeout(() => { 
            AudioSys.play('cock'); 

            // 2. TEMPO DE TENSÃO (3.5 segundos)
            setTimeout(() => {
                const targets = players.filter((p, i) => i !== protectedIdx && p.alive);
                let victims = [];
                let survivors = [];

                // --- CORREÇÃO 4: ATUALIZAR CONTADORES IMEDIATAMENTE ---
                targets.forEach(p => {
                    const isDeath = p.gun.chamber === p.gun.bullet;
                    p.shotsTaken++; // Sobe contador agora

                    // Atualiza DOM manual
                    const pIndex = players.indexOf(p);
                    const pDiv = document.getElementById('game-players-list').children[pIndex];
                    if(pDiv) {
                        const counterDiv = pDiv.children[1].children[0];
                        if(counterDiv) counterDiv.textContent = `${p.shotsTaken}/6`;
                    }
                    
                    if (isDeath) victims.push(p);
                    else {
                        p.gun.chamber++;
                        survivors.push(p);
                    }
                });

                const hasDeath = victims.length > 0;

                // --- CENÁRIO A: MORTE ---
                if (hasDeath) {
                    AudioSys.play('empty'); // Som do click dos sobreviventes
                    this.updateStatus("💨", "CLICK!");
                    
                    setTimeout(() => {
                        // --- CORREÇÃO 2: EFEITOS IMEDIATOS (Som + Caveira) ---
                        AudioSys.play('shot');
                        this.updateStatus("💥", "POW!");
                        document.body.classList.add('shake-screen');
                        setTimeout(() => document.body.classList.remove('shake-screen'), 500);

                        // Caveira imediata via DOM
                        victims.forEach(v => {
                            const vIndex = players.indexOf(v);
                            const vDiv = document.getElementById('game-players-list').children[vIndex];
                            if(vDiv) {
                                const emojiSpan = vDiv.querySelector('.emoji-big');
                                if(emojiSpan) emojiSpan.textContent = '💀';
                            }
                        });

                        // 3. DELAY DE 1 SEGUNDO PARA RISCAR O NOME
                        setTimeout(() => {
                            victims.forEach(p => {
                                p.alive = false; 
                                if (!STATE.stats[p.name]) STATE.stats[p.name] = { wins:0, hits:0, dodges:0 };
                                STATE.stats[p.name].hits++;
                                STATE.stats[p.name]._meta = { ...STATE.stats[p.name]._meta, dieStreak: (STATE.stats[p.name]._meta?.dieStreak || 0) + 1, winStreak: 0 };
                                Logic.checkAchievements(p.name, { diedOnShot: p.shotsTaken }, true);
                            });

                            survivors.forEach(p => {
                                if (p.gun.chamber === 6) Logic.checkAchievements(p.name, { chaosSurvivor: true }, true); // Checa se era 5 antes (virou 6)
                                if (!STATE.stats[p.name]) STATE.stats[p.name] = { wins:0, hits:0, dodges:0 };
                                STATE.stats[p.name].dodges++;
                                if (p.gun.chamber > 5) p.gun.chamber = 0; // Reseta tambor
                            });

                            this.renderPlayersList(); // Agora renderiza com vermelho/riscado
                            this.finishMassacre(victims.length, victims);

                        }, 1000); 

                    }, 1000); 

                } 
                // --- CENÁRIO B: SOBREVIVÊNCIA ---
                else {
                    AudioSys.play('empty');
                    this.updateStatus("💨", "CLICK!");

                    setTimeout(() => {
                        survivors.forEach(p => {
                            if (p.gun.chamber === 6) Logic.checkAchievements(p.name, { chaosSurvivor: true }, true);
                            
                            if (!STATE.stats[p.name]) STATE.stats[p.name] = { wins:0, hits:0, dodges:0 };
                            STATE.stats[p.name].dodges++;
                            if (p.gun.chamber > 5) p.gun.chamber = 0;
                        });

                        this.renderPlayersList();
                        this.finishMassacre(0, []);
                    }, 1000); 
                }

            }, 3500); 

        }, 300); 
    },

    finishMassacre(deathCount, victims) {
        const players = STATE.game.players;
        
        setTimeout(() => {
            STATE.game.mesaShots++;
            if (deathCount >= 3) {
                const protectedP = players[STATE.game.protectedIdx];
                if (protectedP && protectedP.alive) Logic.checkAchievements(protectedP.name, { isMassacre: true, massacreDeaths: deathCount }, true);
            }
            
            STATE.game.lastProtectedIdx = STATE.game.protectedIdx; 
            STATE.game.isMassacre = false; 
            STATE.game.protectedIdx = null;
            this.renderPlayersList();

            let msg = "";
            let emoji = "☠️";

            // --- CORREÇÃO 3: NOVAS FRASES DA MORTE ---
            if (deathCount === 0) {
                const lines = CONFIG.morte.massacreNoDeath; 
                msg = lines[Math.floor(Math.random() * lines.length)];
            }
            else if (deathCount === 1) { 
                const victimName = victims[0].name;
                msg = `Venha, ${victimName}, eu te levo para a luz.`; 
                this.log(`☠️ ${victimName} foi de arrasta!`); 
            }
            else {
                const protectedPlayerName = players[STATE.game.lastProtectedIdx].name;
                msg = `Obrigado, ${protectedPlayerName}! Adiar sua vez é o seu prêmio.`;
                this.log(`☠️ Massacre! Mortos: ${victims.map(v=>v.name).join(', ')}`);
            }
            // ----------------------------------------
            
            this.updateStatus(emoji, msg);

            let nextTurn = (STATE.game.lastProtectedIdx + 2) % players.length;
            setTimeout(() => {
                const aliveCount = players.filter(p => p.alive).length;
                if (aliveCount <= 1) this.checkGameFlow(STATE.game.lastProtectedIdx);
                else {
                    while (!players[nextTurn].alive) nextTurn = (nextTurn + 1) % players.length;
                    STATE.game.turnIndex = nextTurn; STATE.game.isShooting = false;
                    if (Logic.rotateTable()) this.runRotationAnim(false); else this.updateGameUI();
                }
            }, 3000);

        }, 1500);
    },

    handleShoot(pIndex) {
        if (this.duelMode) { this.triggerMassacre(pIndex); return; }
        if (STATE.game.isShooting) return;
        STATE.game.isShooting = true;
        this.renderPlayersList();

        const p = STATE.game.players[pIndex];
        const frases = CONFIG.perfis[p.perfil];
        const fraseBefore = frases.before[p.lines.before++ % frases.before.length];
        const emoji = CONFIG.emojis[p.perfil] || '';

        this.updateStatus(emoji, fraseBefore);
        this.log(`${emoji} ${p.name}: ${fraseBefore}`);

        setTimeout(() => {
            AudioSys.play('cock'); 
            
            setTimeout(() => {
                // --- CORREÇÃO 2 e 4: FEEDBACK IMEDIATO (Contador + Caveira) ---
                
                // 1. Calcula lógica
                const isDeath = p.gun.chamber === p.gun.bullet;
                
                // 2. Atualiza dados e HTML do contador AGORA
                p.shotsTaken++;
                if (!isDeath) p.gun.chamber++; // Gira se vivo

                const playerDiv = document.getElementById('game-players-list').children[pIndex];
                if(playerDiv) {
                    // Estrutura esperada: DivPlayer -> DivRight -> CounterDiv
                    const counterDiv = playerDiv.children[1].children[0]; 
                    if(counterDiv) counterDiv.textContent = `${p.shotsTaken}/6`;
                }

                if (isDeath) {
                    AudioSys.play('shot');
                    this.updateStatus("💥", "POW!");
                    document.body.classList.add('shake-screen');
                    setTimeout(() => document.body.classList.remove('shake-screen'), 500);
                    
                    // Caveira imediata
                    if(playerDiv) {
                        const emojiSpan = playerDiv.querySelector('.emoji-big');
                        if(emojiSpan) emojiSpan.textContent = '💀';
                    }
                } else {
                    this.updateStatus("💨", "CLICK!");
                    AudioSys.play('empty');
                }
                
                // 3. DELAY DE 1 SEGUNDO APENAS PARA O RISCO VERMELHO
                setTimeout(() => {
                    STATE.game.mesaShots++;
                    // Renderiza visualmente a lista completa (para resetar estilos ou aplicar o morto)
                    
                    if (isDeath) {
                        p.alive = false; 
                        this.renderPlayersList(); // Aplica classe .dead

                        const narrConf = CONFIG.narradores[STATE.game.narrator];
                        const killByPerfil = (narrConf.killLines && narrConf.killLines[p.perfil]) ? narrConf.killLines[p.perfil] : narrConf.killLines.default;
                        const narrEmoji = CONFIG.emojis[STATE.game.narrator] || '💀';
                        
                        this.updateStatus(narrEmoji, killByPerfil);
                        this.log(`${narrEmoji} ${killByPerfil}`);
                        
                        this.log(`💀 ${p.name} foi de arrasta!`);
                        if (!STATE.stats[p.name]) STATE.stats[p.name] = { wins:0, hits:0, dodges:0 };
                        STATE.stats[p.name].hits++;
                        STATE.stats[p.name]._meta = { ...STATE.stats[p.name]._meta, dieStreak: (STATE.stats[p.name]._meta?.dieStreak || 0) + 1, winStreak: 0 };
                        
                        Logic.checkAchievements(p.name, { diedOnShot: p.shotsTaken }, true);
                        setTimeout(() => { this.checkGameFlow(pIndex); }, 6000);
                    } else {
                        this.renderPlayersList(); 

                        const deathLine = STATE.game.deathLinesDeck[STATE.game.deathLineIdx % STATE.game.deathLinesDeck.length];
                        STATE.game.deathLineIdx++;
                        
                        this.updateStatus("💀", deathLine);
                        this.log(`☠️ ${deathLine}`);
                        
                        setTimeout(() => {
                            const frases = CONFIG.perfis[p.perfil];
                            const fraseAfter = frases.afterSurvive[p.lines.afterSurvive++ % frases.afterSurvive.length];
                            
                            this.updateStatus(emoji, fraseAfter);
                            this.log(`${emoji} ${p.name}: ${fraseAfter}`);
                            
                            if (!STATE.stats[p.name]) STATE.stats[p.name] = { wins:0, hits:0, dodges:0 };
                            STATE.stats[p.name].dodges++;
                            
                            if (p.gun.chamber > 5) { // Checa se rodou de 5 para 6
                                Logic.checkAchievements(p.name, { didDodgeLastShotBefore: true }, true);
                                p.gun.chamber = 0; // Reseta
                            }

                            setTimeout(() => { 
                                this.updateStatus(null, null); 
                                this.checkGameFlow(pIndex); 
                            }, 3000);
                        }, 1500);
                    }
                }, 1000); 

            }, 300);
        }, 300);
    },

    checkGameFlow(lastShooterIdx) {
        const alive = STATE.game.players.filter(p => p.alive);
        if (alive.length <= 1) {
            const winner = alive[0]; STATE.game.active = false;
            STATE.game.players.forEach(p => {
                if(!STATE.stats[p.name]) STATE.stats[p.name] = { wins:0, hits:0, dodges:0, matches: 0 };
                STATE.stats[p.name].matches = (STATE.stats[p.name].matches || 0) + 1;
                Logic.checkAchievements(p.name, {}, false);
            });
            if (winner) {
                if(!STATE.stats[winner.name]) STATE.stats[winner.name] = { wins:0, hits:0, dodges:0, matches: 0 };
                STATE.stats[winner.name].wins++;
                const meta = STATE.stats[winner.name]._meta || {};
                STATE.stats[winner.name]._meta = { ...meta, winStreak: (meta.winStreak||0)+1, dieStreak: 0 };
                
                const winnerIdx = STATE.game.players.indexOf(winner);
                const wasProtected = (STATE.game.lastProtectedIdx === winnerIdx);
                const didWinLastShotBefore = (winner.gun.chamber >= 5);

                const winEvents = { winStreak: STATE.stats[winner.name]._meta.winStreak, wasProtectedWinner: wasProtected, didWinLastShotBefore: didWinLastShotBefore };
                Logic.checkAchievements(winner.name, winEvents, true);
                
                const narrConf = CONFIG.narradores[STATE.game.narrator];
                const winnerLines = narrConf.winner || [];
                const chosen = winnerLines.length ? winnerLines[Math.floor(Math.random()*winnerLines.length)] : `${winner.name} venceu!`;
                const lined = chosen.replace('{nome}', winner.name);
                const winMsg = document.getElementById('win-msg');
                if(winMsg) winMsg.textContent = `${CONFIG.emojis[STATE.game.narrator] || ''} ${lined}`;
                
                const achDiv = document.getElementById('win-achievements'); 
                if(achDiv) {
                    achDiv.innerHTML = '';
                    if (STATE.game.roundUnlocks.length > 0) {
                        achDiv.innerHTML = '<p>Novas Conquistas:</p>';
                        STATE.game.roundUnlocks.forEach(id => {
                            const def = ACHIEVEMENTS_DEF.find(a=>a.id===id);
                            if(def) achDiv.innerHTML += `<div style="font-size:0.9rem">${def.emoji} ${def.name}</div>`;
                        });
                    }
                }
            } else {
                const winMsg = document.getElementById('win-msg');
                if(winMsg) winMsg.textContent = "Ninguém sobrou nessa mesa maldita.";
            }
            Storage.set('stats', STATE.stats); STATE.game.isShooting = false;
            setTimeout(() => { this.goTo('win'); }, 1000);
            return;
        }
        STATE.game.isShooting = false;
        if (Logic.rotateTable()) { this.runRotationAnim(false); this.setNextTurn(lastShooterIdx); } 
        else { this.setNextTurn(lastShooterIdx); this.updateGameUI(); }
    },
    setNextTurn(currentIdx) {
        let next = (currentIdx + 1) % STATE.game.players.length;
        while (!STATE.game.players[next].alive) next = (next + 1) % STATE.game.players.length;
        STATE.game.turnIndex = next;
    },
    restartGame() { this.showLoading(); },
    updateGameUI() {
        document.getElementById('game-mesa-info').textContent = `Mesa de ${STATE.game.mesaCard}`;
        const cardDisplay = document.getElementById('game-mesa-card');
        const imgName = CONFIG.cards[STATE.game.mesaCard] || 'card-back.png';
        cardDisplay.style.backgroundImage = `url('${CONFIG.paths.img}${imgName}')`;
        
        document.getElementById('game-status').innerHTML = "";
        
        document.getElementById('game-narrator-area').textContent = "";
        
        const pName = STATE.game.players[STATE.game.turnIndex].name;
        document.getElementById('starter-info').innerHTML = `★ <b>${pName}</b> começa essa bagaça`;
        this.renderPlayersList();
    },
    renderPlayersList() {
        const list = document.getElementById('game-players-list'); list.innerHTML = '';
        const btnDuel = document.getElementById('btn-duel-toggle');
        const btnChaos = document.getElementById('btn-chaos-toggle');
        
        if (!STATE.game.isShooting && !STATE.game.chaos.active) {
            btnDuel.style.display = STATE.game.massacreMode ? 'block' : 'none';
            btnChaos.style.display = STATE.game.chaosMode ? 'block' : 'none';
        } else {
            if (STATE.game.chaos.active) {
                btnDuel.style.display = 'none';
                btnChaos.style.display = 'none';
            }
        }

        const isChaosSel = STATE.game.chaos.active;
        let pickerIdx = -1;
        if (isChaosSel && STATE.game.chaos.queue.length > 0 && STATE.game.chaos.currentPickIdx < STATE.game.chaos.queue.length) {
            pickerIdx = STATE.game.chaos.queue[STATE.game.chaos.currentPickIdx];
        }

        STATE.game.players.forEach((p, idx) => {
            const isStarter = (idx === STATE.game.turnIndex);
            
            let displayEmoji = p.alive ? CONFIG.emojis[p.perfil] : '💀';
            if (p.alive && isChaosSel) {
                const votes = STATE.game.chaos.votes[idx] || 0;
                if (votes === 1) displayEmoji = "😟";
                else if (votes === 2) displayEmoji = "😨";
                else if (votes >= 3) displayEmoji = "😱";
            }

            const isChaosPicker = (idx === pickerIdx);
            
            const div = document.createElement('div');
            div.className = `player-card ${!p.alive ? 'dead' : ''} ${isStarter && !isChaosSel ? 'starter' : ''} ${isChaosPicker ? 'chaos-highlight' : ''}`;
            
            let btnHtml = '';
            if (!p.alive) {
                btnHtml = '<span class="shot-glass" style="display:none;"></span>';
            } else {
                if (isChaosSel) {
                    if (isChaosPicker) {
                        btnHtml = `<button class="western-btn small" style="background:#444; color:#fff;" disabled>🔫 Atirador</button>`;
                    } else {
                        if (pickerIdx !== -1) {
                             btnHtml = `<button class="western-btn btn-aim small" onclick="App.handleChaosPick(${idx})">🎯 Mirar</button>`;
                        } else {
                             btnHtml = `<span style="font-size:1.5rem">🥶</span>`;
                        }
                    }
                } else if (STATE.game.isMassacre) {
                    if (idx === STATE.game.protectedIdx) btnHtml = `<button class="western-btn btn-protect small" disabled>🕊️ PROTEGIDO</button>`;
                    else btnHtml = `<button class="western-btn btn-fire small" disabled>🔥 FOGO</button>`;
                } else if (this.duelMode) {
                    btnHtml = `<button class="western-btn btn-protect small" ${STATE.game.isShooting ? 'disabled' : ''} onclick="App.handleShoot(${idx})">🛡️ PROTEGER</button>`;
                } else {
                    btnHtml = `<button class="western-btn danger small" ${STATE.game.isShooting ? 'disabled' : ''} onclick="App.handleShoot(${idx})">ATIRAR</button>`;
                }
            }
            div.innerHTML = `
                <div style="display:flex; align-items:center;">
                    <span class="emoji-big">${displayEmoji}</span>
                    <div><div style="font-weight:bold; font-size:1.3rem">${p.name}</div></div>
                </div>
                <div style="display:flex; align-items:center; gap: 10px;">
                     <div style="font-size:1.2rem; font-weight:bold; opacity:0.8">${p.shotsTaken}/6</div>
                    ${btnHtml}
                </div>
            `;
            list.appendChild(div);
        });
    },
    log(msg) {
        const box = document.getElementById('game-log');
        if(box) {
            box.innerHTML += `<div>${msg}</div>`; 
            box.scrollTop = box.scrollHeight;
        }
    },
    renderStats() {
        const board = document.getElementById('stats-board');
        const list = Object.keys(STATE.stats).sort((a,b)=>STATE.stats[b].wins - STATE.stats[a].wins);
        if (list.length === 0) { board.innerHTML = '<p class="text-center">Ainda não há lendas neste bar.</p>'; return; }
        board.innerHTML = '';
        list.forEach(name => {
            const s = STATE.stats[name]; const achs = STATE.achieved[name] || [];
            let html = `<div style="margin-bottom:15px; border-bottom:1px dashed #555; padding-bottom:10px;">
                <div style="font-weight:bold; color:var(--gold); display:flex; justify-content:space-between; align-items:center;">
                    <span>${name} ${achs.length > 0 ? '⭐' : ''}</span>
                    <button class="western-btn secondary small" style="margin:0; width:auto; font-size:0.7rem;" onclick="App.viewPlayerAch('${name}')">VER CONQUISTAS</button>
                </div>
                <div style="font-size:0.9rem; margin-top:5px;">🏆 ${s.wins} | ☠️ ${s.hits} | 🍀 ${s.dodges} | 🤠 ${s.matches || 0}</div>
                <div style="margin-top:5px; font-size:0.8rem;">
                    ${achs.map(id => { const def = ACHIEVEMENTS_DEF.find(a=>a.id===id); return def ? def.emoji : ''; }).join(' ')}
                </div>
            </div>`;
            board.innerHTML += html;
        });
    },
    viewPlayerAch(name) {
        document.getElementById('ach-screen-title').textContent = `Conquistas: ${name}`;
        const container = document.getElementById('ach-list-content'); container.innerHTML = '';
        const unlocked = STATE.achieved[name] || [];
        const sorted = [...ACHIEVEMENTS_DEF].sort((a,b) => {
            const hasA = unlocked.includes(a.id); const hasB = unlocked.includes(b.id);
            if (hasA && !hasB) return -1; if (!hasA && hasB) return 1; return 0;
        });
        sorted.forEach(ach => {
            const has = unlocked.includes(ach.id); if(!has && ach.isHidden) return;
            const div = document.createElement('div'); div.className = `ach-row ${has ? '' : 'locked'}`;
            div.innerHTML = `<div style="font-size:1.5rem;">${has ? ach.emoji : '🔒'}</div>
                <div><div style="font-weight:bold; color:${has ? 'var(--gold)' : '#aaa'}">${ach.name}</div>
                <div style="font-size:0.8rem;">${ach.desc}</div></div>`;
            container.appendChild(div);
        });
        this.goTo('achievements');
    },
    confirmResetStats() {
        View.showModal("QUEIMAR REGISTROS?", "Isso apagará todas as vitórias e conquistas para sempre.", [
            { text: "SIM, QUEIME TUDO", class: "danger", action: () => {
                STATE.achieved = {};
                const newStats = {};
                STATE.db.forEach(playerName => {
                    newStats[playerName] = {
                        wins: 0,
                        hits: 0,
                        dodges: 0,
                        matches: 0,
                        _meta: { winStreak: 0, dieStreak: 0 } 
                    };
                });
                STATE.stats = newStats;
                Storage.set('stats', STATE.stats);
                Storage.set('achieved', STATE.achieved);
                this.renderStats();
                View.closeModal();
                const t = document.getElementById('systemToast');
                t.textContent = "Evidências destruídas.";
                t.classList.add('show');
                setTimeout(() => t.classList.remove('show'), 2000);
            }},
            { text: "CANCELAR", class: "secondary", action: () => View.closeModal() }
        ]);
    },
    confirmDeletePlayer(name) {
        View.showModal("EXPULSAR DO BAR?", `Deseja remover "${name}" permanentemente?`, [
            { text: "FORA DAQUI!", class: "danger", action: () => {
                STATE.db = STATE.db.filter(n=>n!==name);
                STATE.slots = STATE.slots.map(s => s === name ? null : s);
                Storage.set('db', STATE.db); Storage.set('slots', STATE.slots);
                this.openSelect(this.currentSlot); View.closeModal();
            }},
            { text: "DEIXA ELE", class: "secondary", action: () => View.closeModal() }
        ]);
    }
};