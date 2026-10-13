(() => {
"use strict";
const cv = document.getElementById("battle");
const ctx = cv.getContext("2d");
try {
  if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath();
      return this;
    };
  }
} catch {}
const W = 480, H = 720;
const PX_PER_FIELD = 28;

// ---------- data ----------
let DATA = null;
const ICON = { unit_brawler: "🐷", unit_marksman: "🔫", unit_tactician: "🐧", unit_medic: "⛑️",
  unit_ninja: "🥷", unit_drone: "🛸", unit_hacker: "💻", unit_mech: "👑", unit_sniper: "🐸" };
const COLOR = { unit_brawler: "#ff9f1c", unit_marksman: "#35c4ff", unit_tactician: "#7df9ff", unit_medic: "#51ff7a",
  unit_ninja: "#ff2fb3", unit_drone: "#9adcff", unit_hacker: "#b6ff2f", unit_mech: "#ffd700", unit_sniper: "#7bff62" };
const RARITY_C = { common: "#9fb3c8", rare: "#35c4ff", epic: "#c26bff" };
const SPEED_PX = { "Langsam": 24, "Mittel": 40, "Schnell": 54 };
// Einheiten, die fliegende Ziele treffen können (Türme können alles)
const AIR_HITTERS = new Set(["unit_marksman", "unit_sniper", "unit_hacker", "unit_drone"]);
function canHit(attId, tgt) {
  if (!tgt.flying) return true;
  if (attId === "tower") return true;
  return AIR_HITTERS.has(attId);
}

// ---------- save / level ----------
const SAVE_KEY = "neonClashSaveV1";
let SAVE = null;
function loadSave() {
  const fresh = () => ({ credits: 500, copies: {}, streak: 0, record: { w: 0, l: 0, d: 0 }, daily: "", coreNoEpic: 0, lastResult: "", muted: false, v: 3 }); // B4+B10
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return fresh();
    const s = Object.assign(fresh(), JSON.parse(raw));
    if (typeof s.credits !== "number" || !s.copies) return fresh();
    s.record = Object.assign({ w: 0, l: 0, d: 0 }, s.record);
    return s;
  } catch { return fresh(); }
}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch {} }
function copiesNeed() { return (DATA.leveling && DATA.leveling.copies_needed) || [0, 2, 5, 10, 20]; }
function maxLevel() { return (DATA.leveling && DATA.leveling.max_level) || 5; }
function levelOf(id) {
  const have = SAVE.copies[id] || 0, need = copiesNeed();
  let lvl = 1;
  for (let i = 1; i < maxLevel() && i < need.length; i++) if (have >= need[i]) lvl = i + 1;
  return lvl;
}
function levelMult(id) {
  const bonus = (DATA.leveling && DATA.leveling.bonus_per_level) || 0.08;
  return 1 + bonus * (levelOf(id) - 1);
}
function nextNeed(id) {
  const need = copiesNeed(), lvl = levelOf(id);
  if (lvl >= maxLevel()) return null;
  return { have: SAVE.copies[id] || 0, need: need[lvl] };
}
function rangePx(u) {
  if (u.range === "Nahkampf") return 30;
  const m = /([\d.]+)\s*Felder/.exec(u.range || "");
  return m ? parseFloat(m[1]) * PX_PER_FIELD : 120;
}

// ---------- state ----------
const S = {
  running: false, over: false,
  timeLeft: 180, overtime: false, otLeft: 60,
  elixirP: 5, elixirB: 5,
  units: [], tracers: [], floats: [], parts: [], rings: [],
  towersP: [], towersB: [],
  hand: [], queue: [], pool: [],
  kills: {}, // Z8: Kills pro Karte (Spieler)
  sel: -1, bot: null, tier: "Normal",
  px: -1, py: -1, // Z2: Deploy-Cursor
  elapsed: 0, streak: 0, lastKillT: -99, // B2: Kampf-Uhr + Killstreak
  crownsP: 0, crownsB: 0,
  lastT: 0, botClock: 0, result: null,
  shake: 0, flash: 0, // Z9: Screen-Flash
  crownFlash: 0, // B7
  calmed: false, paused: false, otBuff: false, underdog: false, // B10/B6/B4
};

const EL = id => document.getElementById(id);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function toast(msg, ms = 1800) {
  const t = EL("toast");
  // B6: Nachrichten anhängen statt zu überschreiben
  t.textContent = t._active ? t.textContent + " • " + msg : msg;
  t._active = true;
  t.classList.remove("hidden");
  clearTimeout(t._h);
  t._h = setTimeout(() => { t.classList.add("hidden"); t._active = false; }, ms);
}
function fmt(s) {
  s = Math.max(0, Math.ceil(s));
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

// ---------- audio: dark synthwave, 120 -> 145 BPM ----------
const AudioSys = {
  ctx: null, on: true, timer: null, step: 0,
  bpm() { return S.overtime ? 145 : 120; },
  ensure() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  },
  start() {
    this.ensure(); if (!this.ctx || this.timer) return;
    const loop = () => {
      if (!this.on || !S.running || S.over) return;
      this.playStep(this.step++);
    };
    this.timer = setInterval(loop, () => 0); // placeholder replaced below
    clearInterval(this.timer);
    const tick = () => {
      if (!this.on || !S.running || S.over) return;
      this.playStep(this.step++);
      this.timer = setTimeout(tick, 60000 / this.bpm() / 2);
    };
    this.timer = setTimeout(tick, 0);
  },
  stop() { if (this.timer) { clearTimeout(this.timer); this.timer = null; } },
  // B5: Einmal-Sounds (gedrosselt)
  tone(freq, dur = 0.1, type = "square", vol = 0.06, delayMs = 0) {
    if (!this.on) return;
    this.ensure(); if (!this.ctx) return;
    try {
      const c = this.ctx, t = c.currentTime + delayMs / 1000;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch {}
  },
  sfx(freq, dur, type, vol) {
    const now = performance.now();
    if (now - (this._last || 0) < 90) return;
    this._last = now;
    this.tone(freq, dur, type, vol);
  },
  boom() { // Explosion
    if (!this.on) return;
    this.ensure(); if (!this.ctx) return;
    try {
      const c = this.ctx, t = c.currentTime, len = 0.3;
      const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = 500; g.gain.value = 0.25; src.buffer = buf;
      src.connect(f); f.connect(g); g.connect(c.destination); src.start(t);
    } catch {}
  },
  jingle(win) {
    (win ? [523, 659, 784, 1047] : [392, 330, 262, 196]).forEach((f, i) => this.tone(f, 0.16, "square", 0.07, i * 140));
  },
  playStep(s) {
    if (!this.on || !this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const bassNotes = [55, 55, 65.4, 49]; // A1 A1 C2 G1
    const leadScale = [220, 261.6, 293.7, 329.6, 392, 329.6, 293.7, 261.6];
    // distorted bass on beats
    if (s % 2 === 0) {
      const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.value = bassNotes[(s / 2 | 0) % 4];
      f.type = "lowpass"; f.frequency.value = 300;
      g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
      o.connect(f); f.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.45);
    }
    // analog arp 16ths
    const o2 = c.createOscillator(), g2 = c.createGain();
    o2.type = "square"; o2.frequency.value = leadScale[s % 8] * (S.overtime ? 1.122 : 1);
    g2.gain.setValueAtTime(0.035, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o2.connect(g2); g2.connect(c.destination); o2.start(t); o2.stop(t + 0.2);
    // industrial hat (noise)
    if (s % 2 === 1) {
      const len = 0.06, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = c.createBufferSource(), g3 = c.createGain(), hp = c.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 6000;
      g3.gain.value = 0.06; src.buffer = buf;
      src.connect(hp); hp.connect(g3); g3.connect(c.destination); src.start(t);
    }
    // B5: Overtime-Doppel-Hat
    if (S.overtime && s % 2 === 0) {
      const len = 0.04, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = c.createBufferSource(), g4 = c.createGain(), hp2 = c.createBiquadFilter();
      hp2.type = "highpass"; hp2.frequency.value = 7000;
      g4.gain.value = 0.04; src.buffer = buf;
      src.connect(hp2); hp2.connect(g4); g4.connect(c.destination); src.start(t);
    }
  }
};

// ---------- setup ----------
function mkTowers(side) {
  // side: 'P' bottom, 'B' top
  const tSide = DATA.towers.find(t => t.type === "princess_tower");
  const tKing = DATA.towers.find(t => t.type === "king_tower");
  const yP = side === "P" ? 580 : 140;
  const yK = side === "P" ? 655 : 65;
  return [
    { side, kind: "princess", lane: 0, x: 120, y: yP, hp: tSide.health, maxHp: tSide.health, dmg: tSide.damage, atkSpd: tSide.attack_speed_sec, cd: 0, range: tSide.range * PX_PER_FIELD, alive: true, r: 22 },
    { side, kind: "princess", lane: 1, x: 360, y: yP, hp: tSide.health, maxHp: tSide.health, dmg: tSide.damage, atkSpd: tSide.attack_speed_sec, cd: 0, range: tSide.range * PX_PER_FIELD, alive: true, r: 22 },
    { side, kind: "king", lane: -1, x: 240, y: yK, hp: tKing.health, maxHp: tKing.health, dmg: tKing.damage, atkSpd: tKing.attack_speed_sec, cd: 0, range: tKing.range * PX_PER_FIELD, alive: true, r: 28, sleeping: side === "P" ? false : true, isKing: true },
  ];
}

function pickBot(tier) {
  const pool = DATA.bots.filter(b => b.tier === tier);
  return pool[Math.floor(Math.random() * pool.length)];
}

function resetMatch() {
  const cfg = DATA.battle_settings;
  S.timeLeft = cfg.match_duration_seconds;
  S.otLeft = cfg.overtime_duration_seconds;
  S.overtime = false; S.over = false;
  S.elixirP = cfg.elixir.start_amount; S.elixirB = cfg.elixir.start_amount;
  S.units = []; S.tracers = []; S.floats = []; S.parts = []; S.rings = [];
  S.towersP = mkTowers("P"); S.towersB = mkTowers("B");
  S.towersP[2].sleeping = false; // player king always awake
  S.crownsP = 0; S.crownsB = 0;
  S.kills = {}; // Z8
  S.botClock = 0; S.result = null; S.shake = 0;
  S.otBuff = false; S.elapsed = 0; S.streak = 0; S.lastKillT = -99; // B4/B2 Reset
  S.underdog = SAVE.lastResult === "lose"; // B4
  EL("player-clan").textContent = "Gang Pepe · 👑 0";
  // player deck: alle 9 Karten, 4 auf Hand, Rest rotiert nach
  S.pool = DATA.units.map(u => u.id);
  for (let i = S.pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[S.pool[i], S.pool[j]] = [S.pool[j], S.pool[i]]; }
  S.hand = S.pool.slice(0, 4); S.queue = S.pool.slice(4);
  S.sel = -1;
  EL("end-overlay").classList.add("hidden");
  EL("start-overlay").style.display = "none";
  EL("enemy-name").textContent = "@" + S.bot.username;
  EL("enemy-tier").textContent = S.bot.ai_profile.strategy + " · Neon Destroyers";
  updatePips(); renderHand();
  S.running = true; S.lastT = performance.now();
  if (EL("opt-sound") && !EL("opt-sound").checked) AudioSys.on = false;
  AudioSys.ensure(); AudioSys.start();
  toast("⚔ " + S.bot.username + " fordert dich heraus!");
  updateTimerUI();
}

// ---------- spawning ----------
function unitDef(id) { return DATA.units.find(u => u.id === id); }

function canSpawn(side, id, x, y) {
  const def = unitDef(id);
  if (side === "P") {
    if (y < 395) { toast("Nur auf deiner Hälfte!"); return false; }
    if (S.elixirP < def.elixir_cost) { toast("Nicht genug Elixir!"); return false; }
  } else {
    if (S.elixirB < def.elixir_cost) return false;
  }
  return true;
}

function spawnUnit(side, id, x, y) {
  const def = unitDef(id);
  if (!canSpawn(side, id, x, y)) return false;
  if (side === "P") S.elixirP -= def.elixir_cost; else S.elixirB -= def.elixir_cost;
  const mult = side === "P" ? levelMult(id) : 1; // Level-Boni nur für den Spieler
  S.units.push({
    id, side, x: Math.max(24, Math.min(W - 24, x)), y,
    hp: def.health * mult, maxHp: def.health * mult,
    dmg: def.damage * mult, atkSpd: def.attack_speed_sec, cd: 0.4,
    range: rangePx(def), speed: SPEED_PX[def.speed] || 36,
    role: def.role, stun: 0, slow: 0, dash: id === "unit_ninja" ? 1.5 : 0,
    hits: 0, shots: 0, lastTgt: null,
    didStun: false, shield: id === "unit_mech",
    flying: !!def.flying, lvl: side === "P" ? levelOf(id) : 1,
    seed: Math.random() * 6.28,
    r: id === "unit_brawler" ? 13 : id === "unit_mech" ? 15 : id === "unit_drone" ? 12 : 11,
  });
  S.rings.push({ x: Math.max(24, Math.min(W - 24, x)), y, t: 0.45, max: 0.45, c: side === "P" ? "#35c4ff" : "#ff2f92" });
  burst(x, y, side === "P" ? "#35c4ff" : "#ff2f92", 8);
  if (side === "P") AudioSys.sfx(620, 0.07, "square", 0.05); // B5: Spawn-Blip
  // cycle player hand
  if (side === "P") {
    const idx = S.hand.indexOf(id);
    if (idx >= 0) {
      const nxt = S.queue.shift();
      S.hand[idx] = nxt;
      S.queue.push(id);
    }
    S.sel = -1; renderHand();
  }
  return true;
}

// ---------- targeting helpers ----------
function aliveTowers(side) { return (side === "P" ? S.towersP : S.towersB).filter(t => t.alive); }
function foesOf(side) {
  const foes = S.units.filter(u => u.side !== side && u.hp > 0);
  const tw = aliveTowers(side === "P" ? "B" : "P");
  // dormant enemy king can't be targeted until awake
  return { units: foes, towers: tw.filter(t => !(t.isKing && t.sleeping)) };
}
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function nearestTowerFor(side, x, y) {
  // lane logic: pick closest alive tower on enemy side (king only if princesses down or closest)
  const tw = foesOf(side).towers;
  if (!tw.length) return null;
  // prefer princess on same lane
  const lane = x < W / 2 ? 0 : 1;
  const laneTw = tw.filter(t => t.lane === lane);
  const cands = laneTw.length ? laneTw : tw;
  let best = cands[0], bd = 1e9;
  for (const t of cands) {
    // king is fallback: only if no princess alive on that side... allow if closer & awake
    const d = Math.hypot(t.x - x, t.y - y);
    if (d < bd) { bd = d; best = t; }
  }
  // don't walk past a living princess to the king
  const enemySide = side === "P" ? "B" : "P";
  const princessAlive = (enemySide === "P" ? S.towersP : S.towersB).some(t => t.kind === "princess" && t.alive);
  if (best.kind === "king" && princessAlive) {
    const pr = tw.filter(t => t.kind === "princess");
    if (pr.length) {
      best = pr.reduce((a, b) => Math.hypot(a.x - x, a.y - y) < Math.hypot(b.x - x, b.y - y) ? a : b);
    }
  }
  return best;
}

function bridgeX(x) { return x < W / 2 ? 120 : 360; }

// movement: steer toward waypoint (bridge crossing if river between)
function waypointFor(u, tx, ty) {
  const riverTop = 340, riverBot = 380;
  const crossed = (u.y < riverTop && ty > riverBot) || (u.y > riverBot && ty < riverTop);
  const inRiver = u.y >= riverTop - 6 && u.y <= riverBot + 6;
  if (crossed && !inRiver) {
    const bx = bridgeX(u.x);
    // walk to bridge entry first
    if (Math.abs(u.x - bx) > 14 && ((u.side === "P" && u.y > riverBot) || (u.side === "B" && u.y < riverTop))) {
      return { x: bx, y: u.side === "P" ? riverBot + 30 : riverTop - 30 };
    }
    return { x: bx + (u.x - bx) * 0.3, y: ty > u.y ? u.y + 60 : u.y - 60 };
  }
  return { x: tx, y: ty };
}

// ---------- combat update ----------
function damageTower(t, dmg, bySide) {
  if (!t.alive) return;
  if (t.isKing && t.sleeping) {
    t.sleeping = false;
    addFloat(t.x, t.y - 34, "👁 AKTIV!", "#ff2f92");
    S.rings.push({ x: t.x, y: t.y, t: 0.7, max: 0.7, c: "#ff2f92" }); // B2: Wake-Roar
  }
  t.hp -= dmg;
  // B5: Low-HP-Alarm (eigene Türme, einmalig, bei nicht-tödlichem Schaden)
  if (t.hp > 0 && t.side === "P" && t.hp / t.maxHp < 0.3 && !t.alarm) {
    t.alarm = true;
    AudioSys.tone(220, 0.25, "sawtooth", 0.08);
    toast("⚠️ Dein Turm brennt!");
  }
  if (t.hp <= 0) {
    t.hp = 0; t.alive = false; S.shake = S.calmed ? 0 : 10; // B10
    AudioSys.boom(); // B5
    S.rings.push({ x: t.x, y: t.y, t: 1.2, max: 1.2, c: "#ffd700" }); // Z4: Shockwave bei Turm-Kill
    burst(t.x, t.y, "#ffd700", 24, 160);
    // B4: Turm-Bounty +3 Elixir für die Killerseite
    if (bySide === "P") S.elixirP = Math.min(10, S.elixirP + 3);
    else S.elixirB = Math.min(10, S.elixirB + 3);
    addFloat(t.x, t.y - 46, "+3💧 BOUNTY", "#35c4ff");
    if (t.side === "B") S.crownsP++; else S.crownsB++;
    S.crownFlash = 1; // B7
    EL("player-clan").textContent = "Gang Pepe · 👑 " + S.crownsP;
    addFloat(t.x, t.y - 30, "💥 ZERSTÖRT", "#ff2f92");
    updatePips();
    // king destroyed => instant win
    if (t.kind === "king") return endMatch(bySide === "P" ? "win" : "lose", "Core-Turm zerstört!");
    // overtime sudden death: first tower decides
    if (S.overtime) return endMatch(bySide === "P" ? "win" : "lose", "Sudden Death – Turm gefallen!");
    // waking king when princess falls
    const king = (t.side === "P" ? S.towersP : S.towersB)[2];
    if (king && king.alive) king.sleeping = false;
  }
}

function addFloat(x, y, txt, c) {
  if (S.floats.length > 30) S.floats.shift(); // B10: Cap
  S.floats.push({ x, y, txt, c, t: 1.2 });
}
function burst(x, y, c, n = 10, spd = 90) {
  if (S.calmed) n = Math.max(2, Math.ceil(n / 3)); // B10: Reduced Motion
  for (let i = 0; i < n && S.parts.length < 220; i++) {
    const a = Math.random() * 6.28, v = spd * (0.4 + Math.random());
    S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, t: 0.5 + Math.random() * 0.4, life: 0.9, c, s: 1.5 + Math.random() * 2.5 });
  }
}
// zentraler Schadenspfad für Einheiten (Mech-Schild!)
function hurtUnit(tgt, dmg, srcId) {
  if (tgt.hp <= 0) return;
  if (tgt.shield) {
    tgt.shield = false;
    addFloat(tgt.x, tgt.y - 24, "🛡 BLOCK!", "#ffa62b");
    burst(tgt.x, tgt.y, "#ffa62b", 10);
    return;
  }
  tgt.hp -= dmg;
  if (tgt.hp <= 0) tgt.hp = 0;
}

function update(dt) {
  const cfg = DATA.battle_settings.elixir;
  // timer
  if (!S.overtime) {
    S.timeLeft -= dt;
    // B5: Countdown-Ticks (letzte 5 s)
    const whole = Math.ceil(S.timeLeft);
    if (S.timeLeft > 0 && whole <= 5 && whole !== S._tick) { S._tick = whole; AudioSys.tone(990, 0.06, "square", 0.05); }
    if (S.timeLeft <= 0) {
      S.timeLeft = 0;
      // decide: tower lead wins, else overtime
      if (S.crownsP !== S.crownsB) return endMatch(S.crownsP > S.crownsB ? "win" : "lose", "Zeit um – " + S.crownsP + ":" + S.crownsB + " Türme");
      S.overtime = true;
      S.flash = 1; // Z9
      // B4: Last Stand – Könige wachen auf, +10 % Reichweite
      if (!S.otBuff) {
        S.otBuff = true;
        for (const t of [...S.towersP, ...S.towersB]) {
          t.sleeping = false;
          if (t.isKing && t.alive) t.range *= 1.1;
        }
      }
      toast("⚡ OVERTIME – doppeltes Elixir, Sudden Death!", 2600);
    }
  } else {
    S.otLeft -= dt;
    if (S.otLeft <= 0) {
      S.otLeft = 0;
      // tiebreak: lowest tower HP loses
      const low = lowestTowerHp("B"), lowP = lowestTowerHp("P");
      if (low !== lowP) return endMatch(low < lowP ? "win" : "lose", "Overtime um – Turm-HP entscheidet");
      return endMatch("draw", "Unentschieden!");
    }
  }
  const mult = S.overtime ? cfg.overtime_multiplier : 1;
  S.elapsed += dt; // B2
  // B4: Underdog-Blitz (nach Niederlage 15 s lang +50 % für dich)
  const rateP = cfg.recharge_rate_per_sec * mult * ((S.underdog && S.elapsed < 15) ? 1.5 : 1);
  S.elixirP = Math.min(cfg.max_amount, S.elixirP + rateP * dt);
  S.elixirB = Math.min(cfg.max_amount, S.elixirB + cfg.recharge_rate_per_sec * mult * dt);

  // bot AI
  botUpdate(dt);

  // units
  for (const u of S.units) {
    if (u.hp <= 0) continue;
    if (u.stun > 0) { u.stun -= dt; continue; }
    if (u.slow > 0) u.slow -= dt;
    if (u.dash > 0) u.dash -= dt;
    if (u.aimT > 0) u.aimT -= dt; // B2: Sniper-Ziellinie
    // B2: Dash-Trail
    if (u.dash > 0 && Math.random() < dt * 20 && S.parts.length < 200) {
      S.parts.push({ x: u.x, y: u.y, vx: 0, vy: -10, t: 0.3, life: 0.3, c: COLOR[u.id] || "#fff", s: 3 });
    }
    u.cd -= dt;
    const { units: foesAll, towers } = foesOf(u.side);
    const foes = foesAll.filter(f => canHit(u.id, f));
    if (u.role === "Heilung") {
      // follow nearest ally, heal aura (skaliert mit Level)
      const def = unitDef(u.id);
      const auraR = ((def.ability && def.ability.radius) || 3.0) * PX_PER_FIELD;
      const allies = S.units.filter(a => a.side === u.side && a !== u && a.hp > 0 && dist(a, u) < auraR);
      const heal = ((def.ability && def.ability.heal_per_sec) || 40) * (u.side === "P" ? levelMult(u.id) : 1);
      for (const a of allies) a.hp = Math.min(a.maxHp, a.hp + heal * dt);
      if (allies.length && Math.random() < dt * 6) {
        const a = allies[Math.floor(Math.random() * allies.length)];
        S.parts.push({ x: a.x + (Math.random() * 16 - 8), y: a.y - 10, vx: 0, vy: -34, t: 0.7, life: 0.7, c: "#51ff7a", s: 2, plus: true });
        if (Math.random() < 0.3) addFloat(a.x, a.y - 22, "+" + Math.round(heal * 0.5), "#51ff7a"); // B2
      }
      const anchor = nearestAlly(u) || nearestTowerFor(u.side === "P" ? "B" : "P", u.x, u.y) || { x: 240, y: u.side === "P" ? 500 : 220 };
      // B1: Medic weicht Frontkämpfern aus (Rückzug)
      const chaser = foesAll.find(f => f.side !== u.side && f.hp > 0 && dist(f, u) < 110);
      const w = chaser
        ? { x: u.x + (u.x - chaser.x), y: u.y + (u.y - chaser.y) + (u.side === "P" ? 30 : -30) }
        : waypointFor(u, anchor.x + 24, anchor.y + (u.side === "P" ? 40 : -40));
      moveToward(u, w.x, w.y, dt);
      // weak melee (kein Luftangriff)
      const tgt = nearestInRange(u, foes, u.range) || nearestInRange(u, towers, u.range);
      if (tgt && u.cd <= 0) { hitTarget(u, tgt); u.cd = u.atkSpd; }
      continue;
    }
    // B1: Rollen-Zielwahl (Hacker=Max-HP, Sniper=Min-HP, Drohne=Medic zuerst, BOSS=Belagerung, Bomber=Cluster)
    let tgt = null, isUnit = false;
    const inSight = foes.filter(f => dist(u, f) <= 200);
    if (u.id === "unit_ninja") {
      const sightN = 280;
      const prey = foes.filter(f => ["unit_marksman", "unit_sniper", "unit_medic", "unit_hacker", "unit_drone"].includes(f.id) && dist(u, f) <= sightN);
      if (prey.length) { prey.sort((a, b) => dist(u, a) - dist(u, b)); tgt = prey[0]; isUnit = true; }
    } else if (u.id === "unit_hacker" && inSight.length) {
      tgt = inSight.reduce((a, b) => (b.hp > a.hp ? b : a)); isUnit = true;
    } else if (u.id === "unit_sniper" && inSight.length) {
      tgt = inSight.reduce((a, b) => (b.hp < a.hp ? b : a)); isUnit = true;
    } else if (u.id === "unit_drone") {
      const sup = inSight.filter(f => f.id === "unit_medic");
      tgt = sup.length ? sup.reduce((a, b) => dist(u, a) < dist(u, b) ? a : b) : nearestInRange(u, foes, 200);
      isUnit = !!tgt;
    } else if (u.id === "unit_mech") {
      const tw = nearestTowerFor(u.side, u.x, u.y);
      if (tw && dist(u, tw) < 260) { tgt = tw; isUnit = false; } // Belagerung: Türme ignorieren Units
    } else if (u.id === "unit_tactician" && inSight.length > 1) {
      let best = inSight[0], bn = -1; // dichtestes Cluster
      for (const f of inSight) {
        const n = inSight.filter(o => Math.hypot(o.x - f.x, o.y - f.y) < 70).length;
        if (n > bn) { bn = n; best = f; }
      }
      tgt = best; isUnit = true;
    }
    const sight = 200;
    if (!tgt) {
      tgt = nearestInRange(u, foes, sight);
      isUnit = !!tgt;
    }
    if (!tgt) tgt = nearestTowerFor(u.side, u.x, u.y);
    if (!tgt) continue;
    const d = dist(u, tgt);
    const rng = isUnit ? Math.max(u.range, 26) : Math.max(u.range, 30) + (tgt.r || 20);
    if (d <= rng) {
      if (u.cd <= 0) {
        // tactician EMP on first contact
        if (u.id === "unit_tactician" && !u.didStun) {
          u.didStun = true;
          for (const f of foesAll) {
            if (dist(f, tgt) < 70) { f.stun = 1.5; addFloat(f.x, f.y - 22, "⚡STUN", "#c26bff"); }
          }
          addFloat(u.x, u.y - 24, "💥 EMP!", "#c26bff");
          burst(u.x, u.y, "#c26bff", 14);
        }
        hitTarget(u, tgt);
        // marksman passive
        if (u.id === "unit_marksman") {
          if (u.lastTgt === tgt) { u.hits++; if (u.hits >= 3) u.cd = u.atkSpd * 0.9; else u.cd = u.atkSpd; }
          else { u.hits = 1; u.cd = u.atkSpd; }
          u.lastTgt = tgt;
        } else u.cd = u.atkSpd;
      }
    } else {
      const w = waypointFor(u, tgt.x, tgt.y);
      // B1: Fernkämpfer halten Distanz statt in Nahkampf zu laufen
      const ranged = u.range > 60;
      if (!(ranged && isUnit && d < u.range * 0.8)) {
        moveToward(u, w.x, w.y, dt);
        separate(u, dt); // B1: kein Stacking
        // B7: Brücken-Staub
        if (u.y > 330 && u.y < 390 && Math.random() < dt * 8 && S.parts.length < 200) {
          S.parts.push({ x: u.x + (Math.random() * 10 - 5), y: u.y + 10, vx: 0, vy: -15, t: 0.4, life: 0.4, c: "#8fa3b0", s: 2 });
        }
      }
      u.lastTgt = null; u.hits = 0;
    }
  }
  // Sterbe-Effekte einsammeln, dann filtern
  for (const u of S.units) {
    if (u.hp <= 0 && !u._deadFx) {
      u._deadFx = true;
      burst(u.x, u.y, COLOR[u.id] || "#fff", u.id === "unit_mech" ? 22 : 12);
      S.rings.push({ x: u.x, y: u.y, t: 0.35, max: 0.35, c: COLOR[u.id] || "#fff" });
    }
  }
  S.units = S.units.filter(u => u.hp > 0);

  // towers shoot (treffen auch Luft)
  for (const t of [...S.towersP, ...S.towersB]) {
    if (!t.alive) continue;
    if (t.isKing && t.sleeping) continue;
    t.cd -= dt;
    if (t.cd > 0) continue;
    const foes = S.units.filter(u => u.side !== t.side && u.hp > 0 && dist(u, t) <= t.range + u.r);
    if (!foes.length) continue;
    // B1: Türme verschwenden keinen Schuss am Mech-Schild
    foes.sort((a, b) => ((a.shield ? 1 : 0) - (b.shield ? 1 : 0)) || (dist(a, t) - dist(b, t)));
    const tgt = foes[0];
    hurtUnit(tgt, t.dmg, "tower");
    burst(t.x, t.y - 20, t.side === "P" ? "#35c4ff" : "#ff2f92", 3, 60);
    S.tracers.push({ x1: t.x, y1: t.y - 20, x2: tgt.x, y2: tgt.y, t: 0.12, c: t.side === "P" ? "#35c4ff" : "#ff2f92", w: 3 });
    t.cd = t.atkSpd;
  }

  // fx
  for (const tr of S.tracers) tr.t -= dt;
  S.tracers = S.tracers.filter(t => t.t > 0);
  if (S.tracers.length > 60) S.tracers.splice(0, S.tracers.length - 60); // B10: Cap
  for (const f of S.floats) { f.t -= dt; f.y -= 24 * dt; }
  S.floats = S.floats.filter(f => f.t > 0);
  for (const p of S.parts) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt; }
  S.parts = S.parts.filter(p => p.t > 0);
  for (const r of S.rings) r.t -= dt;
  S.rings = S.rings.filter(r => r.t > 0);
  if (S.shake > 0) S.shake -= dt * 30;
  if (S.flash > 0) S.flash -= dt * 1.5; // Z9
  if (S.crownFlash > 0) S.crownFlash -= dt * 1.2; // B7

  updateHUD();
}

function nearestAlly(u) {
  let best = null, bd = 1e9;
  for (const a of S.units) {
    if (a.side !== u.side || a === u || a.hp <= 0 || a.role === "Heilung") continue;
    const d = dist(a, u);
    if (d < bd) { bd = d; best = a; }
  }
  return best;
}
function nearestInRange(u, list, r) {
  let best = null, bd = 1e9;
  for (const e of list) {
    if (e.hp !== undefined && e.hp <= 0) continue;
    const d = dist(u, e) - (e.r || 10);
    if (d <= r && d < bd) { bd = d; best = e; }
  }
  return best;
}
// B1: Separation – eigene Einheiten entzerren (kein Stacking)
function separate(u, dt) {
  for (const o of S.units) {
    if (o === u || o.side !== u.side || o.hp <= 0) continue;
    const dx = u.x - o.x, dy = u.y - o.y;
    const d = Math.hypot(dx, dy);
    if (d > 0.5 && d < 24) {
      u.x += dx / d * 30 * dt; u.y += dy / d * 30 * dt;
    }
  }
}
function moveToward(u, x, y, dt) {  const d = Math.hypot(x - u.x, y - u.y);
  if (d < 2) return;
  let v = u.speed;
  if (u.slow > 0) v *= 0.6;
  if (u.dash > 0) v *= 1.8;
  v *= dt;
  u.x += (x - u.x) / d * Math.min(v, d);
  u.y += (y - u.y) / d * Math.min(v, d);
  u.x = Math.max(16, Math.min(W - 16, u.x));
  u.y = Math.max(30, Math.min(H - 20, u.y));
}
function hitTarget(u, tgt) {
  let dmg = u.dmg;
  // Sniper-Headshot: jeder 4. Treffer doppelt
  if (u.id === "unit_sniper") {
    u.shots++;
    u.aimX = tgt.x; u.aimY = tgt.y; u.aimT = 0.5; // B2: Ziellinie
    if (u.shots % 4 === 0) {
      dmg *= 2;
      addFloat(tgt.x, tgt.y - 26, "🎯 HEADSHOT!", "#ff4d4d");
    }
  }
  if (tgt.kind) { // tower object
    tgt.hp -= dmg;
    damageTower(tgt, 0, u.side); // trigger wake logic without double dmg (dmg already applied)
    if (tgt.hp <= 0) tgt.hp = 0;
  } else {
    const wasAlive = tgt.hp > 0; // Z8
    hurtUnit(tgt, dmg, u.id);
    if (Math.random() < 0.22 && tgt.hp > 0) addFloat(tgt.x, tgt.y - 18, "-" + Math.round(dmg), "#ffd9e8"); // B2: Schadenszahl
    if (wasAlive && tgt.hp <= 0 && u.side === "P") {
      S.kills[u.id] = (S.kills[u.id] || 0) + 1;
      // B4: Epic-Bounty +2 Elixir
      const tdef = unitDef(tgt.id);
      if (tdef && tdef.rarity === "epic") {
        S.elixirP = Math.min(10, S.elixirP + 2);
        addFloat(tgt.x, tgt.y - 30, "+2💧 EPIC-KILL", "#ffd700");
      }
      // B2: Killstreak-Ansage
      S.streak = (S.elapsed - S.lastKillT < 5) ? S.streak + 1 : 1;
      S.lastKillT = S.elapsed;
      if (S.streak === 3) toast("🔥 RAMPAGE – 3 Kills in 5s!");
      else if (S.streak === 5) toast("🔥🔥 UNSTOPPABLE – 5 Kills!");
    }
    // Hacker-Virus: Slow bei Treffer
    if (u.id === "unit_hacker" && tgt.hp > 0) {
      tgt.slow = 2.0;
      if (Math.random() < 0.4) addFloat(tgt.x, tgt.y - 22, "🦠 VIRUS", "#b6ff2f");
    }
  }
  S.tracers.push({ x1: u.x, y1: u.y - 8, x2: tgt.x, y2: tgt.y, t: 0.12, c: COLOR[u.id] || "#fff", w: u.id === "unit_sniper" ? 3 : 2 });
  burst(tgt.x, tgt.y, COLOR[u.id] || "#fff", 2, 50);
  burst(u.x, u.y - 8, COLOR[u.id] || "#fff", 1, 30); // Z3: Mündungsfunke am Angreifer
}

function lowestTowerHp(side) {
  const tw = (side === "P" ? S.towersP : S.towersB).filter(t => t.alive);
  if (!tw.length) return 0;
  return Math.min(...tw.map(t => t.hp / t.maxHp));
}

// ---------- bot AI ----------
function botUpdate(dt) {
  if (!S.running || S.over) return;
  S.botClock -= dt * 1000;
  if (S.botClock > 0) return;
  const ai = S.bot.ai_profile;
  S.botClock = ai.reaction_delay_ms * (0.85 + Math.random() * 0.3);
  const eff = ai.efficiency ?? ai.elixir_efficiency ?? 0.7;
  // pick affordable
  const afford = S.bot.deck.filter(id => unitDef(id).elixir_cost <= S.elixirB);
  if (!afford.length) return;
  if (Math.random() > eff + (S.overtime ? 0.15 : 0)) return; // waste-less play
  // B3: kein Overcommit (max 5 eigene Units, sonst halten)
  if (S.units.filter(u => u.side === "B" && u.hp > 0).length >= 5 && Math.random() < 0.7) return;
  // B3: für BOSS sparen (4–6 Elixir, 35 % halten)
  if (S.bot.deck.includes("unit_mech") && S.elixirB >= 4 && S.elixirB < 6 && Math.random() < 0.35) return;

  const strat = ai.strategy || "";
  let id = afford[Math.floor(Math.random() * afford.length)];
  // synergy strategies
  const has = x => S.bot.deck.includes(x);
  if (/Stun/i.test(strat) && has("unit_tactician") && afford.includes("unit_tactician")) {
    const enemyPush = S.units.some(u => u.side === "P" && u.y < 420);
    if (enemyPush && Math.random() < 0.7) id = "unit_tactician";
  }
  if (/Tank.*Medic|Predictive|Tank & Sustain/i.test(strat)) {
    const tanks = S.units.filter(u => u.side === "B" && u.id === "unit_brawler");
    if (tanks.length && afford.includes("unit_medic") && Math.random() < 0.75) id = "unit_medic";
    else if (afford.includes("unit_brawler") && Math.random() < 0.6) id = "unit_brawler";
  }
  if (/Counter|Kite|Defens/i.test(strat)) {
    const threat = S.units.filter(u => u.side === "P" && u.y < 450);
    if (!threat.length && Math.random() < 0.55) return; // hold elixir
    if (threat.length && afford.includes("unit_marksman")) id = "unit_marksman";
  }
  // Drohnen-Konter: Luftabwehr priorisieren
  if (S.units.some(u => u.side === "P" && u.flying && u.hp > 0)) {
    const aa = afford.filter(x => ["unit_marksman", "unit_sniper", "unit_hacker", "unit_drone"].includes(x));
    if (aa.length && Math.random() < 0.8) id = aa[Math.floor(Math.random() * aa.length)];
  }
  // Mech als Tank-Ersatz hoch gewichten
  if (afford.includes("unit_mech") && !S.units.some(u => u.side === "B" && (u.id === "unit_brawler" || u.id === "unit_mech")) && Math.random() < 0.5) id = "unit_mech";
  // Z6: Ninja jagt feindliche Backline, Sniper kontert Tanks
  if (afford.includes("unit_ninja") && S.units.some(u => u.side === "P" && ["unit_marksman", "unit_sniper", "unit_medic", "unit_hacker"].includes(u.id) && u.hp > 0) && Math.random() < 0.6) id = "unit_ninja";
  if (afford.includes("unit_sniper") && S.units.some(u => u.side === "P" && (u.id === "unit_brawler" || u.id === "unit_mech") && u.hp > 0) && Math.random() < 0.6) id = "unit_sniper";

  // lane choice
  let lane;
  if (/Single Lane|Lane Rusher|Bridge Spam|Aggressive/i.test(strat)) {
    lane = S._botLane ?? (S._botLane = Math.random() < 0.5 ? 0 : 1);
  } else if (/Split/i.test(strat)) {
    lane = Math.random() < 0.5 ? 0 : 1;
  } else {
    // attack weakest player princess
    const [l, r] = S.towersP;
    lane = (l.alive && r.alive) ? (l.hp <= r.hp ? 0 : 1) : (l.alive ? 0 : 1);
    if (Math.random() < 0.25) lane = 1 - lane;
  }
  // defensive: spawn near threat
  let x = lane === 0 ? 120 : 360, y = 300;
  const threat = S.units.filter(u => u.side === "P" && u.y < 400);
  // B3: Profi-Finte (12 % andere Lane)
  if (S.bot.tier === "Profi" && Math.random() < 0.12) x = W - x;
  // B3: Medic-Eskorte hinter eigenem Tank (hat Vorrang)
  let escorted = false;
  if (id === "unit_medic") {
    const tank = S.units.find(u => u.side === "B" && u.hp > 0 && (u.id === "unit_brawler" || u.id === "unit_mech"));
    if (tank) {
      x = Math.max(40, Math.min(W - 40, tank.x + (Math.random() * 40 - 20)));
      y = Math.max(60, Math.min(320, tank.y - 55));
      escorted = true;
    }
  }
  if (!escorted && threat.length && /Defens|Counter|Balanced|Kite/i.test(strat)) {
    const t0 = threat[0];
    x = Math.max(40, Math.min(W - 40, t0.x + (Math.random() * 60 - 30)));
    y = Math.max(60, Math.min(320, t0.y - 60));
  } else if (!escorted) {
    x += Math.random() * 60 - 30;
    // B3: Overtime-Aggression (nah an der Brücke)
    y = S.overtime ? 270 + Math.random() * 50 : 200 + Math.random() * 110;
    if (/Bridge Spam/i.test(strat)) y = 300 + Math.random() * 20;
  }
  if (unitDef(id).elixir_cost <= S.elixirB) spawnUnit("B", id, x, y);
}

// ---------- end / HUD ----------
function endMatch(res, reason) {
  if (S.over) return;
  S.over = true; S.running = false; S.result = res;
  AudioSys.stop();
  AudioSys.jingle(res === "win"); // B5
  // Credits-Belohnung + Streak (B4)
  const lv = DATA.leveling || {};
  let reward = res === "win" ? (lv.reward_win ?? 150) : res === "draw" ? (lv.reward_draw ?? 75) : (lv.reward_loss ?? 50);
  if (res === "win") {
    SAVE.streak++;
    reward += Math.min(100, 25 * (SAVE.streak - 1));
    SAVE.record.w++;
  } else {
    SAVE.streak = 0;
    if (res === "draw") SAVE.record.d++; else SAVE.record.l++;
  }
  SAVE.lastResult = res;
  SAVE.credits += reward; persist(); renderCredits();
  // Z8: MVP
  let mvp = "";
  const entries = Object.entries(S.kills);
  if (entries.length) {
    entries.sort((a, b) => b[1] - a[1]);
    const def = unitDef(entries[0][0]);
    if (def && entries[0][1] > 0) mvp = " · MVP: " + def.name + " (" + entries[0][1] + " Kills)";
  }
  const t = EL("end-title"), d = EL("end-detail");
  t.className = res === "win" ? "win" : res === "lose" ? "lose" : "";
  t.textContent = res === "win" ? "SIEG! 🏆" : res === "lose" ? "NIEDERLAGE" : "UNENTSCHIEDEN";
  d.textContent = reason + " · Türme " + S.crownsP + ":" + S.crownsB + " · +" + reward + " Credits" + mvp + " · " + S.bot.username + " (" + S.bot.tier + ")";
  EL("end-overlay").classList.remove("hidden");
  renderRecord(); // B6
  // B6: Konter-Tipp nach Niederlage
  if (res === "lose") {
    const tips = ["Tipp: Sniper-Pepe kontert Tanks aus der Ferne.", "Tipp: Bomber-Pingu blendet Pushs – dann kontern.", "Tipp: Spion-Drohne braucht Luftabwehr beim Gegner.", "Tipp: Heiler-Pepe hinterm BOSS halten.", "Tipp: Turm-Bounty +3💧 – aggressiv traden."];
    setTimeout(() => toast("💡 " + tips[Math.floor(Math.random() * tips.length)], 300), 600);
  }
  updateTimerUI();
}

function updatePips() {
  const mk = tw => tw.map(t => `<span class="pip ${t.alive ? "" : ""} ${t.alive ? (t.side === "P" ? "alive-player" : "alive-enemy") : ""}"></span>`).join("");
  EL("enemy-pips").innerHTML = mk(S.towersB.length ? S.towersB : [{}, {}, {}]);
  EL("player-pips").innerHTML = mk(S.towersP.length ? S.towersP : [{}, {}, {}]);
}

function renderHand() {
  const hand = EL("hand");
  hand.innerHTML = "";
  S.hand.forEach((id, i) => {
    const def = unitDef(id);
    if (!def) return;
    const lvl = levelOf(id);
    const d = document.createElement("div");
    d.className = "hand-card rarity-" + (def.rarity || "common") + (i === S.sel ? " sel" : "") + (S.elixirP < def.elixir_cost ? " poor" : "");
    d.innerHTML = `<span class="cost">${def.elixir_cost}</span><span class="lvl">Lv${lvl}</span><span class="ico">${ICON[id]}</span><span class="nm">${def.name}</span>`;
    d.onclick = () => {
      if (S.elixirP < def.elixir_cost) { toast(`🔒 ${def.name} braucht ${def.elixir_cost}💧!`); return; } // B6
      S.sel = S.sel === i ? -1 : i; renderHand();
    };
    hand.appendChild(d);
  });
  const nxt = S.queue[0];
  const ndef = nxt ? unitDef(nxt) : null; // B6: Next mit Kosten
  EL("next-icon").innerHTML = nxt ? ICON[nxt] + `<small>${ndef.elixir_cost}💧</small>` : "?";
}

function updateHUD() {
  EL("elixir-num").textContent = Math.floor(S.elixirP) + "/10";
  EL("elixir-fill").style.width = (S.elixirP / 10 * 100) + "%";
  const rate = DATA.battle_settings.elixir.recharge_rate_per_sec * (S.overtime ? DATA.battle_settings.elixir.overtime_multiplier : 1);
  const need = Math.ceil(S.elixirP) >= 10 ? 0 : (Math.ceil(S.elixirP) - S.elixirP) / rate;
  EL("elixir-refill").textContent = S.elixirP >= 10 ? "Elixir voll!" : "füllt sich in: " + need.toFixed(1) + "s";
  EL("elixir-bar").classList.toggle("full", S.elixirP >= 10); // B8
  const ee = EL("enemy-elixir-fill");
  if (ee) ee.style.width = (S.elixirB / 10 * 100) + "%";
  // cheap periodic hand refresh for affordability dimming
  if (!updateHUD._t || performance.now() - updateHUD._t > 400) {
    updateHUD._t = performance.now(); renderHand();
  }
  updateTimerUI();
}
function updateTimerUI() {
  const el = EL("match-timer");
  el.classList.toggle("urgent", !S.overtime && S.running && S.timeLeft <= 10); // B8
  if (!S.overtime) { el.textContent = fmt(S.timeLeft); el.classList.remove("ot"); EL("match-phase").textContent = S.running ? "KAMPF" : S.over ? "ENDE" : "BEREIT"; }
  else { el.textContent = "⏱" + fmt(S.otLeft); el.classList.add("ot"); EL("match-phase").textContent = "SUDDEN DEATH ×2"; }
}

// ---------- rendering ----------
// vorgebackene Leiterbahnen (deterministisch, einmalig erzeugt)
let TRACES = null;
function traces() {
  if (TRACES) return TRACES;
  TRACES = [];
  let seed = 1337;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < 46; i++) {
    const horiz = rnd() < 0.5;
    const len = 40 + rnd() * 130;
    const x = rnd() * W, y = 20 + rnd() * (H - 40);
    TRACES.push({ x, y, horiz, len, c: y < H / 2 ? "255,47,146" : "53,196,255", dot: rnd() < 0.7 });
  }
  return TRACES;
}
function drawTraces() {
  for (const tr of traces()) {
    ctx.strokeStyle = `rgba(${tr.c},0.16)`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tr.x, tr.y);
    if (tr.horiz) {
      const mx = tr.x + tr.len / 2;
      ctx.lineTo(mx, tr.y); ctx.lineTo(mx, tr.y + 18); ctx.lineTo(tr.x + tr.len, tr.y + 18);
    } else ctx.lineTo(tr.x, tr.y + tr.len);
    ctx.stroke();
    if (tr.dot) {
      ctx.fillStyle = `rgba(${tr.c},0.35)`;
      ctx.beginPath(); ctx.arc(tr.horiz ? tr.x + tr.len : tr.x, tr.horiz ? tr.y + 18 : tr.y + tr.len, 2.5, 0, 7); ctx.fill();
    }
  }
}
function drawGrid(now) {
  // Circuit-Board: dunkle Platte mit Kachelschrift
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#131728"); bg.addColorStop(0.45, "#0d1420");
  bg.addColorStop(0.55, "#0d1420"); bg.addColorStop(1, "#1a1024");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(120,150,190,0.10)"; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  drawTraces();
  // Lane-Lichtbahnen wie im Screenshot (oben pink/Gegner, unten blau/Pepe)
  const beam = (x, cTop, cBot) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, cTop); g.addColorStop(0.47, "transparent");
    g.addColorStop(0.53, "transparent"); g.addColorStop(1, cBot);
    ctx.fillStyle = g; ctx.fillRect(x - 13, 0, 26, H);
  };
  beam(120, "rgba(255,47,146,0.20)", "rgba(53,196,255,0.20)");
  beam(360, "rgba(255,47,146,0.20)", "rgba(53,196,255,0.20)");
  // B7: Overtime-Beams glühen stärker
  if (S.overtime) {
    ctx.fillStyle = "rgba(255,47,146,0.10)"; ctx.fillRect(107, 0, 26, H);
    ctx.fillRect(347, 0, 26, H);
  }
  // Chevrons auf den Bahnen
  const t = (now || 0) / 1000;
  ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
  for (const bx of [120, 360]) {
    for (let i = 0; i < 6; i++) {
      const yT = 60 + i * 44 + ((t * 30) % 44), yB = H - 60 - i * 44 - ((t * 30) % 44);
      ctx.fillStyle = "rgba(255,47,146,0.5)"; ctx.fillText("∨", bx, yT);
      ctx.fillStyle = "rgba(53,196,255,0.5)"; ctx.fillText("∧", bx, yB);
    }
  }
  // Hälften-Tönung
  ctx.fillStyle = "rgba(255,47,146,0.05)"; ctx.fillRect(0, 0, W, 340);
  ctx.fillStyle = "rgba(53,196,255,0.05)"; ctx.fillRect(0, 380, W, H - 380);
  // Datenstrom-Fluss mit Binär-Code
  const g = ctx.createLinearGradient(0, 340, 0, 380);
  g.addColorStop(0, "#0a1a2e"); g.addColorStop(0.5, "#14324a"); g.addColorStop(1, "#0a1a2e");
  ctx.fillStyle = g; ctx.fillRect(0, 340, W, 40);
  ctx.strokeStyle = "#35c4ff"; ctx.lineWidth = 1.5; ctx.shadowColor = "#35c4ff"; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.moveTo(0, 340); ctx.lineTo(W, 340); ctx.stroke();
  ctx.strokeStyle = "#ff2f92"; ctx.shadowColor = "#ff2f92";
  ctx.beginPath(); ctx.moveTo(0, 380); ctx.lineTo(W, 380); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = "9px monospace"; ctx.textAlign = "left";
  for (let r = 0; r < 2; r++) {
    ctx.fillStyle = r ? "rgba(255,47,146,0.55)" : "rgba(53,196,255,0.55)";
    let s = "";
    for (let i = 0; i < 60; i++) s += ((i * 7 + r * 3 + (t * 4 | 0)) % 3 === 0) ? "1" : "0";
    ctx.fillText(s, -((t * 30) % 20), 352 + r * 14);
  }
  // Gate-Brücken mit Gitter (Screenshot 3)
  for (const bx of [120, 360]) {
    ctx.fillStyle = "#101c2c"; ctx.fillRect(bx - 32, 328, 64, 64);
    ctx.strokeStyle = "#35c4ff"; ctx.lineWidth = 2; ctx.shadowColor = "#35c4ff"; ctx.shadowBlur = 6;
    ctx.strokeRect(bx - 32, 328, 64, 64); ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(120,200,255,0.4)"; ctx.lineWidth = 1;
    for (let gx = bx - 32; gx <= bx + 32; gx += 8) { ctx.beginPath(); ctx.moveTo(gx, 328); ctx.lineTo(gx, 392); ctx.stroke(); }
    for (let gy = 328; gy <= 392; gy += 8) { ctx.beginPath(); ctx.moveTo(bx - 32, gy); ctx.lineTo(bx + 32, gy); ctx.stroke(); }
    ctx.fillStyle = "#35c4ff";
    for (const [cx, cy] of [[bx - 32, 328], [bx + 32, 328], [bx - 32, 392], [bx + 32, 392]]) {
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
    }
  }
  // Deploy-Highlight
  if (S.running && S.sel >= 0) {
    ctx.fillStyle = "rgba(53,196,255,0.07)"; ctx.fillRect(0, 395, W, H - 395);
    ctx.strokeStyle = "rgba(53,196,255,0.6)"; ctx.setLineDash([8, 6]);
    ctx.strokeRect(4, 399, W - 8, H - 403); ctx.setLineDash([]);
  }
  // Scanlines
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
}

function hpBar(x, y, w, pct, c) {
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(x - w / 2, y, w, 6);
  ctx.fillStyle = c; ctx.fillRect(x - w / 2, y, w * Math.max(0, pct), 6);
}

function drawTower(t, now) {
  const c = t.side === "P" ? "#35c4ff" : "#ff2f92";
  if (!t.alive) {
    // Ruine: zerbrochener Bunker + Glut
    ctx.save(); ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#141a26";
    ctx.fillRect(t.x - 20, t.y - 6, 40, 20);
    ctx.strokeStyle = "rgba(255,47,146,0.5)"; ctx.lineWidth = 1.5;
    ctx.strokeRect(t.x - 20, t.y - 6, 40, 20);
    const flick = 0.4 + 0.3 * Math.sin((now || 0) / 200 + t.x);
    ctx.fillStyle = `rgba(255,80,40,${flick})`;
    ctx.beginPath(); ctx.arc(t.x - 4, t.y + 8, 3, 0, 7); ctx.arc(t.x + 7, t.y + 10, 2, 0, 7); ctx.fill();
    ctx.restore(); return;
  }
  const pct = t.hp / t.maxHp;
  const low = pct < 0.3;
  const R = t.r + 4;
  ctx.save();
  if (S.shake > 0) ctx.translate(Math.random() * 3, Math.random() * 3);
  // Plattform (B7: pulsierender Padring)
  ctx.fillStyle = "#0b1220";
  ctx.beginPath(); ctx.ellipse(t.x, t.y + R + 4, R + 10, 9, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = c; ctx.globalAlpha = 0.45 + 0.2 * Math.sin((now || 0) / 400 + t.x); ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
  // Bunker-Körper (abgerundetes Quadrat)
  const bodyG = ctx.createLinearGradient(t.x - R, 0, t.x + R, 0);
  bodyG.addColorStop(0, "#101725"); bodyG.addColorStop(0.5, "#2c3d5c"); bodyG.addColorStop(1, "#101725");
  ctx.fillStyle = bodyG;
  ctx.beginPath(); ctx.roundRect(t.x - R, t.y - R, R * 2, R * 2, 7); ctx.fill();
  ctx.strokeStyle = low ? "#ff3030" : c; ctx.lineWidth = 2.5;
  ctx.shadowColor = low ? "#ff3030" : c; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
  // Ecken-Nieten
  ctx.fillStyle = c;
  for (const [nx, ny] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath(); ctx.arc(t.x + nx * (R - 5), t.y + ny * (R - 5), 2, 0, 7); ctx.fill();
  }
  // Besatzung: Frosch (Pepe-Seite) / Schwein (Bande)
  ctx.font = (t.kind === "king" ? 24 : 19) + "px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(t.side === "P" ? "🐸" : "🐷", t.x, t.y + 1);
  if (t.kind === "king") {
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin((now || 0) / 350); // B7: Kronen-Puls
    ctx.font = "15px sans-serif"; ctx.fillText("👑", t.x, t.y - R + 12);
    ctx.globalAlpha = 1;
  }
  if (t.isKing && t.sleeping) { ctx.font = "12px sans-serif"; ctx.fillStyle = "#7d95a3"; ctx.fillText("💤", t.x + R + 8, t.y - R); }
  // Schildkuppel
  ctx.strokeStyle = low ? "rgba(255,48,48,0.5)" : c === "#35c4ff" ? "rgba(53,196,255,0.45)" : "rgba(255,47,146,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(t.x, t.y, R + 10, 0, 7); ctx.stroke();
  ctx.globalAlpha = 0.07; ctx.fillStyle = c;
  ctx.beginPath(); ctx.arc(t.x, t.y, R + 10, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;
  // Rauch bei niedrigem HP
  if (low && Math.random() < 0.25) S.parts.push({ x: t.x + (Math.random() * 20 - 10), y: t.y - 14, vx: 0, vy: -40, t: 0.8, life: 0.8, c: "#555", s: 3 });
  ctx.restore();
  // HP-Label mit Krone wie im Screenshot
  ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
  ctx.fillStyle = "#fff"; ctx.fillText("👑 " + Math.ceil(t.hp), t.x, t.y - R - 16);
  hpBar(t.x, t.y - R - 12, t.kind === "king" ? 66 : 54, pct, low ? "#ff3030" : c);
}

// Rollen-Silhouetten unter dem Emoji
function drawUnitBody(u, bob) {
  const col = COLOR[u.id] || "#fff";
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
  ctx.save();
  ctx.translate(u.x, u.y + bob);
  if (u.dash > 0) { // Speed-Streifen
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(-u.r - 14, -3); ctx.lineTo(-u.r + 2, -3); ctx.moveTo(-u.r - 14, 3); ctx.lineTo(-u.r + 2, 3); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  switch (u.id) {
    case "unit_ninja": // Dreieck-Klinge
      ctx.beginPath(); ctx.moveTo(0, -u.r - 4); ctx.lineTo(u.r, u.r); ctx.lineTo(-u.r, u.r); ctx.closePath();
      ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
      break;
    case "unit_drone": // Rotor-X + Kuppel
      ctx.beginPath(); ctx.moveTo(-u.r - 5, -u.r - 3); ctx.lineTo(u.r + 5, -u.r - 3);
      ctx.moveTo(-u.r - 5, -u.r + 3); ctx.lineTo(u.r + 5, -u.r + 3); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, u.r - 3, 0, 7); ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
      break;
    case "unit_mech": // eckiger Panzer
      ctx.globalAlpha = 0.3; ctx.fillRect(-u.r, -u.r, u.r * 2, u.r * 2); ctx.globalAlpha = 1;
      ctx.strokeRect(-u.r, -u.r, u.r * 2, u.r * 2);
      if (u.shield) { // Schildring
        ctx.strokeStyle = "#ffa62b"; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.arc(0, 0, u.r + 5, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      }
      break;
    case "unit_sniper": // Visier-Kreis
      ctx.beginPath(); ctx.arc(0, 0, u.r + 2, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-u.r - 4, 0); ctx.lineTo(-u.r + 3, 0); ctx.moveTo(u.r - 3, 0); ctx.lineTo(u.r + 4, 0); ctx.stroke();
      break;
    case "unit_hacker":
      ctx.beginPath(); ctx.arc(0, 0, u.r + 1, 0, 7); ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
      break;
    default: // Kreis-Basis
      ctx.beginPath(); ctx.arc(0, 0, u.r, 0, 7);
      ctx.globalAlpha = 0.22; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
  }
  ctx.restore();
  // Drohnen-Schatten am Boden
  if (u.flying) {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath(); ctx.ellipse(u.x, u.y + 22, 10, 4, 0, 0, 7); ctx.fill();
  }
}

function drawUnit(u, now) {
  const c = u.side === "P" ? "#35c4ff" : "#ff2f92";
  const bob = Math.sin((now || 0) / 180 + u.seed) * (u.flying ? 3.5 : 1.8);
  // Medic-Aura
  if (u.id === "unit_medic" && u.hp > 0) {
    const pr = 3.0 * PX_PER_FIELD + Math.sin((now || 0) / 400) * 3;
    ctx.strokeStyle = "rgba(81,255,122,0.35)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(u.x, u.y, pr, 0, 7); ctx.stroke();
    ctx.fillStyle = "rgba(81,255,122,0.08)";
    ctx.beginPath(); ctx.arc(u.x, u.y, pr, 0, 7); ctx.fill();
  }
  // B2: Slow-Ring unter der Einheit
  if (u.slow > 0) {
    ctx.strokeStyle = "rgba(120,200,255,0.7)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(u.x, u.y + bob, u.r + 4, 0, 7); ctx.stroke();
  }
  drawUnitBody(u, bob);
  const y = u.y + bob;
  // Emoji-Kern
  ctx.font = "15px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(ICON[u.id] || "•", u.x, y + 5);
  // B2: Sniper-Ziellinie
  if (u.aimT > 0 && u.aimX !== undefined) {
    ctx.strokeStyle = "rgba(255,80,80,0.6)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(u.x, y); ctx.lineTo(u.aimX, u.aimY); ctx.stroke(); ctx.setLineDash([]);
  }
  // Status-Icons
  let sy = y - u.r - 12;
  ctx.font = "11px sans-serif";
  if (u.stun > 0) {
    // B2: kreisende Sterne statt statischem Blitz
    const st = (S.elapsed * 6 + u.seed) % 6.28;
    for (let k = 0; k < 3; k++) {
      const a = st + k * 2.09;
      ctx.fillText("✦", u.x + Math.cos(a) * (u.r + 4), sy + Math.sin(a) * 5);
    }
  }
  if (u.slow > 0) { ctx.fillText("🐌", u.x + 8, sy); }
  if (u.flying) { ctx.fillText("✈", u.x + 8, sy - 12); }
  // HP + Level-Pill wie im Screenshot
  hpBar(u.x, y + u.r + 4, 32, u.hp / u.maxHp, u.side === "P" ? "#35c4ff" : "#ff2f92");
  const pillC = u.side === "P" ? "#1f8fd0" : "#d02070";
  ctx.fillStyle = pillC;
  ctx.beginPath(); ctx.roundRect(u.x - u.r - 13, y - u.r - 13, 24, 15, 5); ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(u.x - u.r - 13, y - u.r - 13, 24, 15, 5); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(u.lvl, u.x - u.r - 1, y - u.r - 1);
  if (u.lvl >= 5) {
    ctx.fillStyle = "#ffd700"; ctx.font = "9px sans-serif";
    ctx.fillText("★", u.x + u.r + 6, y - u.r - 1);
  }
}

// ---------- Menü-Szene: Ghetto-Straße wie im Artwork ----------
let MENUDECOR = null;
function menuDecor() {
  if (MENUDECOR) return MENUDECOR;
  let seed = 777;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const stars = [];
  for (let i = 0; i < 40; i++) stars.push([rnd() * W, rnd() * 110, 0.5 + rnd()]);
  const tags = [];
  const cols = ["#e8ff2f", "#ff2f2f", "#2fff62", "#35c4ff", "#ff2f92"];
  for (let i = 0; i < 9; i++) {
    const pts = [];
    let x = 55 + rnd() * 370, y = 130 + rnd() * 190;
    for (let j = 0; j < 5; j++) { pts.push([x, y]); x += (rnd() - 0.4) * 70; y += (rnd() - 0.5) * 36; }
    tags.push({ pts, c: cols[i % cols.length] });
  }
  const trash = [];
  for (let i = 0; i < 14; i++) trash.push([rnd() * W, 560 + rnd() * 130, rnd() * 6.28]);
  MENUDECOR = { stars, tags, trash };
  return MENUDECOR;
}
function drawCar(x, y, w, body, cabin, plate, lightC) {
  // Karosse
  ctx.fillStyle = "#0b0e14";
  ctx.beginPath(); ctx.roundRect(x, y - 46, w, 46, 8); ctx.fill();
  ctx.strokeStyle = body; ctx.lineWidth = 2; ctx.shadowColor = body; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.roundRect(x, y - 46, w, 46, 8); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.fillStyle = "#131a28";
  ctx.beginPath(); ctx.roundRect(x + w * 0.18, y - 72, w * 0.55, 30, 6); ctx.fill();
  ctx.strokeStyle = body; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x + w * 0.18, y - 72, w * 0.55, 30, 6); ctx.stroke();
  // Scheinwerfer-Kegel
  const g = ctx.createLinearGradient(x + w, 0, x + w + 90, 0);
  g.addColorStop(0, lightC); g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x + w - 4, y - 34); ctx.lineTo(x + w + 90, y - 44); ctx.lineTo(x + w + 90, y - 6); ctx.lineTo(x + w - 4, y - 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#dff6ff";
  ctx.beginPath(); ctx.arc(x + w - 3, y - 24, 5, 0, 7); ctx.fill();
  // Räder
  for (const wx of [x + w * 0.22, x + w * 0.78]) {
    ctx.fillStyle = "#05070b"; ctx.beginPath(); ctx.arc(wx, y, 17, 0, 7); ctx.fill();
    ctx.strokeStyle = "#3a4a5c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(wx, y, 10, 0, 7); ctx.stroke();
  }
  // Kennzeichen
  ctx.fillStyle = "#f2f5f7"; ctx.fillRect(x + w / 2 - 28, y - 22, 56, 13);
  ctx.fillStyle = "#123"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(plate, x + w / 2, y - 12);
}
function drawMenuScene(now) {
  const t = (now || 0) / 1000;
  const D = menuDecor();
  // Nachthimmel
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, "#04070d"); sky.addColorStop(1, "#0e1a2b");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 380);
  for (const [sx, sy, r] of D.stars) {
    ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 2 + sx); ctx.fillStyle = "#cfe8ff";
    ctx.fillRect(sx, sy, r, r); ctx.globalAlpha = 1;
  }
  // Mond-Glow
  const moon = ctx.createRadialGradient(80, 50, 4, 80, 50, 90);
  moon.addColorStop(0, "rgba(220,235,255,0.5)"); moon.addColorStop(1, "transparent");
  ctx.fillStyle = moon; ctx.fillRect(0, 0, 200, 160);
  ctx.fillStyle = "#e8f1fb"; ctx.beginPath(); ctx.arc(80, 50, 22, 0, 7); ctx.fill();
  ctx.fillStyle = "#b9c9da"; ctx.beginPath(); ctx.arc(72, 44, 5, 0, 7); ctx.arc(88, 56, 4, 0, 7); ctx.fill();
  // Graffiti-Gebäude
  ctx.fillStyle = "#191423"; ctx.fillRect(40, 120, 400, 230);
  ctx.fillStyle = "#221a30"; ctx.fillRect(40, 120, 400, 14);
  ctx.fillStyle = "#2c2238";
  for (let wy = 150; wy < 330; wy += 44)
    for (let wx = 56; wx < 424; wx += 40) ctx.fillRect(wx, wy, 24, 30);
  ctx.fillStyle = "rgba(255,220,120,0.25)";
  for (let wy = 150; wy < 330; wy += 44)
    for (let wx = 56; wx < 424; wx += 40)
      if ((wx + wy) % 3 === 0) ctx.fillRect(wx, wy, 24, 30);
  // Graffiti-Tags
  ctx.lineWidth = 4; ctx.lineCap = "round";
  for (const tag of D.tags) {
    ctx.strokeStyle = tag.c; ctx.globalAlpha = 0.75; ctx.shadowColor = tag.c; ctx.shadowBlur = 10;
    ctx.beginPath(); tag.pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke();
  }
  ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  // GHETTO-GAMING-Schild
  ctx.fillStyle = "#0a0f16"; ctx.fillRect(52, 96, 130, 30);
  ctx.strokeStyle = "#e8ff2f"; ctx.lineWidth = 2; ctx.shadowColor = "#e8ff2f"; ctx.shadowBlur = 12;
  ctx.strokeRect(52, 96, 130, 30); ctx.shadowBlur = 0;
  ctx.fillStyle = "#e8ff2f"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("GHETTO", 117, 109); ctx.fillText("GAMING", 117, 122);
  // Straße
  const road = ctx.createLinearGradient(0, 350, 0, H);
  road.addColorStop(0, "#141821"); road.addColorStop(1, "#080b11");
  ctx.fillStyle = road; ctx.fillRect(0, 350, W, H - 350);
  ctx.strokeStyle = "rgba(255,220,120,0.25)"; ctx.lineWidth = 2; ctx.setLineDash([18, 14]);
  ctx.beginPath(); ctx.moveTo(0, 560); ctx.lineTo(W, 560); ctx.stroke(); ctx.setLineDash([]);
  // Müll
  for (const [tx, ty, a] of D.trash) {
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(a);
    ctx.fillStyle = "#cfd8e3"; ctx.fillRect(-9, -4, 18, 8);
    ctx.fillStyle = "#35a4ff"; ctx.fillRect(-3, -4, 6, 8);
    ctx.restore();
  }
  // Mülltonnen
  for (const bx of [18, W - 18]) {
    ctx.fillStyle = "#232b36"; ctx.fillRect(bx - 16, 470, 32, 70);
    ctx.strokeStyle = "#ff7a2f"; ctx.lineWidth = 2; ctx.strokeRect(bx - 16, 470, 32, 70);
    ctx.fillStyle = "#2e3844"; ctx.fillRect(bx - 19, 462, 38, 10);
  }
  // Autos: G-Wagon (Pepe) + BMW (Bande)
  drawCar(36, 548, 170, "#35c4ff", null, "PEPE 1", "rgba(180,230,255,0.35)");
  drawCar(274, 552, 170, "#ff2f92", null, "PEPA 77", "rgba(255,180,220,0.35)");
  // Charaktere mit Idle-Bob
  const bob = i => Math.sin(t * 2 + i) * 4;
  ctx.textAlign = "center";
  const crew = [["🐸", 150, 440, 64], ["🐷", 245, 452, 72], ["🐧", 348, 446, 54]];
  crew.forEach(([e, x, y, s], i) => {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath(); ctx.ellipse(x, y + s * 0.55, s * 0.4, s * 0.12, 0, 0, 7); ctx.fill();
    ctx.font = s + "px sans-serif";
    ctx.fillText(e, x, y + bob(i));
  });
  // Titel-Schattenzeile unten (HTML-Panel liegt darüber)
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(0, H - 26, W, 26);
}

// ---------- Arena-Rahmen wie im Screenshot ----------
function drawFrame() {
  // Außenrahmen: oben pink (Bande), unten blau (Pepe)
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#ff2f92"; ctx.shadowColor = "#ff2f92"; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.roundRect(6, 6, W - 12, 348, 10); ctx.stroke();
  ctx.strokeStyle = "#35c4ff"; ctx.shadowColor = "#35c4ff";
  ctx.beginPath(); ctx.roundRect(6, 366, W - 12, H - 372, 10); ctx.stroke();
  ctx.shadowBlur = 0;
  // B7: Overtime-Tint (pinker Rand-Glow)
  if (S.overtime) {
    ctx.strokeStyle = "rgba(255,47,146,0.35)"; ctx.lineWidth = 8;
    ctx.shadowColor = "#ff2f92"; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.roundRect(6, 6, W - 12, H - 12, 10); ctx.stroke();
    ctx.shadowBlur = 0;
  }
  // Center-Emblem (Wasserzeichen)
  ctx.globalAlpha = 0.07; ctx.font = "130px sans-serif"; ctx.textAlign = "center";
  ctx.fillStyle = "#fff"; ctx.fillText("👑", W / 2, 400);
  ctx.globalAlpha = 1;
  // Seiten-Banner mit Gang-Gesichtern
  const banner = (x, c, e, label) => {
    ctx.fillStyle = "rgba(8,12,20,0.85)"; ctx.fillRect(x, 60, 26, H - 120);
    ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.strokeRect(x, 60, 26, H - 120);
    ctx.font = "20px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(e, x + 13, 110);
    ctx.fillStyle = c; ctx.font = "bold 10px sans-serif";
    for (let i = 0; i < label.length; i++) ctx.fillText(label[i], x + 13, 150 + i * 14);
  };
  banner(8, "#ff2f92", "🐷", "BANDE");
  banner(W - 34, "#35c4ff", "🐸", "PEPE");
  // Kronen-Panels rechts (Screenshot: 0 blau / 0 pink)
  const crownBox = (y, c, e, n) => {
    const hot = S.crownFlash > 0; // B7: Flash bei Kronenwechsel
    ctx.fillStyle = "rgba(8,12,20,0.9)";
    ctx.beginPath(); ctx.roundRect(W - 40, y, 34, 64, 6); ctx.fill();
    ctx.strokeStyle = c; ctx.lineWidth = hot ? 4 : 1.5;
    ctx.shadowColor = c; ctx.shadowBlur = hot ? 16 : 0;
    ctx.beginPath(); ctx.roundRect(W - 40, y, 34, 64, 6); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.font = "bold 20px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#fff";
    ctx.fillText(n, W - 23, y + 26);
    ctx.font = "18px sans-serif"; ctx.fillText(e, W - 23, y + 50);
  };
  crownBox(240, "#35c4ff", "👑", String(S.crownsP));
  crownBox(396, "#ff2f92", "👑", String(S.crownsB));
}

function draw(now) {
  ctx.save();
  if (S.shake > 0) ctx.translate((Math.random() - 0.5) * S.shake * 0.4, (Math.random() - 0.5) * S.shake * 0.4);
  // Menü-Szene solange kein Kampf läuft (Start / Gegnerwechsel)
  if (DATA && !S.running && !S.over && !S.units.length) {
    drawMenuScene(now);
    ctx.restore();
    return;
  }
  drawGrid(now);
  drawFrame();
  // Spawn-Ringe (unter allem)
  for (const r of S.rings) {
    const max = r.max || 0.45;
    const p = 1 - r.t / max;
    ctx.strokeStyle = r.c; ctx.globalAlpha = Math.min(1, r.t * 2); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(r.x, r.y, 6 + p * 30, 0, 7); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  for (const t of [...S.towersB, ...S.towersP]) drawTower(t, now);
  // Z2: Deploy-Ghost (grün = ok, rot = eigene Hälfte verlassen / kein Elixir)
  if (S.running && !S.over && S.sel >= 0 && S.px >= 0) {
    const id = S.hand[S.sel], def = unitDef(id);
    const ok = def && S.py >= 395 && S.elixirP >= def.elixir_cost;
    // B7: Reichweiten-Ring der gewählten Karte
    if (def) {
      ctx.strokeStyle = ok ? "rgba(53,196,255,0.5)" : "rgba(255,48,48,0.4)";
      ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.arc(S.px, S.py, rangePx(def), 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = ok ? "#35c4ff" : "#ff3030";
    ctx.beginPath(); ctx.arc(S.px, S.py, 13, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = ok ? "#35c4ff" : "#ff3030"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.arc(S.px, S.py, 13, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  }
  // sortiert: Boden vor Luft
  const sorted = [...S.units].sort((a, b) => (a.flying ? 1 : 0) - (b.flying ? 1 : 0));
  for (const u of sorted) drawUnit(u, now);
  // Partikel
  for (const p of S.parts) {
    ctx.globalAlpha = Math.max(0, p.t / p.life);
    ctx.fillStyle = p.c;
    if (p.plus) { ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center"; ctx.fillText("+", p.x, p.y); }
    else { ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
    ctx.globalAlpha = 1;
  }
  // Tracer mit Glow
  for (const tr of S.tracers) {
    ctx.strokeStyle = tr.c; ctx.globalAlpha = Math.min(1, tr.t * 8); ctx.lineWidth = tr.w || 2;
    ctx.shadowColor = tr.c; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(tr.x1, tr.y1); ctx.lineTo(tr.x2, tr.y2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
  // floats
  ctx.textAlign = "center"; ctx.font = "bold 12px sans-serif";
  for (const f of S.floats) {
    ctx.globalAlpha = Math.min(1, f.t);
    ctx.fillStyle = f.c; ctx.fillText(f.txt, f.x, f.y);
    ctx.globalAlpha = 1;
  }
  // Z9: Overtime-Flash
  if (S.flash > 0) {
    ctx.fillStyle = `rgba(255,47,146,${Math.max(0, S.flash) * 0.22})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

// ---------- main loop ----------
function frame(t) {
  const dt = Math.min(0.05, (t - S.lastT) / 1000 || 0.016);
  S.lastT = t;
  if (S.running && !S.over && !S.paused && DATA) update(dt); // B6: Pause
  try { draw(t); } catch (e) { console.error("draw", e); } // B10: Loop überlebt Render-Fehler
  requestAnimationFrame(frame);
}

// ---------- input ----------
cv.addEventListener("pointerdown", e => {
  if (!S.running || S.over) return;
  if (S.sel < 0) { toast("Wähle zuerst eine Karte!"); return; }
  const r = cv.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * W;
  const y = (e.clientY - r.top) / r.height * H;
  const id = S.hand[S.sel];
  spawnUnit("P", id, x, y);
});
// Z2: Ghost-Vorschau folgt dem Finger
function trackPointer(e) {
  const r = cv.getBoundingClientRect();
  S.px = (e.clientX - r.left) / r.width * W;
  S.py = (e.clientY - r.top) / r.height * H;
}
cv.addEventListener("pointermove", trackPointer, { passive: true }); // B10
cv.addEventListener("pointerleave", () => { S.px = -1; S.py = -1; });
cv.addEventListener("contextmenu", e => e.preventDefault()); // B6: kein Longpress-Menü
// B6: Tasten 1–4 wählen Karte, Esc hebt Auswahl auf
document.addEventListener("keydown", e => {
  if (e.key >= "1" && e.key <= "4") {
    const i = +e.key - 1;
    if (S.hand[i]) { S.sel = S.sel === i ? -1 : i; renderHand(); }
  } else if (e.key === "Escape") { S.sel = -1; renderHand(); }
});
// B6: Auto-Pause bei verstecktem Tab
document.addEventListener("visibilitychange", () => {
  if (document.hidden && S.running && !S.over) { S.paused = true; toast("⏸ Pause – Tab versteckt"); }
  else if (!document.hidden && S.paused) { S.paused = false; S.lastT = performance.now(); toast("▶ Weiter geht's!"); }
});

// ---------- tabs / panels ----------
function switchTab(id) {
  $$("#tabs button").forEach(b => b.classList.toggle("sel", b.dataset.tab === id));
  $$("#screens .screen").forEach(s => s.classList.toggle("active", s.id === id));
}
$$("#tabs button").forEach(b => b.onclick = () => switchTab(b.dataset.tab));

// ---------- shop: Truhen & Leveln ----------
function renderCredits() {
  const el = EL("credits-num");
  if (el) el.textContent = SAVE.credits;
}
function rollRarity(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [k, w] of Object.entries(weights)) { r -= w; if (r <= 0) return k; }
  return "common";
}
function drawCard(rarity) {
  const pool = DATA.units.filter(u => (u.rarity || "common") === rarity);
  const src = pool.length ? pool : DATA.units;
  return src[Math.floor(Math.random() * src.length)].id;
}
function openChest(chestId) {
  const chest = DATA.chests.find(c => c.id === chestId);
  if (!chest) return;
  if (SAVE.credits < chest.price) { toast("Nicht genug Credits – gewinne Kämpfe!"); return; }
  SAVE.credits -= chest.price;
  // ziehen
  const drawn = [];
  for (let i = 0; i < chest.draws; i++) drawn.push(drawCard(rollRarity(chest.weights)));
  if (chest.guarantee) {
    const ok = drawn.some(id => (unitDef(id).rarity || "common") === chest.guarantee);
    if (!ok) drawn[drawn.length - 1] = drawCard(chest.guarantee);
  }
  // B4: Core-Pity (nach 3 Truhen ohne Epic garantiert Epic-Reset)
  if (chest.id === "chest_core") {
    if (drawn.some(id => (unitDef(id).rarity || "common") === "epic")) SAVE.coreNoEpic = 0;
    else {
      SAVE.coreNoEpic++;
      if (SAVE.coreNoEpic >= 3) { drawn[0] = drawCard("epic"); SAVE.coreNoEpic = 0; }
    }
  }
  // gutschreiben + Level-Ups erkennen
  const ups = [];
  for (const id of drawn) {
    const before = levelOf(id);
    SAVE.copies[id] = (SAVE.copies[id] || 0) + 1;
    if (levelOf(id) > before) ups.push(id);
  }
  persist(); renderCredits(); renderPanels();
  AudioSys.tone(523, 0.12, "square", 0.06); AudioSys.tone(659, 0.12, "square", 0.06, 110); AudioSys.tone(784, 0.18, "square", 0.06, 220); // B5: Truhen-Arpeggio
  const box = EL("chest-reveal");
  const counts = {};
  drawn.forEach(id => counts[id] = (counts[id] || 0) + 1);
  box.innerHTML = `<div class="reveal-title">${chest.icon} ${chest.name} geöffnet!</div><div class="reveal-grid">` +
    Object.entries(counts).map(([id, n], i) => {
      const def = unitDef(id);
      const up = ups.includes(id) ? `<div class="levelup">⬆ LEVEL ${levelOf(id)}!</div>` : "";
      return `<div class="reveal-card rarity-${def.rarity || "common"}" style="animation-delay:${i * 90}ms"><span class="ico">${ICON[id]}</span><b>${n}× ${def.name}</b><span>Lv${levelOf(id)}</span>${up}</div>`;
    }).join("") + `</div><div class="reveal-sum">+${drawn.length} Karten · ${ups.length} Level-Up${ups.length === 1 ? "" : "s"}</div>`; // B6
  box.classList.remove("hidden");
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (ups.length) {
    AudioSys.tone(784, 0.14, "square", 0.07); AudioSys.tone(1047, 0.22, "square", 0.07, 130); // B5: Level-Fanfare
    toast("⬆ " + ups.map(id => unitDef(id).name + " Lv" + levelOf(id)).join(", "));
  }
  else toast(chest.icon + " +" + drawn.length + " Karten!");
}

// B6: Bilanz-Anzeige
function renderRecord() {
  const el = EL("record-line");
  if (el && SAVE) el.textContent = `Bilanz: ${SAVE.record.w}S/${SAVE.record.l}N/${SAVE.record.d}U · Streak ${SAVE.streak} · 🪙 ${SAVE.credits}`;
}
function renderPanels() {
  // deck: alle Karten mit Level & Fortschritt (B6: nach Kosten sortiert + HP-Balken)
  if (EL("deck-count")) EL("deck-count").textContent = DATA.units.length;
  EL("deck-grid").innerHTML = [...DATA.units].sort((a, b) => a.elixir_cost - b.elixir_cost).map(u => {
    const lvl = levelOf(u.id), nn = nextNeed(u.id);
    const prog = nn ? `<div class="lvlbar"><div style="width:${Math.min(100, nn.have / nn.need * 100)}%"></div></div><span class="lvltxt">${nn.have}/${nn.need} bis Lv${lvl + 1}</span>`
      : `<span class="lvltxt max">MAX LEVEL</span>`;
    return `<div class="card rarity-${u.rarity || "common"}"><span class="cost">${u.elixir_cost}💧</span><span class="lvl">Lv${lvl}</span><span class="ico">${ICON[u.id]}</span>
    <b>${u.name}</b><span class="stat">${u.role} · HP ${u.health} · DMG ${u.damage}</span>
    <div class="statbar" title="HP"><div style="width:${Math.min(100, u.health / 12)}%"></div></div>
    <p>${u.ability.name} (${u.ability.type}): ${u.ability.description}</p>${prog}</div>`;
  }).join("");
  EL("tower-grid").innerHTML = DATA.towers.map(t => `
    <div class="card"><span class="ico">${t.type === "king_tower" ? "🏰" : "🗼"}</span>
    <b>${t.name}</b><span class="stat">HP ${t.health} · DMG ${t.damage} · ${t.attack_speed_sec}s</span>
    <p>Reichweite ${t.range} · Ziel: ${t.target}${t.active_on_damage ? " · wacht bei Schaden auf" : ""}</p></div>`).join("");
  // shop: 3 Truhen (B6: mit Chancen + Rot bei Leere)
  EL("shop-grid").innerHTML = DATA.chests.map(c => {
    const w = c.weights, tot = w.common + w.rare + w.epic;
    const odds = `Chancen: ${Math.round(w.common / tot * 100)}/${Math.round(w.rare / tot * 100)}/${Math.round(w.epic / tot * 100)} % (C/R/E)`;
    const poor = SAVE.credits < c.price;
    return `<div class="card chest rarity-${c.guarantee || "common"}"><span class="chest-ico">${c.icon}</span>
    <b>${c.name}</b><p>${c.description}</p><p class="odds">${odds}</p>
    <div class="price${poor ? " cant" : ""}">🪙 ${c.price}</div>
    <button class="buy" data-chest="${c.id}" ${poor ? "disabled" : ""}>ÖFFNEN</button></div>`;
  }).join("");
  // clan (B6: Deck als Tooltip)
  EL("clan-list").innerHTML = DATA.bots.map(b => `
    <div class="row" title="${b.deck.map(id => { const d = unitDef(id); return d ? d.name : id; }).join(", ")} · ${b.ai_profile.strategy}"><span>${b.tier === "Profi" ? "🤖" : "👤"} @${b.username}</span><span class="tier-${b.tier}">${b.tier}</span></div>`).join("");
  const cs = EL("clan-sub"); // B9: dynamische Anzahl
  if (cs) cs.textContent = DATA.bots.length + " Gangs kämpfen um die Stadt.";
}

// ---------- boot ----------
async function boot() {
  try {
    const r = await fetch("game-data.json");
    DATA = await r.json();
  } catch (e) {
    document.body.innerHTML = "<p style='padding:20px'>game-data.json fehlt: " + e + "</p>";
    return;
  }
  // ticks
  EL("elixir-ticks").innerHTML = "<i></i>".repeat(10);
  // tier buttons
  const tiers = $$(".tier-btn");
  const refreshPrev = () => {
    const pool = DATA.bots.filter(b => b.tier === S.tier);
    const b = pool[Math.floor(Math.random() * pool.length)];
    S._prevBot = b;
    EL("bot-name-prev").textContent = "@" + b.username;
    EL("bot-strat-prev").textContent = b.ai_profile.strategy + " · " + b.ai_profile.reaction_delay_ms + "ms";
  };
  tiers.forEach(b => b.onclick = () => {
    tiers.forEach(x => x.classList.remove("sel")); b.classList.add("sel");
    S.tier = b.dataset.tier; refreshPrev();
  });
  S.tier = "Normal"; refreshPrev();
  EL("btn-start").onclick = () => {
    S.bot = S._prevBot || pickBot(S.tier); S._botLane = undefined;
    resetMatch(); switchTab("tab-battle");
  };
  EL("btn-rematch").onclick = () => { S.bot = pickBot(S.tier); S._botLane = undefined; resetMatch(); };
  EL("btn-change").onclick = () => { S.running = false; S.over = false; EL("end-overlay").classList.add("hidden"); EL("start-overlay").style.display = "grid"; };
  EL("btn-mute").onclick = () => {
    AudioSys.on = !AudioSys.on;
    SAVE.muted = !AudioSys.on; persist(); // Z5
    EL("btn-mute").textContent = AudioSys.on ? "🔊" : "🔇";
    if (AudioSys.on) { AudioSys.ensure(); AudioSys.start(); }
  };
  EL("shop-grid").onclick = e => {
    const b = e.target.closest("[data-chest]");
    if (b && !b.disabled) openChest(b.dataset.chest);
  };
  EL("opt-sound").onclick = () => { // B6: Checkbox sync
    AudioSys.on = EL("opt-sound").checked;
    SAVE.muted = !AudioSys.on; persist();
    EL("btn-mute").textContent = AudioSys.on ? "🔊" : "🔇";
  };
  EL("opt-sound").checked = AudioSys.on;
  // B10: Deck-Validierung
  for (const b of DATA.bots) for (const c of b.deck) {
    if (!unitDef(c)) console.error("Unbekannte Karte im Bot-Deck:", b.username, c);
  }
  // B6: Cup-Countdown bis 20:00
  try {
    const cc = EL("cup-countdown");
    if (cc) {
      const n = new Date(), t = new Date(n);
      t.setHours(20, 0, 0, 0);
      if (t <= n) t.setDate(t.getDate() + 1);
      const h = Math.floor((t - n) / 3600000), m = Math.floor((t - n) % 3600000 / 60000);
      cc.textContent = `Start in ${h}h ${m}min`;
    }
  } catch {}
  // idle towers behind start overlay
  SAVE = loadSave();
  // B10: Reduced Motion respektieren
  try { S.calmed = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches; } catch {}
  AudioSys.on = !SAVE.muted; // Z5
  EL("btn-mute").textContent = AudioSys.on ? "🔊" : "🔇";
  // B4: Tagesbonus +200 (einmal pro Tag)
  try {
    const today = new Date().toDateString();
    if (SAVE.daily !== today) {
      SAVE.daily = today; SAVE.credits += 200; persist();
      setTimeout(() => toast("🎁 Tagesbonus +200 Credits!"), 1200);
    }
  } catch {}
  // Z1: scharfes Canvas auf Retina-Displays
  try {
    const dpr = Math.min(2, (typeof devicePixelRatio !== "undefined" ? devicePixelRatio : 1) || 1);
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  } catch {}
  S.towersP = mkTowers("P"); S.towersB = mkTowers("B");
  S.pool = DATA.units.map(u => u.id);
  S.hand = S.pool.slice(0, 4); S.queue = S.pool.slice(4);
  renderCredits(); renderPanels(); renderHand(); updatePips(); updateTimerUI();
  renderRecord(); // B6
  if (EL("ver") && DATA.game_meta) EL("ver").textContent = "v" + DATA.game_meta.version + " · " + DATA.game_meta.title; // Z10
  S.lastT = performance.now();
  requestAnimationFrame(frame);
}
// Debug-/Test-Hook (harmlos, nur lesend + Spawn/Shop)
window.__cyber = { S, spawnUnit, openChest, levelOf, unitDef, version: "2.0.0+100",
  get DATA() { return DATA; }, get SAVE() { return SAVE; } };
boot();
})();
