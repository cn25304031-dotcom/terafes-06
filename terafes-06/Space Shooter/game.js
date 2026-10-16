
"use strict";

// ==============================
// Space Shooter - Game Logic
// ==============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const hpElement = document.getElementById("hp");
const powerElement = document.getElementById("power");
const bossHpElement = document.getElementById("bossHp");
const bossBarFill = document.getElementById("bossBarFill");
const bestScoreElement = document.getElementById("bestScore");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");
const startButton = document.getElementById("startButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const BOSS_KILL_LIMIT = 15;

const keys = new Set();

let state = "ready";
let score = 0;
let bestScore = loadBestScore();
let defeatedEnemies = 0;
let spawnTimer = 0;
let gameTime = 0;
let lastTime = 0;
let animationId = 0;
let boss = null;
let bossSpawned = false;
let shake = 0;

let player;
let playerBullets = [];
let enemyBullets = [];
let enemies = [];
let items = [];
let particles = [];

const stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 45 + 15
}));

// ---------- Local storage ----------

function loadBestScore() {
    try {
        return Number(localStorage.getItem("spaceShooterBest")) || 0;
    } catch {
        return 0;
    }
}

function saveBestScore() {
    if (score > bestScore) {
        bestScore = score;

        try {
            localStorage.setItem("spaceShooterBest", String(bestScore));
        } catch {
            // The game still works if storage is unavailable.
        }
    }

    bestScoreElement.textContent = bestScore;
}

// ---------- Reset and start ----------

function resetGame() {
    score = 0;
    defeatedEnemies = 0;
    spawnTimer = 0;
    gameTime = 0;
    boss = null;
    bossSpawned = false;
    shake = 0;

    playerBullets = [];
    enemyBullets = [];
    enemies = [];
    items = [];
    particles = [];

    player = {
        x: WIDTH / 2,
        y: HEIGHT - 75,
        width: 30,
        height: 36,
        speed: 300,
        hp: 3,
        power: 1,
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
    lastTime = performance.now();
}

startButton.addEventListener("click", () => {
    if (state === "ready" || state === "over" || state === "clear") {
        startGame();
    } else if (state === "paused") {
        state = "playing";
        overlay.classList.add("hidden");
        lastTime = performance.now();
    }
});

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

    if (key === "escape") {
        if (state === "playing") {
            state = "paused";
            showOverlay("PAUSED", "Escキーで再開できます。", "RESUME");
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
        showOverlay("PAUSED", "Escキーまたはボタンで再開できます。", "RESUME");
    }
});

// ---------- UI and overlay ----------

function updateUI() {
    scoreElement.textContent = score;
    hpElement.textContent =
        "♥ ".repeat(Math.max(0, player.hp)).trim() || "0";

    powerElement.textContent = player.power;

    if (boss) {
        bossHpElement.textContent = Math.max(0, Math.ceil(boss.hp));
        bossBarFill.style.width =
            `${Math.max(0, boss.hp / boss.maxHp * 100)}%`;
    } else {
        bossHpElement.textContent = "---";
        bossBarFill.style.width = "0%";
    }

    bestScoreElement.textContent = bestScore;
}

function showOverlay(title, message, buttonText) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    startButton.textContent = buttonText;
    overlay.classList.remove("hidden");
}

function gameOver() {
    if (state !== "playing") return;

    state = "over";
    saveBestScore();

    showOverlay(
        "GAME OVER",
        `SCORE: ${score}\nBEST SCORE: ${bestScore}`,
        "RETRY"
    );
}

function stageClear() {
    if (state !== "playing") return;

    state = "clear";
    score += 1000;
    saveBestScore();
    updateUI();

    showOverlay(
        "STAGE CLEAR!",
        `ボスを撃破しました！\nSCORE: ${score}\nボーナス +1000`,
        "PLAY AGAIN"
    );
}

// ---------- Utility ----------

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function distanceSquared(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
}

function hit(a, b, radiusA, radiusB) {
    const radius = radiusA + radiusB;
    return distanceSquared(a, b) < radius * radius;
}

function createParticles(x, y, color, amount = 12) {
    for (let i = 0; i < amount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = random(40, 190);

        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: random(0.25, 0.7),
            maxLife: 0.7,
            size: random(2, 5),
            color
        });
    }
}

function addScore(points) {
    score += points;
    saveBestScore();
}

// ---------- Enemies ----------

function spawnEnemy() {
    const strong = Math.random() < 0.23;

    enemies.push({
        x: random(35, WIDTH - 35),
        y: -35,
        width: strong ? 38 : 28,
        height: strong ? 34 : 27,
        hp: strong ? 4 : 1,
        maxHp: strong ? 4 : 1,
        speed: strong ? random(65, 100) : random(100, 155),
        strong,
        shootTimer: random(0.8, 2),
        phase: random(0, Math.PI * 2)
    });
}

function defeatEnemy(enemy, index) {
    createParticles(
        enemy.x,
        enemy.y,
        enemy.strong ? "#ff9c55" : "#ff587e"
    );

    addScore(enemy.strong ? 150 : 50);
    defeatedEnemies++;

    if (Math.random() < 0.23) {
        const type = Math.random();

        items.push({
            x: enemy.x,
            y: enemy.y,
            type: type < 0.4 ? "power" :
                  type < 0.7 ? "heal" : "shield",
            radius: 13,
            speed: 90
        });
    }

    enemies.splice(index, 1);

    if (defeatedEnemies >= BOSS_KILL_LIMIT && !bossSpawned) {
        spawnBoss();
    }
}

// ---------- Boss ----------

function spawnBoss() {
    bossSpawned = true;
    enemies = [];
    enemyBullets = [];

    boss = {
        x: WIDTH / 2,
        y: 105,
        width: 112,
        height: 75,
        hp: 180,
        maxHp: 180,
        speed: 125,
        direction: 1,
        attackTimer: 1.1,
        pattern: 0,
        patternTimer: 0,
        flash: 0
    };

    showOverlay("WARNING!", "BOSS APPROACHING!", "FIGHT!");
    state = "paused";
}

function bossShoot() {
    if (!boss) return;

    boss.pattern = (boss.pattern + 1) % 3;

    if (boss.pattern === 0) {
        // Spread attack
        for (let angle = -0.55; angle <= 0.56; angle += 0.28) {
            enemyBullets.push({
                x: boss.x,
                y: boss.y + 25,
                vx: Math.sin(angle) * 160,
                vy: Math.cos(angle) * 210,
                radius: 6,
                color: "#ff5caa"
            });
        }
    } else if (boss.pattern === 1) {
        // Aimed three-shot attack
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const baseAngle = Math.atan2(dy, dx);

        for (const offset of [-0.2, 0, 0.2]) {
            const angle = baseAngle + offset;

            enemyBullets.push({
                x: boss.x,
                y: boss.y + 20,
                vx: Math.cos(angle) * 240,
                vy: Math.sin(angle) * 240,
                radius: 6,
                color: "#ffb84d"
            });
        }
    } else {
        // Horizontal wave
        for (let i = 0; i < 9; i++) {
            enemyBullets.push({
                x: boss.x + (i - 4) * 13,
                y: boss.y + 30,
                vx: (i - 4) * 24,
                vy: 180,
                radius: 5,
                color: "#cf83ff"
            });
        }
    }
}

function damageBoss(damage) {
    if (!boss) return;

    boss.hp -= damage;
    boss.flash = 0.08;

    if (boss.hp <= 0) {
        createParticles(boss.x, boss.y, "#ff71d4", 55);
        createParticles(boss.x, boss.y, "#7beaff", 35);
        boss = null;
        enemyBullets = [];
        stageClear();
    }
}

// ---------- Items ----------

function collectItem(item) {
    if (item.type === "power") {
        player.power = Math.min(5, player.power + 1);
        createParticles(item.x, item.y, "#72ffce", 10);
    } else if (item.type === "heal") {
        player.hp = Math.min(3, player.hp + 1);
        createParticles(item.x, item.y, "#ff718c", 10);
    } else if (item.type === "shield") {
        player.shield = 5;
        player.invincible = Math.max(player.invincible, 5);
        createParticles(item.x, item.y, "#70caff", 10);
    }
}

// ---------- Player ----------

function playerShoot() {
    const count = player.power >= 4 ? 3 : player.power >= 2 ? 2 : 1;

    if (count === 1) {
        playerBullets.push({
            x: player.x,
            y: player.y - 22,
            vx: 0,
            vy: -470,
            radius: 4,
            damage: player.power >= 3 ? 2 : 1
        });
    } else {
        const offsets = count === 3 ? [-12, 0, 12] : [-8, 8];

        for (const offset of offsets) {
            playerBullets.push({
                x: player.x + offset,
                y: player.y - 20,
                vx: offset * 1.8,
                vy: -470,
                radius: 4,
                damage: player.power >= 3 ? 2 : 1
            });
        }
    }
}

function damagePlayer() {
    if (player.invincible > 0) return;

    player.hp--;
    player.invincible = 1.2;
    shake = 7;

    createParticles(player.x, player.y, "#ff647d", 18);

    if (player.hp <= 0) {
        player.hp = 0;
        gameOver();
    }

    updateUI();
}

// ---------- Update game ----------

function update(dt) {
    gameTime += dt;

    // Starfield
    for (const star of stars) {
        star.y += star.speed * dt;

        if (star.y > HEIGHT) {
            star.y = 0;
            star.x = Math.random() * WIDTH;
        }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.life <= 0) particles.splice(i, 1);
    }

    if (shake > 0) shake = Math.max(0, shake - 25 * dt);

    // Player movement
    let dx = 0;
    let dy = 0;

    if (keys.has("a") || keys.has("arrowleft")) dx--;
    if (keys.has("d") || keys.has("arrowright")) dx++;
    if (keys.has("w") || keys.has("arrowup")) dy--;
    if (keys.has("s") || keys.has("arrowdown")) dy++;

    const length = Math.hypot(dx, dy) || 1;

    player.x += (dx / length) * player.speed * dt;
    player.y += (dy / length) * player.speed * dt;

    player.x = Math.max(20, Math.min(WIDTH - 20, player.x));
    player.y = Math.max(25, Math.min(HEIGHT - 25, player.y));

    player.invincible = Math.max(0, player.invincible - dt);
    player.shield = Math.max(0, player.shield - dt);

    // Continuous shooting
    player.shootTimer -= dt;

    if (keys.has(" ") && player.shootTimer <= 0) {
        playerShoot();
        player.shootTimer = Math.max(0.09, 0.23 - player.power * 0.025);
    }

    // Spawn enemies until boss appears
    if (!bossSpawned) {
        spawnTimer -= dt;

        if (spawnTimer <= 0) {
            spawnEnemy();
            spawnTimer = random(0.55, 1.05);
        }
    }

    // Enemy movement and shooting
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        enemy.y += enemy.speed * dt;
        enemy.x += Math.sin(gameTime * 2 + enemy.phase) * 45 * dt;
        enemy.x = Math.max(20, Math.min(WIDTH - 20, enemy.x));

        if (enemy.strong) {
            enemy.shootTimer -= dt;

            if (enemy.shootTimer <= 0) {
                const angle = Math.atan2(
                    player.y - enemy.y,
                    player.x - enemy.x
                );

                enemyBullets.push({
                    x: enemy.x,
                    y: enemy.y + 12,
                    vx: Math.cos(angle) * 170,
                    vy: Math.sin(angle) * 170,
                    radius: 5,
                    color: "#ffae58"
                });

                enemy.shootTimer = random(1.3, 2);
            }
        }

        if (hit(player, enemy, 15, enemy.width * 0.38)) {
            damagePlayer();
            defeatEnemy(enemy, i);
            continue;
        }

        if (enemy.y > HEIGHT + 40) {
            enemies.splice(i, 1);
        }
    }

    // Boss movement and attack patterns
    if (boss) {
        boss.x += boss.speed * boss.direction * dt;

        if (boss.x < 75 || boss.x > WIDTH - 75) {
            boss.direction *= -1;
        }

        boss.y = 105 + Math.sin(gameTime * 1.4) * 18;
        boss.attackTimer -= dt;
        boss.flash = Math.max(0, boss.flash - dt);

        if (boss.attackTimer <= 0) {
            bossShoot();
            boss.attackTimer = 0.85;
        }
    }

    // Player bullets
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];

        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;

        let removed = false;

        if (boss && hit(bullet, boss, bullet.radius, 42)) {
            damageBoss(bullet.damage);
            playerBullets.splice(i, 1);
            removed = true;
        }

        if (removed) continue;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];

            if (hit(bullet, enemy, bullet.radius, enemy.width * 0.38)) {
                enemy.hp -= bullet.damage;
                createParticles(bullet.x, bullet.y, "#78f3ff", 3);
                playerBullets.splice(i, 1);
                removed = true;

                if (enemy.hp <= 0) {
                    defeatEnemy(enemy, j);
                }

                break;
            }
        }

        if (!removed && bullet.y < -20) {
            playerBullets.splice(i, 1);
        }
    }

    // Enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];

        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;

        if (hit(player, bullet, 12, bullet.radius)) {
            damagePlayer();
            enemyBullets.splice(i, 1);
            continue;
        }

        if (
            bullet.y > HEIGHT + 30 ||
            bullet.y < -30 ||
            bullet.x < -30 ||
            bullet.x > WIDTH + 30
        ) {
            enemyBullets.splice(i, 1);
        }
    }

    // Pickups
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];

        item.y += item.speed * dt;

        if (hit(player, item, 15, item.radius)) {
            collectItem(item);
            items.splice(i, 1);
            continue;
        }

        if (item.y > HEIGHT + 20) {
            items.splice(i, 1);
        }
    }

    updateUI();
}

// ---------- Drawing ----------

function drawBackground() {
    ctx.fillStyle = "#050a19";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const gradient = ctx.createRadialGradient(
        WIDTH / 2, HEIGHT / 2, 20,
        WIDTH / 2, HEIGHT / 2, HEIGHT
    );

    gradient.addColorStop(0, "rgba(22, 47, 100, 0.35)");
    gradient.addColorStop(1, "rgba(2, 5, 18, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (const star of stars) {
        ctx.globalAlpha = 0.45 + star.size * 0.2;
        ctx.fillStyle = "#d6edff";
        ctx.fillRect(star.x, star.y, star.size, star.size * 1.8);
    }

    ctx.globalAlpha = 1;
}

function drawPlayer() {
    if (
        player.invincible > 0 &&
        Math.floor(gameTime * 15) % 2 === 0
    ) {
        return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    // Engine flame
    ctx.fillStyle = "#48cfff";
    ctx.beginPath();
    ctx.moveTo(-7, 12);
    ctx.lineTo(0, 28 + Math.random() * 5);
    ctx.lineTo(7, 12);
    ctx.closePath();
    ctx.fill();

    // Ship body
    ctx.fillStyle = "#bcecff";
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(16, 14);
    ctx.lineTo(0, 8);
    ctx.lineTo(-16, 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#378cff";
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(6, 8);
    ctx.lineTo(0, 5);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-2, -5, 4, 9);

    if (player.shield > 0) {
        ctx.strokeStyle = "#62d9ff";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#62d9ff";
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    ctx.fillStyle = enemy.strong ? "#ff9b55" : "#ff587e";
    ctx.shadowBlur = 12;
    ctx.shadowColor = ctx.fillStyle;

    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(-enemy.width / 2, -8);
    ctx.lineTo(-7, -3);
    ctx.lineTo(0, -15);
    ctx.lineTo(7, -3);
    ctx.lineTo(enemy.width / 2, -8);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-7, -2, 4, 4);
    ctx.fillRect(3, -2, 4, 4);

    if (enemy.strong) {
        ctx.fillStyle = "#54253e";
        ctx.fillRect(-15, -23, 30, 4);
        ctx.fillStyle = "#ffb56a";
        ctx.fillRect(-15, -23, 30 * enemy.hp / enemy.maxHp, 4);
    }

    ctx.restore();
}

function drawBoss() {
    if (!boss) return;

    ctx.save();
    ctx.translate(boss.x, boss.y);

    ctx.shadowBlur = 22;
    ctx.shadowColor = "#ff3eae";
    ctx.fillStyle = boss.flash > 0 ? "#ffffff" : "#922c88";

    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(35, -27);
    ctx.lineTo(56, -4);
    ctx.lineTo(48, 23);
    ctx.lineTo(20, 34);
    ctx.lineTo(0, 25);
    ctx.lineTo(-20, 34);
    ctx.lineTo(-48, 23);
    ctx.lineTo(-56, -4);
    ctx.lineTo(-35, -27);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ff6fcb";
    ctx.fillRect(-35, -5, 15, 8);
    ctx.fillRect(20, -5, 15, 8);

    ctx.fillStyle = "#6feaff";
    ctx.fillRect(-7, -20, 14, 23);

    ctx.fillStyle = "#421c60";
    ctx.fillRect(-28, 22, 56, 10);

    ctx.restore();
}

function drawBullet(bullet, friendly) {
    ctx.save();

    ctx.fillStyle = friendly ? "#8afaff" : bullet.color;
    ctx.shadowBlur = friendly ? 12 : 8;
    ctx.shadowColor = ctx.fillStyle;

    ctx.beginPath();
    ctx.arc(
        bullet.x,
        bullet.y,
        bullet.radius,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
}

function drawItem(item) {
    const styles = {
        power: { color: "#6bffd0", label: "P" },
        heal: { color: "#ff789b", label: "+" },
        shield: { color: "#70baff", label: "S" }
    };

    const style = styles[item.type];

    ctx.save();
    ctx.fillStyle = style.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = style.color;

    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#071326";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(style.label, item.x, item.y);

    ctx.restore();
}

function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    ctx.globalAlpha = 1;
}

function draw() {
    ctx.save();

    if (shake > 0) {
        ctx.translate(
            random(-shake, shake),
            random(-shake, shake)
        );
    }

    drawBackground();

    for (const item of items) drawItem(item);
    for (const enemy of enemies) drawEnemy(enemy);
    for (const bullet of playerBullets) drawBullet(bullet, true);
    for (const bullet of enemyBullets) drawBullet(bullet, false);

    drawBoss();

    if (player) drawPlayer();

    drawParticles();

    ctx.restore();
}

// ---------- Main loop ----------

function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000 || 0, 0.033);
    lastTime = timestamp;

    if (state === "playing") {
        update(dt);
    } else {
        // Stars continue moving while paused or at the title screen.
        for (const star of stars) {
            star.y += star.speed * dt * 0.35;

            if (star.y > HEIGHT) {
                star.y = 0;
                star.x = Math.random() * WIDTH;
            }
        }
    }

    draw();
    animationId = requestAnimationFrame(loop);
}

// ---------- Initial screen ----------

player = {
    x: WIDTH / 2,
    y: HEIGHT - 75,
    width: 30,
    height: 36,
    speed: 300,
    hp: 3,
    power: 1,
    shootTimer: 0,
    invincible: 0,
    shield: 0
};

bestScoreElement.textContent = bestScore;
updateUI();

showOverlay(
    "SPACE SHOOTER",
    "敵を倒して、ボスを撃破しよう！\nWASD / 矢印キー：移動　Space：射撃",
    "GAME START"
);

lastTime = performance.now();
animationId = requestAnimationFrame(loop);
