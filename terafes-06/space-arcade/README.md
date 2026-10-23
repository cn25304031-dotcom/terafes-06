# Space Arcade — Space Shooter × Card Matching

Open `index.html` in a browser (double-click works; no build step, no server needed).
Fonts, Tailwind, Font Awesome and confetti load from CDNs, so an internet connection is needed.

```
index.html                  title page + mode select
css/                        title page styles (base, title, mode-select, controls, theme, game-frame)
js/                         title page scripts (i18n, screens, menu, intro, interactions, chiptune, attract …)
games/
  space-shooter/
    index.html
    css/                    base, hud, overlay, stage-select
    js/                     storage, core, audio, planets, stage-select, banner, state, ui,
                            utility, enemies, boss, items-player, update, render, boss-sprite, main
    assets/boss_ship.webp   final boss sprite
  card-matching/
    index.html
    css/                    style, intro
    js/                     audio, game, intro, main
    assets/card_back.webp   card back image
```

Notes
- Script files are plain (non-module) scripts that share one global scope, so keep the `<script>` order
  in each `index.html`. `storage.js` must load first in Space Shooter.
- Games are opened in an iframe by the title page. They go back to the title with a
  `postMessage({ type: 'arcade-exit' })`, which also works from `file://`.
- Space Shooter sound effects (laser, hit, explosion, boss clank, roar) are synthesised in
  `games/space-shooter/js/audio.js`. Press **M** in the game to mute / unmute them.
