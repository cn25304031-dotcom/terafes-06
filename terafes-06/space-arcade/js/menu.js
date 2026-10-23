/* ---------- game cards ---------- */
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
