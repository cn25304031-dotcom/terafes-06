<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#050d2b">
  <title>SPACE SHOOTER × CARD MATCHING</title>
  <link rel="stylesheet" href="styles.css">
  <script src="app.js" defer></script>
</head>
<body>
  <main class="app-shell" aria-label="SPACE SHOOTER × CARD MATCHING">
    <div class="game-frame">
      <div class="frame-stars" aria-hidden="true"></div>
      <div class="planet planet--violet" aria-hidden="true"></div>
      <div class="planet planet--blue" aria-hidden="true"></div>
      <div class="planet planet--ringed" aria-hidden="true"><span></span></div>

      <section class="screen title-screen is-active" id="title-screen" aria-labelledby="main-title">
        <div class="title-topline"><span class="orbit-dot"></span> TERA FES <span class="topline-divider">✦</span> SPACE ARCADE</div>
        <header class="title-heading">
          <h1 class="game-logo" id="main-title" tabindex="-1">
            <span class="logo-blue">SPACE SHOOTER</span>
            <span class="logo-cross" aria-hidden="true">×</span>
            <span class="logo-pink">CARD MATCHING</span>
          </h1>
          <p class="tagline">〜 宇宙でカードをそろえよう！ 〜</p>
        </header>

        <div class="title-art" aria-hidden="true">
          <div class="twinkle twinkle--one">✦</div><div class="twinkle twinkle--two">✧</div>
          <div class="title-card title-card--left"><span>★</span></div>
          <div class="title-card title-card--right"><span>★</span></div>
          <div class="title-card title-card--lower-left"><span>★</span></div>
          <div class="title-card title-card--lower-right"><span>★</span></div>
          <svg class="rocket rocket--hero" viewBox="0 0 112 150" role="img" aria-label="宇宙船">
            <defs>
              <linearGradient id="rocketBody" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#fff"/><stop offset=".55" stop-color="#a9eaff"/><stop offset="1" stop-color="#40a8ff"/></linearGradient>
              <linearGradient id="rocketFlame" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#fff37a"/><stop offset=".35" stop-color="#15eaff"/><stop offset="1" stop-color="#2174ff" stop-opacity="0"/></linearGradient>
            </defs>
            <path d="M56 112c-9 11-10 22-5 34l5-7 5 7c5-12 4-23-5-34Z" fill="url(#rocketFlame)"/>
            <path d="M39 94 16 111l4-34c5-11 12-17 25-19M73 94l23 17-4-34c-5-11-12-17-25-19" fill="#ff526c" stroke="#a8f4ff" stroke-width="4" stroke-linejoin="round"/>
            <path d="M56 9c-19 17-27 43-24 82l24 22 24-22c3-39-5-65-24-82Z" fill="url(#rocketBody)" stroke="#42cfff" stroke-width="4"/>
            <path d="M56 11v94" stroke="#e9fbff" stroke-width="2" opacity=".8"/>
            <ellipse cx="56" cy="54" rx="10" ry="14" fill="#1266c8" stroke="#e8ffff" stroke-width="4"/>
            <path d="M43 99h26" stroke="#fbfdff" stroke-width="5" stroke-linecap="round"/>
          </svg>
          <div class="rocket-trail"></div>
          <div class="art-caption"><span class="art-caption-line"></span> READY FOR TAKEOFF <span class="art-caption-line"></span></div>
        </div>

        <nav class="title-actions" aria-label="タイトルメニュー">
          <button class="button button--primary" id="start-button" type="button"><span class="button-icon" aria-hidden="true">▶</span> ゲームスタート</button>
          <button class="button button--ghost" id="howto-button" type="button">遊び方</button>
        </nav>
        <p class="title-footnote">PRESS START TO BEGIN</p>
      </section>

      <section class="screen mode-screen" id="mode-screen" aria-labelledby="mode-title" hidden>
        <header class="mode-heading">
          <p class="eyebrow"><span>MISSION SELECT</span></p>
          <h2 id="mode-title" tabindex="-1">モードを選んでください</h2>
          <p class="mode-subtitle">遊びたいゲームをタップ！</p>
        </header>

        <div class="mode-options" role="group" aria-label="ゲームモード">
          <button class="mode-option mode-option--shooter" type="button" data-mode="Space Shooter" aria-pressed="false">
            <span class="mode-art mode-art--rocket" aria-hidden="true">
              <svg viewBox="0 0 112 150">
                <path d="M56 112c-9 11-10 22-5 34l5-7 5 7c5-12 4-23-5-34Z" fill="#20d9ff"/>
                <path d="M39 94 16 111l4-34c5-11 12-17 25-19M73 94l23 17-4-34c-5-11-12-17-25-19" fill="#ff5574" stroke="#b8f5ff" stroke-width="4" stroke-linejoin="round"/>
                <path d="M56 9c-19 17-27 43-24 82l24 22 24-22c3-39-5-65-24-82Z" fill="#dffaff" stroke="#56dcff" stroke-width="4"/>
                <ellipse cx="56" cy="54" rx="10" ry="14" fill="#1386ee" stroke="#f3ffff" stroke-width="4"/>
                <path d="M43 99h26" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="mode-copy"><strong>Space Shooter</strong><small>敵を倒してスコアを稼ごう！</small></span>
            <span class="mode-arrow" aria-hidden="true">›</span>
          </button>

          <button class="mode-option mode-option--cards" type="button" data-mode="Card Matching" aria-pressed="false">
            <span class="mode-art mode-art--cards" aria-hidden="true">
              <span class="mini-card mini-card--back">✦</span><span class="mini-card mini-card--front">●</span>
            </span>
            <span class="mode-copy"><strong>Card Matching</strong><small>カードをめくって<br>ペアを見つけよう！</small></span>
            <span class="mode-arrow" aria-hidden="true">›</span>
          </button>
        </div>

        <p class="mode-status" id="mode-status" role="status" aria-live="polite"></p>
        <div class="mode-bottom">
          <button class="button button--back" id="back-button" type="button"><span aria-hidden="true">←</span> 戻る</button>
          <p class="mode-footnote">CHOOSE YOUR ADVENTURE</p>
        </div>
      </section>
    </div>
  </main>

  <dialog class="howto-dialog" id="howto-dialog" aria-labelledby="howto-title">
    <button class="dialog-close" type="button" aria-label="閉じる" data-close-dialog>×</button>
    <p class="eyebrow"><span>HOW TO PLAY</span></p>
    <h2 id="howto-title">遊び方</h2>
    <ol class="howto-list">
      <li><span>01</span><div><strong>ゲームスタート</strong><small>スタートボタンからモード選択へ進みます。</small></div></li>
      <li><span>02</span><div><strong>好きなモードを選ぶ</strong><small>シューティングかカードマッチングを選んでください。</small></div></li>
      <li><span>03</span><div><strong>宇宙のミッションに挑戦！</strong><small>スコアやペアを集めてクリアを目指そう。</small></div></li>
    </ol>
    <button class="button button--primary dialog-done" type="button" data-close-dialog>わかった！</button>
  </dialog>
</body>
</html>
