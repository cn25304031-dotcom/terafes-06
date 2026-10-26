/* ---------- 12-second story intro, then the game ---------- */
const Intro = (() => {
  const root = $('intro'), cv = $('ic'), cap = $('cap'), cx = cv.getContext('2d');
  const scenes = [...root.querySelectorAll('.sc')];
  const TIMES = [0, 4000, 8000], TOTAL = 12000;
  let timers = [], raf = 0, speed = 0.4, stars = [], done = null, running = false;
  function size() { cv.width = innerWidth; cv.height = innerHeight; stars = Array.from({ length: 140 }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, z: Math.random() * .9 + .1 })); }
  function frame() {
    cx.clearRect(0, 0, cv.width, cv.height);
    for (const s of stars) {
      s.y += s.z * speed * 6; if (s.y > cv.height) { s.y = -20; s.x = Math.random() * cv.width; }
      const len = 1 + speed * s.z * 10;
      cx.fillStyle = 'rgba(214,237,255,' + (.35 + s.z * .6) + ')';
      cx.fillRect(s.x, s.y, 1.4 * s.z + .6, len);
    }
    raf = requestAnimationFrame(frame);
  }
  function scene(i) {
    scenes.forEach((el, k) => el.classList.toggle('on', k === i));
    cap.className = 'cap'; void cap.offsetWidth; cap.className = 'cap in';
    cap.textContent = t('st' + (i + 1));
    try { i === 2 ? Chip.sfx.launch() : Chip.sfx.select(); } catch (e) {}
  }
  function end(skipped) {
    if (!running) return; running = false;
    timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf);
    const f = root.querySelector('.iflash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    setTimeout(() => { root.hidden = true; root.classList.remove('run'); scenes.forEach((el) => el.classList.remove('on')); }, 120);
    const cb = done; done = null; if (cb) cb();
  }
  function play(cb) {
    done = cb; running = true; size(); speed = .4;
    root.hidden = false; root.classList.remove('run'); void root.offsetWidth; root.classList.add('run');
    scene(0);
    timers.push(setTimeout(() => { scene(1); speed = .9; }, TIMES[1]));
    timers.push(setTimeout(() => { scene(2); speed = 6; }, TIMES[2]));
    timers.push(setTimeout(() => end(false), TOTAL));
    raf = requestAnimationFrame(frame);
  }
  $('skip').addEventListener('click', () => end(true));
  addEventListener('resize', () => { if (running) size(); });
  return { play, isRunning: () => running, applyText: () => { if (running) { const k = scenes.findIndex((e) => e.classList.contains('on')); if (k >= 0) cap.textContent = t('st' + (k + 1)); } } };
})();

let musicWas = null;
function startGame(id) {
  const game = GAMES.find((g) => g.id === id);
  if (game && GAME_URL[id]) {                    // story intro (12 s) -> game built into this page
    if (Intro.isRunning()) return;
    const launch = () => {
      $('gf').src = GAME_URL[id];
      $('game-frame').hidden = false;
      musicWas = Chip.isMuted(); Chip.setMuted(true);   // menu music off while playing
      setTimeout(() => { try { $('gf').focus(); } catch (e) {} }, 150);
    };
    if (game.intro === false) launch(); else Intro.play(launch);
  } else if (game && game.href) {
    location.href = game.href;
  } else {
    alert(t('soon').replace('{name}', game.name));
  }
}
function exitGame() {
  $('game-frame').hidden = true;
  $('gf').src = 'about:blank';
  if (musicWas === false) Chip.setMuted(false);
  musicWas = null;
}
$('game-exit').addEventListener('click', exitGame);
// games ask to go back to the title by posting a message (works even when opened from file://)
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'arcade-exit' && e.source === $('gf').contentWindow) exitGame();
});
