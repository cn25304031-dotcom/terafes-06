"use strict";

// ---------- Enemies ----------

// One wave = 5 normal enemies + 1 mid-level enemy that drops a bonus.
function startWave() {
    waveNumber++;
    waveTime = 0;
    waveSchedule = [];

    for (let i = 0; i < WAVE_NORMALS; i++) {
        waveSchedule.push({ t: 0.3 + i * 0.85 + random(-0.12, 0.12), strong: false });
    }

    waveSchedule.push({ t: 2.3, strong: true });
    waveSchedule.sort((a, b) => a.t - b.t);
}

function spawnEnemy(strong) {
    enemies.push({
        x: strong ? random(WIDTH * 0.3, WIDTH * 0.7) : random(35, WIDTH - 35),
        y: -40,
        width: strong ? 46 : 28,
        height: strong ? 40 : 27,
        hp: strong ? 8 : 1,
        maxHp: strong ? 8 : 1,
        speed: (strong ? random(55, 70) : random(95, 135)) * (1 + stageIdx * 0.05),
        strong,
        shootTimer: random(0.9, 1.5),
        phase: random(0, Math.PI * 2)
    });
}

function dropBonus(x, y) {
    // The mid-level enemy always drops one benefit.
    const pool = ["shield", "double"];
    if (player.hp < 3) pool.push("heal", "heal");

    items.push({
        x,
        y,
        type: pool[Math.floor(Math.random() * pool.length)],
        radius: 14,
        speed: 80
    });
}

function defeatEnemy(enemy, index) {
    boomSfx(enemy.strong);
    createParticles(
        enemy.x,
        enemy.y,
        enemy.strong ? "#ff9c55" : "#ff587e",
        enemy.strong ? 22 : 12
    );

    createRing(enemy.x, enemy.y, enemy.strong ? "255,156,85" : "255,88,126", enemy.strong ? 100 : 60);
    addScore(enemy.strong ? 250 : 50);
    defeatedEnemies++;

    if (enemy.strong) dropBonus(enemy.x, enemy.y);

    enemies.splice(index, 1);

}
