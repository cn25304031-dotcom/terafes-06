/* ---------- screen transitions (fade-out, then staggered fade-in) ---------- */
let switching = false;
function show(nextId) {
  const current = document.querySelector('.screen.is-active');
  if (switching || !current || current.id === nextId) return;
  switching = true;
  current.classList.add('is-leaving');
  setTimeout(() => {
    current.classList.remove('is-active', 'is-leaving');
    const next = $(nextId);
    next.classList.add('is-active');   // CSS animations restart on display change
    window.scrollTo(0, 0);
    switching = false;
  }, 380);
}
