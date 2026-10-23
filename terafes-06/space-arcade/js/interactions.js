/* ---------- how-to sheet ---------- */
function openHowto() { const m = $('howto'); m.classList.remove('is-closing'); m.hidden = false; }
function closeHowto() {
  const m = $('howto');
  if (m.hidden) return;
  m.classList.add('is-closing');
  setTimeout(() => { m.hidden = true; m.classList.remove('is-closing'); }, 300);
}

/* ---------- starfield (canvas, sparse, twinkling, mouse parallax) ---------- */
(function stars() {
  const cv = $('stars'), ctx = cv.getContext('2d');
  let w, h, dpr, list = [], mx = 0, my = 0, tx = 0, ty = 0;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
    const n = Math.round((innerWidth * innerHeight) / 11000);
    list = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: (Math.random() * 1.1 + .35) * dpr,
      z: Math.random() * .9 + .1,               // depth: parallax + drift speed
      p: Math.random() * Math.PI * 2,           // twinkle phase
      s: Math.random() * .8 + .4,               // twinkle speed
    }));
  }
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); });
  function frame(t) {
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    ctx.clearRect(0, 0, w, h);
    for (const s of list) {
      s.y -= s.z * .12 * dpr;                  // slow upward drift
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

/* ---------- magnetic primary button ---------- */
document.querySelectorAll('.btn-primary, .btn-start').forEach((b) => {
  b.addEventListener('pointermove', (e) => {
    const r = b.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
    b.style.transform = `translate(${x * 10}px, ${y * 8}px)`;
  });
  b.addEventListener('pointerleave', () => { b.style.transform = ''; });
});

/* ---------- wire up ---------- */
renderGames();
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
