/* ============================================================
   CHIPTUNE AUDIO — original 8-bit theme synthesised live with
   the Web Audio API (no audio files, nothing copyrighted).
   Browsers block sound until the first tap/click, so music
   starts on the first interaction or via the SOUND button.
   ============================================================ */
const Chip = (() => {
  const BPM = 132, S = 60 / BPM / 4;          // one 16th-note step in seconds
  const VOL = 0.2;
  let ctx, master, noiseBuf, started = false, muted = false, step = 0, next = 0, timer = null;
  try { muted = localStorage.getItem('arcadeMuted') === '1'; } catch (e) {}

  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const parse = (str) => {
    const out = [];
    for (const t of str.trim().split(/\s+/)) {
      if (t === '-') { out[out.length - 1].len++; out.push(null); continue; }
      if (t === 'x') { out.push(null); continue; }
      const m = t.match(/^([A-G])(#?)(\d)$/);
      out.push({ m: 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] ? 1 : 0), len: 1 });
    }
    return out;
  };
  // 4 bars (Am | F | C | G), 16 steps each — bright, bouncy arcade hook
  const LEAD = parse(`
    A4 x C5 x E5 x C5 x A5 - G5 - E5 - C5 x
    F4 x A4 x C5 x A4 x F5 - E5 - C5 - A4 x
    G4 x C5 x E5 x C5 x G5 - E5 - C5 - E5 x
    D5 x G5 x B5 x G5 x D6 - B5 - G5 - D5 x`);
  const CHORDS = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]];
  const ROOTS = [45, 41, 48, 43];

  function tone(type, f, t, dur, vol, o = {}) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(Math.max(vol * (o.sus ?? .55), 0.0002), t + dur * .6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.03);
  }
  function noise(t, dur, vol, hp) {
    const src = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    src.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t, Math.random() * 0.8); src.stop(t + dur + 0.02);
  }

  function schedule(s, t) {
    const bar = Math.floor(s / 16) % 4, n = LEAD[s];
    if (n) tone('square', hz(n.m), t, n.len * S * .94, .5);                         // lead
    tone('square', hz(CHORDS[bar][[0, 1, 2, 1][s % 4]]), t, S * .8, .15);           // arpeggio
    if (s % 4 === 0) tone('triangle', hz(ROOTS[bar]), t, S * 3.6, .95);              // bass
    if (s % 4 === 2) tone('triangle', hz(ROOTS[bar] + 12), t, S * 1.6, .6);
    if (s % 8 === 0) tone('sine', 150, t, .16, .9, { to: 42, sus: .3 });            // kick
    if (s % 8 === 4) { noise(t, .13, .5, 1800); tone('triangle', 220, t, .08, .3, { to: 120 }); } // snare
    if (s % 2 === 0) noise(t, .035, s % 4 === 2 ? .2 : .11, 7500);                  // hat
  }
  function tick() {
    while (next < ctx.currentTime + 0.15) { schedule(step % 64, next); next += S; step++; }
  }

  let jingled = false;
  function hint(show) { const el = document.getElementById('sound-hint'); if (el) el.classList.toggle('show', show && !muted); }
  function onState() {                                   // fires whenever the browser lets the audio run / pauses it
    if (ctx.state !== 'running') { hint(true); return; }
    hint(false);
    next = Math.max(next, ctx.currentTime + 0.05);
    master.gain.setTargetAtTime(muted ? 0 : VOL, ctx.currentTime, .4);   // gentle fade-in
    if (!jingled && !muted) { jingled = true; [72, 76, 79, 84].forEach((m, i) => tone('square', hz(m), ctx.currentTime + .02 + i * .07, .12, .35)); }
  }
  function start() {
    if (started) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    master = ctx.createGain(); master.gain.value = 0;
    master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    started = true; next = ctx.currentTime + 0.08;
    timer = setInterval(tick, 25);
    ctx.onstatechange = onState;
    ctx.resume().catch(() => {});                        // plays at once if the browser allows autoplay
    onState(); ui();
  }
  function setMuted(v) {
    muted = v; try { localStorage.setItem('arcadeMuted', v ? '1' : '0'); } catch (e) {}
    if (started) { master.gain.setTargetAtTime(v ? 0 : VOL, ctx.currentTime, .05); hint(ctx.state !== 'running'); }
    ui();
  }
  function ui() {
    const b = document.getElementById('btn-sound');
    const on = started && !muted;
    b.classList.toggle('on', on); b.classList.toggle('idle', false);
    b.setAttribute('aria-pressed', String(on));
    const label = window.tr ? window.tr(!started ? 'sound' : on ? 'soundOn' : 'soundOff') : 'Sound';
    b.setAttribute('aria-label', label); b.title = label;
  }

  // tiny UI effects
  const sfx = {
    attract() {   // "coin + fanfare": draws passers-by to the machine
      if (!(started && !muted && ctx.state === 'running')) return;
      const t = ctx.currentTime;
      tone('square', hz(83), t, .07, .3); tone('square', hz(88), t + .07, .4, .3, { sus: .3 });
      [72, 76, 79, 84, 88].forEach((m, i) => tone('square', hz(m), t + .55 + i * .09, .16, .26));
      tone('triangle', hz(60), t + .55, .6, .55);
    },
    blip()   { if (started && !muted && ctx.state === 'running') tone('square', 1175, ctx.currentTime, .045, .22); },
    select() { if (started && !muted && ctx.state === 'running') { const t = ctx.currentTime; tone('square', 660, t, .07, .3); tone('square', 990, t + .07, .12, .3); } },
    launch() { if (started && !muted && ctx.state === 'running') { const t = ctx.currentTime; for (let i = 0; i < 10; i++) tone('sawtooth', 110 + i * 70, t + i * .07, .12, .16); } },
    back()   { if (started && !muted && ctx.state === 'running') { const t = ctx.currentTime; tone('square', 880, t, .07, .28); tone('square', 520, t + .07, .12, .28); } },
  };

  document.addEventListener('visibilitychange', () => {
    if (!started) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
  return { start, setMuted, ui, sfx, isStarted: () => started, isMuted: () => muted, isRunning: () => started && ctx.state === 'running' };
})();

(function wireAudio() {
  const btn = document.getElementById('btn-sound');
  Chip.start();                                           // theme is ON by default; the player can switch it off
  // browsers may hold audio until the first tap/key press — resume on any gesture, then stop listening
  const evs = ['pointerdown', 'keydown', 'touchend', 'click'];
  const unlock = () => { Chip.start(); if (Chip.isRunning()) evs.forEach((e) => document.removeEventListener(e, unlock, true)); };
  evs.forEach((e) => document.addEventListener(e, unlock, true));
  btn.addEventListener('click', () => Chip.setMuted(!Chip.isMuted()));
  const hot = '.btn, .game, .back';
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest(hot);
    if (el && !el.contains(e.relatedTarget)) Chip.sfx.blip();
  });
  document.addEventListener('click', (e) => {
    const el = e.target.closest(hot);
    if (!el) return;
    el.classList.contains('back') ? Chip.sfx.back() : Chip.sfx.select();
  });
})();

(function wireLang() {
  const btn = document.getElementById('lang-btn'), menu = document.getElementById('lang-menu');
  menu.innerHTML = LANG_CODES.map((c) =>
    `<button role="option" data-lang="${c}"><span>${langName(c)}</span><span class="lc">${c.toUpperCase()}</span></button>`).join('');
  const setOpen = (o) => { menu.hidden = !o; btn.setAttribute('aria-expanded', String(o)); };
  btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(menu.hidden); });
  menu.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-lang]'); if (!b) return;
    applyLang(b.dataset.lang); setOpen(false);
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('#lang')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  applyLang(pickInitialLang());
})();
