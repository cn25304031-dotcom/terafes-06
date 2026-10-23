/* ---------- arcade attract mode: if nobody touches the machine, call people over ---------- */
(function attract() {
  const btn = document.getElementById('btn-start'), flash = document.getElementById('flash');
  const title = document.getElementById('screen-title'), sheet = document.getElementById('howto');
  const IDLE = 7000, EVERY = 9000;                       // ms of quiet before the first call, then between calls
  let last = Date.now(), lastBurst = 0;
  const bump = () => { last = Date.now(); };
  ['pointerdown', 'pointermove', 'keydown', 'touchstart'].forEach((e) => addEventListener(e, bump, { passive: true }));
  function burst() {
    btn.classList.remove('attract'); flash.classList.remove('go'); void btn.offsetWidth;   // restart the animations
    btn.classList.add('attract'); flash.classList.add('go');
    Chip.sfx.attract();
  }
  setInterval(() => {
    if (document.hidden || !title.classList.contains('is-active') || !sheet.hidden) return;
    const now = Date.now();
    if (now - last >= IDLE && now - lastBurst >= EVERY) { lastBurst = now; burst(); }
  }, 500);
})();
