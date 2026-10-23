// Main page only: title screen -> mode select.
// Game code is added later by each teammate. To connect a game,
// just set its `href` below (e.g. "../space-shooter/index.html").

const ICONS = {
  rocket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c3 3 4.5 7 4 12H8c-.5-5 1-9 4-12z"/><circle cx="12" cy="9.5" r="1.5"/><path d="M8 14l-3 4 3-1M16 14l3 4-3-1M12 17v4"/></svg>',
  cards: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="10" height="14" rx="2" transform="rotate(-10 8 13)"/><rect x="11" y="4" width="10" height="14" rx="2" transform="rotate(8 16 11)"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

/* ============================================================
   LANGUAGES — Japanese / English / Myanmar (Burmese)
   Text is hand-written per language (more accurate than machine
   translating short UI labels). Browser APIs used for accuracy:
   navigator.languages (auto-detect), Intl.DisplayNames (native
   language names), localStorage (remember choice), and <html lang>
   (correct font shaping / screen readers / hyphenation).
   ============================================================ */
const I18N = {
  ja: {
    start: 'ゲームスタート', howto: '遊び方', mode: 'MODE', close: '閉じる', back: '戻る',
    heading: 'ゲームを選んでください', sub: '遊びたいゲームをタップ',
    descShooter: '敵を倒してスコアを稼ごう', descCards: 'カードをめくってペアを見つけよう',
    how1: 'ロケットを動かして弾を撃ち、敵を倒してスコアを稼ぐ。シールドが0になると終了。',
    how2: 'カードを2枚ずつめくり、同じ絵柄のペアを探す。少ない手数と短い時間でクリアを目指そう。',
    soon: '{name} は準備中です(チームが実装予定)',
    sound: 'サウンド', soundOn: 'サウンド オン', soundOff: 'サウンド オフ', language: '言語',
    tapHint: '画面をタップするとBGMが流れます',
    theme: 'テーマ', themeDark: 'ダークモード', themeLight: 'ノーマルモード',
    st1: 'パイロット、宇宙服を装着中…', st2: '宇宙船の最終チェック…', st3: '出撃！ 宇宙を守れ！', skip: 'スキップ', suit: 'スーツ同期', chEngine: 'エンジン', chWeapon: '武装', chShield: 'シールド', battle: '戦闘開始',
  },
  en: {
    start: 'Start Game', howto: 'How to Play', mode: 'MODE', close: 'Close', back: 'Back',
    heading: 'Choose a game', sub: 'Tap the game you want to play',
    descShooter: 'Defeat enemies and rack up a high score', descCards: 'Flip cards and find the matching pairs',
    how1: 'Move your rocket and fire to defeat enemies and earn points. The game ends when your shields run out.',
    how2: 'Flip two cards at a time and find matching pairs. Clear the board in as few moves and as little time as you can.',
    soon: '{name} is coming soon (the team is still building it)',
    sound: 'Sound', soundOn: 'Sound on', soundOff: 'Sound off', language: 'Language',
    tapHint: 'Tap anywhere to play the theme',
    theme: 'Theme', themeDark: 'Dark mode', themeLight: 'Normal mode',
    st1: 'Pilot suiting up…', st2: 'Final spacecraft check…', st3: 'Launch! Defend the galaxy!', skip: 'SKIP', suit: 'SUIT SYNC', chEngine: 'ENGINE', chWeapon: 'WEAPONS', chShield: 'SHIELD', battle: 'BATTLE START',
  },
  my: {
    start: 'ဂိမ်းစတင်ပါ', howto: 'ကစားနည်း', mode: 'မုဒ်', close: 'ပိတ်ပါ', back: 'နောက်သို့',
    heading: 'ဂိမ်းကို ရွေးချယ်ပါ', sub: 'ကစားလိုသော ဂိမ်းကို နှိပ်ပါ',
    descShooter: 'ရန်သူများကို ချေမှုန်းပြီး ရမှတ်များ ရယူပါ', descCards: 'ကတ်များကို လှန်ပြီး တူညီသော အတွဲများကို ရှာပါ',
    how1: 'ဒုံးပျံကို ရွှေ့ပြီး ပစ်ခတ်ကာ ရန်သူများကို ချေမှုန်းပြီး ရမှတ်ရယူပါ။ ဒိုင်းလွှားများ ကုန်သွားလျှင် ဂိမ်းပြီးဆုံးပါမည်။',
    how2: 'ကတ်နှစ်ရွက်စီကို လှန်ပြီး တူညီသော ပုံများကို ရှာပါ။ အနည်းဆုံး အကြိမ်ရေနှင့် အတိုဆုံး အချိန်ဖြင့် ပြီးအောင် ကစားပါ။',
    soon: '{name} ကို မကြာမီ ထည့်သွင်းပါမည် (အဖွဲ့က ဖန်တီးနေဆဲ ဖြစ်ပါသည်)',
    sound: 'အသံ', soundOn: 'အသံ ဖွင့်ထားသည်', soundOff: 'အသံ ပိတ်ထားသည်', language: 'ဘာသာစကား',
    tapHint: 'တေးဂီတ ဖွင့်ရန် မျက်နှာပြင်ကို နှိပ်ပါ',
    theme: 'အသွင်', themeDark: 'မှောင်မုဒ်', themeLight: 'ပုံမှန်မုဒ်',
    st1: 'လေယာဉ်မှူး အာကာသဝတ်စုံ ဝတ်ဆင်နေသည်…', st2: 'အာကာသယာဉ် နောက်ဆုံးစစ်ဆေးနေသည်…', st3: 'ထွက်ခွာမည်! ကမ္ဘာကို ကာကွယ်ပါ!', skip: 'ကျော်ရန်', suit: 'စုံ ချိတ်ဆက်မှု', chEngine: 'အင်ဂျင်', chWeapon: 'လက်နက်', chShield: 'ဒိုင်းလွှား', battle: 'တိုက်ပွဲစတင်',
  },
};
const LANG_CODES = ['ja', 'en', 'my'];
const FALLBACK_NAMES = { ja: '日本語', en: 'English', my: 'မြန်မာ' };
let LANG = 'ja';
const t = (k) => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;
window.tr = t;

function langName(code) {                       // native name straight from the Intl API
  try { return new Intl.DisplayNames([code], { type: 'language' }).of(code); }
  catch (e) { return FALLBACK_NAMES[code]; }
}
function pickInitialLang() {
  try { const s = localStorage.getItem('arcadeLang'); if (LANG_CODES.includes(s)) return s; } catch (e) {}
  for (const l of (navigator.languages || [navigator.language || 'ja'])) {   // browser's preferred languages, in order
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
  const tw = document.getElementById('theme');
  if (tw) { tw.setAttribute('aria-label', t('theme'));
    tw.querySelectorAll('button').forEach((b) => { const l = t(b.dataset.theme === 'light' ? 'themeLight' : 'themeDark'); b.title = l; b.setAttribute('aria-label', l); }); }
  document.querySelectorAll('#lang-menu button').forEach((b) => {
    const sel = b.dataset.lang === code; b.classList.toggle('sel', sel); b.setAttribute('aria-selected', String(sel));
  });
  try { localStorage.setItem('arcadeLang', code); } catch (e) {}
  try { Chip.ui(); } catch (e) {}
}

const GAMES = [
  {
    id: 'space-shooter',
    name: 'Space Shooter',
    tag: 'ARCADE',
    descKey: 'descShooter',
    icon: ICONS.rocket,
    href: null, // game page is listed in GAME_URL; set a path here to open a separate page instead
  },
  {
    id: 'card-matching',
    name: 'Card Matching',
    tag: 'PUZZLE',
    descKey: 'descCards',
    icon: ICONS.cards,
    href: null,
    intro: false, // Card Matching plays its own intro
  },
];

const GAME_URL = {            // each game is its own page, shown inside the iframe
  'space-shooter': 'games/space-shooter/index.html',
  'card-matching': 'games/card-matching/index.html',
};

const $ = (id) => document.getElementById(id);
