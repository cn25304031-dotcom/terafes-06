"use strict";

// ---------- Reset and start ----------

function resetGame() {
    score = 0;
    defeatedEnemies = 0;
    waveTime = 0;
    waveSchedule = [];
    waveNumber = 0;
    startWave();
    gameTime = 0;
    boss = null;
    bossSpawned = false;
    bossWarned = false;
    bgPlanet = new PlanetSprite(PLANETS[stageIdx], PLANETS[stageIdx].bgR);
    shake = 0;

    playerBullets = [];
    enemyBullets = [];
    enemies = [];
    items = [];
    particles = [];
    rings = [];
    hurtFlash = 0;

    player = {
        x: WIDTH / 2,
        y: HEIGHT - 75,
        width: 30,
        height: 36,
        speed: 300,
        hp: 3,
        power: 1,
        double: 0,
        shootTimer: 0,
        invincible: 0,
        shield: 0
    };

    updateUI();
}

function startGame() {
    resetGame();
    state = "playing";
    overlay.classList.add("hidden");
    stageSelect.classList.add("hidden");
    lastTime = performance.now();
    showBanner("", PLANETS[stageIdx].name, false);
}

startButton.addEventListener("click", () => {
    if (state === "paused") {
        state = "playing";
        overlay.classList.add("hidden");
        lastTime = performance.now();
    } else if (state === "clear") {
        if (stageIdx < PLANETS.length - 1) { stageIdx++; startGame(); }
        else openStageSelect();
    } else if (state === "over" || state === "ready") {
        startGame();
    }
});
menuButton.addEventListener("click", openStageSelect);

// ---------- Keyboard ----------

window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (
        key === " " ||
        key.startsWith("arrow") ||
        ["w", "a", "s", "d", "escape"].includes(key)
    ) {
        event.preventDefault();
    }

    if (key === "m") { toggleSfx(); return; }

    if (key === "escape") {
        if (state === "playing") {
            state = "paused";
            showOverlay("PAUSED", "Escキーで再開できます。", "RESUME", true);
        } else if (state === "paused") {
            state = "playing";
            overlay.classList.add("hidden");
            lastTime = performance.now();
        }
        return;
    }

    keys.add(key);
});

window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
});

window.addEventListener("blur", () => {
    keys.clear();

    if (state === "playing") {
        state = "paused";
        showOverlay("PAUSED", "Escキーまたはボタンで再開できます。", "RESUME", true);
    }
});
