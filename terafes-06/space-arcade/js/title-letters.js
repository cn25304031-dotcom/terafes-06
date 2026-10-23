/* ---------- title letters: split for per-letter hover colour ---------- */
(function letters() {
  const wm = document.querySelector('.wordmark');
  wm.querySelectorAll('.line > span').forEach((el, li) => {
    const text = el.textContent, frag = document.createDocumentFragment();
    const hue = li === 0 ? [44, 20] : [268, 305];            // champagne→rose gold | lavender→orchid
    [...text].forEach((c, i) => {
      if (c === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
      const s = document.createElement('span');
      s.className = 'ch'; s.textContent = c;
      const t = i / Math.max(text.length - 1, 1);
      s.style.setProperty('--hv', `hsl(${hue[0] + (hue[1] - hue[0]) * t} 85% 76%)`);
      frag.appendChild(s);
    });
    el.textContent = ''; el.appendChild(frag);
  });
  setTimeout(() => wm.classList.add('settled'), 1900);
})();
