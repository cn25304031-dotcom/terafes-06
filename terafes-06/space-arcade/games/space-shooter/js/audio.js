"use strict";

// ==============================
// Sound effects (Web Audio API — everything is synthesised, no audio files)
//   laserSfx()   player fires
//   hitSfx()     laser hits an enemy (still alive)
//   boomSfx()    enemy destroyed
//   bossHitSfx() laser hits the boss
//   roarSfx()    boss roar
//   M key        mute / unmute all effects
// ==============================

let actx = null;
let sfxMuted = false;
const sfxLast = {};
let noiseBuf = null;

function ac() {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    return actx;
}

// Browsers only allow audio after a user gesture: create / resume on the first one.
for (const evt of ["keydown", "pointerdown", "touchstart"]) {
    window.addEventListener(evt, () => { try { ac(); } catch { /* audio unavailable */ } }, { passive: true });
}

// Rate limiter so rapid fire never turns into a wall of noise.
function sfxReady(name, gapMs) {
    const now = performance.now();
    if (sfxMuted || now - (sfxLast[name] || 0) < gapMs) return false;
    sfxLast[name] = now;
    return true;
}

function noiseSource(a) {
    if (!noiseBuf) {
        noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = a.createBufferSource();
    s.buffer = noiseBuf;
    return s;
}

function toggleSfx() {
    sfxMuted = !sfxMuted;
    showBanner("SOUND", sfxMuted ? "OFF" : "ON", false);
}

// "pew": a bright saw + square sweeping down, with a tiny random pitch so it never sounds machine-gunned.
function laserSfx() {
    if (!sfxReady("laser", 60)) return;
    try {
        const a = ac(), t = a.currentTime, p = 0.94 + Math.random() * 0.12;
        const out = a.createGain();
        out.gain.setValueAtTime(0.0001, t);
        out.gain.exponentialRampToValueAtTime(0.085, t + 0.008);
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 5200;
        out.connect(lp); lp.connect(a.destination);

        const saw = a.createOscillator(); saw.type = "sawtooth";
        saw.frequency.setValueAtTime(1500 * p, t);
        saw.frequency.exponentialRampToValueAtTime(260 * p, t + 0.15);
        saw.connect(out); saw.start(t); saw.stop(t + 0.17);

        const sq = a.createOscillator(); sq.type = "square";
        sq.frequency.setValueAtTime(760 * p, t);
        sq.frequency.exponentialRampToValueAtTime(130 * p, t + 0.15);
        const sqGain = a.createGain(); sqGain.gain.value = 0.45;
        sq.connect(sqGain); sqGain.connect(out); sq.start(t); sq.stop(t + 0.17);
    } catch { /* audio unavailable */ }
}

// Short zap + spark when a laser connects with an enemy.
function hitSfx() {
    if (!sfxReady("hit", 35)) return;
    try {
        const a = ac(), t = a.currentTime;
        const out = a.createGain();
        out.gain.setValueAtTime(0.14, t);
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        out.connect(a.destination);

        const n = noiseSource(a);
        const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2600;
        n.connect(hp); hp.connect(out); n.start(t); n.stop(t + 0.07);

        const o = a.createOscillator(); o.type = "triangle";
        o.frequency.setValueAtTime(980, t);
        o.frequency.exponentialRampToValueAtTime(420, t + 0.07);
        const og = a.createGain(); og.gain.value = 0.55;
        o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.07);
    } catch { /* audio unavailable */ }
}

// Explosion: filtered noise sweeping down + a low thump. Strong enemies sound bigger.
function boomSfx(strong) {
    if (!sfxReady("boom", 40)) return;
    try {
        const a = ac(), t = a.currentTime, dur = strong ? 0.6 : 0.38;
        const out = a.createGain();
        out.gain.setValueAtTime(strong ? 0.34 : 0.26, t);
        out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        out.connect(a.destination);

        const lp = a.createBiquadFilter(); lp.type = "lowpass";
        lp.frequency.setValueAtTime(strong ? 2200 : 1800, t);
        lp.frequency.exponentialRampToValueAtTime(110, t + dur);
        const n = noiseSource(a);
        n.connect(lp); lp.connect(out); n.start(t); n.stop(t + dur);

        const o = a.createOscillator(); o.type = "sine";
        o.frequency.setValueAtTime(strong ? 150 : 130, t);
        o.frequency.exponentialRampToValueAtTime(36, t + dur);
        const og = a.createGain(); og.gain.value = 0.9;
        o.connect(og); og.connect(out); o.start(t); o.stop(t + dur);
    } catch { /* audio unavailable */ }
}

// Metallic clank for shots landing on the boss's armour.
function bossHitSfx() {
    if (!sfxReady("bossHit", 70)) return;
    try {
        const a = ac(), t = a.currentTime;
        const out = a.createGain();
        out.gain.setValueAtTime(0.11, t);
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        out.connect(a.destination);
        for (const f of [330, 497, 1180]) {
            const o = a.createOscillator(); o.type = "square";
            o.frequency.setValueAtTime(f, t);
            o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.12);
            const g = a.createGain(); g.gain.value = f > 1000 ? 0.18 : 0.4;
            o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.14);
        }
    } catch { /* audio unavailable */ }
}

// Boss roar (used when the boss enters and when it gets angrier)
function roarSfx() {
    try {
        const a = ac();
        const t = a.currentTime, dur = 1.5;
        const out = a.createGain(); out.gain.setValueAtTime(0, t);
        out.gain.linearRampToValueAtTime(0.28, t + 0.12); out.gain.exponentialRampToValueAtTime(0.001, t + dur);
        const lp = a.createBiquadFilter(); lp.type = "lowpass";
        lp.frequency.setValueAtTime(1400, t); lp.frequency.exponentialRampToValueAtTime(220, t + dur);
        out.connect(lp); lp.connect(a.destination);
        for (const [type, f0, f1] of [["sawtooth", 110, 38], ["sawtooth", 117, 41], ["square", 55, 30]]) {
            const o = a.createOscillator(); o.type = type;
            o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
            o.connect(out); o.start(t); o.stop(t + dur);
        }
        const nb = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), nd = nb.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
        const ns = a.createBufferSource(); ns.buffer = nb;
        const ng = a.createGain(); ng.gain.value = 0.35; ns.connect(ng); ng.connect(out); ns.start(t);
    } catch { /* audio unavailable */ }
}

