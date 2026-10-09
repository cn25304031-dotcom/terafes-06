(() => {
  const titleScreen = document.getElementById('title-screen');
  const modeScreen = document.getElementById('mode-screen');
  const startButton = document.getElementById('start-button');
  const backButton = document.getElementById('back-button');
  const modeTitle = document.getElementById('mode-title');
  const modeStatus = document.getElementById('mode-status');
  const modeOptions = [...document.querySelectorAll('.mode-option')];
  const howtoButton = document.getElementById('howto-button');
  const howtoDialog = document.getElementById('howto-dialog');

  function showScreen(screenToShow, headingToFocus) {
    const screens = [titleScreen, modeScreen];
    for (const screen of screens) {
      const isVisible = screen === screenToShow;
      screen.hidden = !isVisible;
      screen.classList.toggle('is-active', isVisible);
      screen.setAttribute('aria-hidden', String(!isVisible));
    }
    headingToFocus.focus({ preventScroll: true });
  }

  startButton.addEventListener('click', () => {
    modeStatus.textContent = '';
    modeOptions.forEach((option) => {
      option.classList.remove('is-selected');
      option.setAttribute('aria-pressed', 'false');
    });
    showScreen(modeScreen, modeTitle);
  });

  backButton.addEventListener('click', () => {
    showScreen(titleScreen, document.getElementById('main-title'));
  });

  modeOptions.forEach((option) => {
    option.addEventListener('click', () => {
      modeOptions.forEach((otherOption) => {
        const isSelected = otherOption === option;
        otherOption.classList.toggle('is-selected', isSelected);
        otherOption.setAttribute('aria-pressed', String(isSelected));
      });
      modeStatus.textContent = `${option.dataset.mode} を選択しました`;
    });
  });

  howtoButton.addEventListener('click', () => howtoDialog.showModal());
  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => howtoDialog.close());
  });

  howtoDialog.addEventListener('click', (event) => {
    if (event.target === howtoDialog) howtoDialog.close();
  });
})();
