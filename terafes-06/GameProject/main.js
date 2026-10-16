"use strict";

const ICONS = {
  rocket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c3 3 4.5 7 4 12H8c-.5-5 1-9 4-12z"/><circle cx="12" cy="9.5" r="1.5"/><path d="M8 14l-3 4 3-1M16 14l3 4-3-1M12 17v4"/></svg>',
  cards: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="10" height="14" rx="2" transform="rotate(-10 8 13)"/><rect x="11" y="4" width="10" height="14" rx="2" transform="rotate(8 16 11)"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

const I18N = {
  ja: {
    start: 'ゲームスタート', howto: '遊び方', mode: 'MODE', close: '閉じる', back: '戻る',
    heading: 'ゲームを選んでください', sub: '遊びたいゲームをタップ',
    descShooter: '敵を倒してスコアを稼ごう', descCards: 'カードをめくってペアを見つけよう',
    how1: 'ロケットを動かして弾を撃ち、敵を倒してスコアを稼ぐ。ハートが0になると終了。',
    how2: 'カードを2枚ずつめくり、同じ絵柄のペアを探す。少ない手数と短い時間でクリアを目指そう。',
    soon: '{name} は準備中です',
    sound: 'サウンド', soundOn: 'サウンド オン', soundOff: 'サウンド オフ', language: '言語',
    tapHint: '画面をタップするとBGMが流れます',
  },
  en: {
    start: 'Start Game', howto: 'How to Play', mode: 'MODE', close: 'Close', back: 'Back',
    heading: 'Choose a game', sub: 'Tap the game you want to play',
    descShooter: 'Defeat enemies and rack up a high score', descCards: 'Flip cards and find the matching pairs',
    how1: 'Move your rocket and fire to defeat enemies and earn points. The game ends when your hearts run out.',
    how2: 'Flip two cards at a time and find matching pairs. Clear the board in as few moves and as little time as you can.',
    soon: '{name} is coming soon',
    sound: 'Sound', soundOn: 'Sound on', soundOff: 'Sound off', language: 'Language',
    tapHint: 'Tap anywhere to play the theme',
  },
  my: {
    start: 'ဂိမ်းစတင်ပါ', howto: 'ကစားနည်း', mode: 'မုဒ်', close: 'ပိတ်ပါ', back: 'နောက်သို့',
    heading: 'ဂိမ်းကို ရွေးချယ်ပါ', sub: 'ကစားလိုသော ဂိမ်းကို နှိပ်ပါ',
    descShooter: 'ရန်သူများကို ချေမှုန်းပြီး ရမှတ်များ ရယူပါ', descCards: 'ကတ်များကို လှန်ပြီး တူညီသော အတွဲများကို ရှာပါ',
    how1: 'ဒုံးပျံကို ရွှေ့ပြီး ပစ်ခတ်ကာ ရန်သူများကို ချေမှုန်းပြီး ရမှတ်ရယူပါ။ နှလုံးများ ကုန်သွားလျှင် ဂိမ်းပြီးဆုံးပါမည်။',
    how2: 'ကတ်နှစ်ရွက်စီကို လှန်ပြီး တူညီသော ပုံများကို ရှာပါ။ အနည်းဆုံး အကြိမ်ရေနှင့် အတိုဆုံး အချိန်ဖြင့် ပြီးအောင် ကစားပါ။',
    soon: '{name} ကို မကြာမီ ထည့်သွင်းပါမည်',
    sound: 'အသံ', soundOn: 'အသံ ဖွင့်ထားသည်', soundOff: 'အသံ ပိတ်ထားသည်', language: 'ဘာသာစကား',
    tapHint: 'တေးဂီတ ဖွင့်ရန် မျက်နှာပြင်ကို နှိပ်ပါ',
  },
};

const LANG_CODES = ['ja', 'en', 'my'];
const FALLBACK_NAMES = { ja: '日本語', en: 'English', my: 'မြန်မာ' };
let LANG = 'ja';
const t = (k) => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;
window.tr = t;

function langName(code) {
  try { return new Intl.DisplayNames([code], { type: 'language' }).of(code); }
  catch (e) { return FALLBACK_NAMES[code]; }
}

function pickInitialLang() {
  try { const s = localStorage.getItem('arcadeLang'); if (LANG_CODES.includes(s)) return s; } catch (e) {}
  for (const l of (navigator.languages || [navigator.language || 'ja'])) {
    const c = String(l).toLowerCase().slice(0, 2);
    if (LANG_CODES.includes(c)) return c;
    if (c === 'bu') return 'my';
  }
  return 'ja';
}

function applyLang(code) {
  LANG = code;
  document.documentElement.lang = code;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.getElementById('lang-code').textContent = code.toUpperCase();
  document.getElementById('lang-btn').setAttribute('aria-label', t('language'));
  document.querySelectorAll('#lang-menu button').forEach((b) => {
    const sel = b.dataset.lang === code; b.classList.toggle('sel', sel); b.setAttribute('aria-selected', String(sel));
  });
  try { localStorage.setItem('arcadeLang', code); } catch (e) {}
}

const GAMES = [
  { id: 'space-shooter', name: 'Space Shooter', tag: 'ARCADE', descKey: 'descShooter', icon: ICONS.rocket, href: 'space-shooter.html' },
  { id: 'card-matching', name: 'Card Matching', tag: 'PUZZLE', descKey: 'descCards', icon: ICONS.cards, href: 'card-matching.html' },
];

const $ = (id) => document.getElementById(id);

let switching = false;
function show(nextId) {
  const current = document.querySelector('.screen.is-active');
  if (switching || !current || current.id === nextId) return;
  switching = true;
  current.classList.add('is-leaving');
  setTimeout(() => {
    current.classList.remove('is-active', 'is-leaving');
    const next = $(nextId);
    next.classList.add('is-active');
    window.scrollTo(0, 0);
    switching = false;
  }, 380);
}

function renderGames() {
  $('game-list').innerHTML = GAMES.map((g, i) => `
    <button class="game" data-id="${g.id}" style="--i:${i}">
      <span class="ico">${g.icon}</span>
      <span>
        <span class="tag"><b>0${i + 1}</b><i></i>${g.tag}</span>
        <strong>${g.name}</strong>
        <small data-i18n="${g.descKey}">${t(g.descKey)}</small>
      </span>
      <span class="go">${ICONS.arrow}</span>
    </button>`).join('');
}

function startGame(id) {
  const game = GAMES.find((g) => g.id === id);
  if (game && game.href) {
    location.href = game.href;
  } else {
    alert(t('soon').replace('{name}', game ? game.name : ''));
  }
}

function openHowto() { const m = $('howto'); m.classList.remove('is-closing'); m.hidden = false; }
function closeHowto() {
  const m = $('howto');
  if (m.hidden) return;
  m.classList.add('is-closing');
  setTimeout(() => { m.hidden = true; m.classList.remove('is-closing'); }, 300);
}

// Background Starfield
(function stars() {
  const cv = $('stars');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let w, h, dpr, list = [], mx = 0, my = 0, tx = 0, ty = 0;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
    const n = Math.round((innerWidth * innerHeight) / 11000);
    list = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: (Math.random() * 1.1 + .35) * dpr,
      z: Math.random() * .9 + .1,
      p: Math.random() * Math.PI * 2,
      s: Math.random() * .8 + .4,
    }));
  }
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); });
  function frame(t) {
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    ctx.clearRect(0, 0, w, h);
    for (const s of list) {
      s.y -= s.z * .12 * dpr;
      if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; }
      const px = s.x + mx * s.z * 40 * dpr, py = s.y + my * s.z * 40 * dpr;
      const a = .25 + .55 * (.5 + .5 * Math.sin(t / 1000 * s.s + s.p));
      ctx.globalAlpha = a * (.4 + s.z * .6);
      ctx.fillStyle = '#dbe8ff';
      ctx.beginPath(); ctx.arc(px, py, s.r, 0, 6.2832); ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  resize(); requestAnimationFrame(frame);
})();

// Chiptune BGM Generator
const Chip = (() => {
  const BPM = 132, S = 60 / BPM / 4, VOL = 0.2;
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
  const LEAD = parse(`
    A4 x C5 x E5 x C5 x A5 - G5 - E5 - C5 x
    F4 x A4 x C5 x A4 x F5 - E5 - C5 - A4 x
    G4 x C5 x E5 x C5 x G5 - E5 - C5 - E5 x
    D5 x G5 x B5 x G5 x D6 - B5 - G5 - D5 x`);
  const CHORDS = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]];
  const ROOTS = [45, 41, 48, 43];

  function tone(type, f, t, dur, vol, o = {}) {
    if (!ctx) return;
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
    if (!ctx) return;
    const src = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    src.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t, Math.random() * 0.8); src.stop(t + dur + 0.02);
  }

  function schedule(s, t) {
    const bar = Math.floor(s / 16) % 4, n = LEAD[s];
    if (n) tone('square', hz(n.m), t, n.len * S * .94, .5);
    tone('square', hz(CHORDS[bar][[0, 1, 2, 1][s % 4]]), t, S * .8, .15);
    if (s % 4 === 0) tone('triangle', hz(ROOTS[bar]), t, S * 3.6, .95);
    if (s % 4 === 2) tone('triangle', hz(ROOTS[bar] + 12), t, S * 1.6, .6);
    if (s % 8 === 0) tone('sine', 150, t, .16, .9, { to: 42, sus: .3 });
    if (s % 8 === 4) { noise(t, .13, .5, 1800); tone('triangle', 220, t, .08, .3, { to: 120 }); }
    if (s % 2 === 0) noise(t, .035, s % 4 === 2 ? .2 : .11, 7500);
  }

  function tick() {
    while (next < ctx.currentTime + 0.15) { schedule(step % 64, next); next += S; step++; }
  }

  let jingled = false;
  function hint(show) { const el = document.getElementById('sound-hint'); if (el) el.classList.toggle('show', show && !muted); }
  function onState() {
    if (ctx.state !== 'running') { hint(true); return; }
    hint(false);
    next = Math.max(next, ctx.currentTime + 0.05);
    master.gain.setTargetAtTime(muted ? 0 : VOL, ctx.currentTime, .4);
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
    ctx.resume().catch(() => {});
    onState(); ui();
  }

  function setMuted(v) {
    muted = v; try { localStorage.setItem('arcadeMuted', v ? '1' : '0'); } catch (e) {}
    if (started) { master.gain.setTargetAtTime(v ? 0 : VOL, ctx.currentTime, .05); hint(ctx.state !== 'running'); }
    ui();
  }

  function ui() {
    const b = document.getElementById('btn-sound');
    if (!b) return;
    const on = started && !muted;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
    const label = window.tr ? window.tr(!started ? 'sound' : on ? 'soundOn' : 'soundOff') : 'Sound';
    b.setAttribute('aria-label', label); b.title = label;
  }

  const sfx = {
    attract() {
      if (!(started && !muted && ctx.state === 'running')) return;
      const t = ctx.currentTime;
      tone('square', hz(83), t, .07, .3); tone('square', hz(88), t + .07, .4, .3, { sus: .3 });
      [72, 76, 79, 84, 88].forEach((m, i) => tone('square', hz(m), t + .55 + i * .09, .16, .26));
      tone('triangle', hz(60), t + .55, .6, .55);
    },
    blip()   { if (started && !muted && ctx.state === 'running') tone('square', 1175, ctx.currentTime, .045, .22); },
    select() { if (started && !muted && ctx.state === 'running') { const t = ctx.currentTime; tone('square', 660, t, .07, .3); tone('square', 990, t + .07, .12, .3); } },
    back()   { if (started && !muted && ctx.state === 'running') { const t = ctx.currentTime; tone('square', 880, t, .07, .28); tone('square', 520, t + .07, .12, .28); } },
  };

  return { start, setMuted, ui, sfx, isStarted: () => started, isMuted: () => muted, isRunning: () => started && ctx.state === 'running' };
})();

// Initialization & Event Binding
document.addEventListener('DOMContentLoaded', () => {
  renderGames();

  // Wordmark letter splitting
  const wm = document.querySelector('.wordmark');
  if (wm) {
    wm.querySelectorAll('.line > span').forEach((el, li) => {
      const text = el.textContent, frag = document.createDocumentFragment();
      const hue = li === 0 ? [44, 20] : [268, 305];
      [...text].forEach((c, i) => {
        if (c === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'ch'; s.textContent = c;
        const tVal = i / Math.max(text.length - 1, 1);
        s.style.setProperty('--hv', `hsl(${hue[0] + (hue[1] - hue[0]) * tVal} 85% 76%)`);
        frag.appendChild(s);
      });
      el.textContent = ''; el.appendChild(frag);
    });
    setTimeout(() => wm.classList.add('settled'), 1900);
  }

  $('btn-start').addEventListener('click', () => show('screen-mode'));
  $('btn-back').addEventListener('click', () => show('screen-title'));
  $('btn-howto').addEventListener('click', openHowto);
  $('btn-close').addEventListener('click', closeHowto);
  $('howto').addEventListener('click', (e) => { if (e.target === $('howto')) closeHowto(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHowto(); });

  $('game-list').addEventListener('click', (e) => {
    const card = e.target.closest('.game');
    if (card) startGame(card.dataset.id);
  });
  $('game-list').addEventListener('pointermove', (e) => {
    const card = e.target.closest('.game');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  // Sound Wireup
  const btnSound = $('btn-sound');
  Chip.start();
  const evs = ['pointerdown', 'keydown', 'touchend', 'click'];
  const unlock = () => { Chip.start(); if (Chip.isRunning()) evs.forEach((e) => document.removeEventListener(e, unlock, true)); };
  evs.forEach((e) => document.addEventListener(e, unlock, true));
  if (btnSound) btnSound.addEventListener('click', () => Chip.setMuted(!Chip.isMuted()));

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

  // Language Menu Wireup
  const btnLang = $('lang-btn'), menuLang = $('lang-menu');
  if (btnLang && menuLang) {
    menuLang.innerHTML = LANG_CODES.map((c) =>
      `<button role="option" data-lang="${c}"><span>${langName(c)}</span><span class="lc">${c.toUpperCase()}</span></button>`).join('');
    const setOpen = (o) => { menuLang.hidden = !o; btnLang.setAttribute('aria-expanded', String(o)); };
    btnLang.addEventListener('click', (e) => { e.stopPropagation(); setOpen(menuLang.hidden); });
    menuLang.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-lang]'); if (!b) return;
      applyLang(b.dataset.lang); setOpen(false);
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('#lang')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    applyLang(pickInitialLang());
  }

  // Arcade Attract Effect
  const btnStart = $('btn-start'), flash = $('flash');
  const title = $('screen-title'), sheet = $('howto');
  const IDLE = 7000, EVERY = 9000;
  let last = Date.now(), lastBurst = 0;
  const bump = () => { last = Date.now(); };
  ['pointerdown', 'pointermove', 'keydown', 'touchstart'].forEach((evt) => addEventListener(evt, bump, { passive: true }));
  setInterval(() => {
    if (document.hidden || !title.classList.contains('is-active') || !sheet.hidden) return;
    const now = Date.now();
    if (now - last >= IDLE && now - lastBurst >= EVERY) {
      lastBurst = now;
      btnStart.classList.remove('attract'); flash.classList.remove('go');
      void btnStart.offsetWidth;
      btnStart.classList.add('attract'); flash.classList.add('go');
      Chip.sfx.attract();
    }
  }, 500);
});