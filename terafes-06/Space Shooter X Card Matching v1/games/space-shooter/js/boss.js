"use strict";

// ---------- Boss: THE DEVOURER ----------

function spawnBoss() {
    bossSpawned = true;
    enemies = [];
    enemyBullets = [];

    const lv = 16 + stageIdx * 3;   // HP per level (5 levels)
    boss = {
        x: WIDTH / 2, y: -240, width: 381, height: 263,
        level: BOSS_LEVELS, levelMax: lv, levelHp: lv,
        hp: lv * BOSS_LEVELS, maxHp: lv * BOSS_LEVELS,
        direction: 1, attackTimer: 1.4, pattern: 0, flash: 0,
        enter: 2.4, invuln: 0, roar: 0, tilt: 0,
        mode: "patrol", modeT: 0, lungeCd: 7, lockY: 300,
        dead: false, deathT: 0, drool: 0
    };

    shake = 12;
    hurtFlash = 0.5;
    roarSfx();
    showBanner("BOSS", "THE DEVOURER", true);
}

function bossShoot() {
    const b = boss;
    if (!b) return;

    const phase = BOSS_LEVELS + 1 - b.level;
    const k = 1 + stageIdx * 0.035;
    const down = Math.PI / 2;
    const BOLT = "#ff6a3d", PLASMA = "#ff2e4d", EMBER = "#ffb84d";
    b.fireFlash = b.fireFlash || {};

    // every shot leaves from a real weapon mount on the ship
    const mount = (name) => ({ name, x: b.x + BOSS_MUZ[name][0], y: b.y + BOSS_MUZ[name][1] });
    const fire = (m, ang, spd, r, color, bolt) => {
        enemyBullets.push({
            x: m.x, y: m.y, vx: Math.cos(ang) * spd * k, vy: Math.sin(ang) * spd * k,
            radius: r, color, bolt: !!bolt
        });
        b.fireFlash[m.name] = 1;
        createParticles(m.x, m.y, color, 2);
    };
    const aim = (m, spread = 0.9) =>
        Math.max(down - spread, Math.min(down + spread, Math.atan2(player.y - m.y, player.x - m.x)));
    const fan = (m, n, total, spd, r, color) => {
        for (let i = 0; i < n; i++) fire(m, down + (i / (n - 1) - 0.5) * total, spd, r, color);
    };

    const CL = mount("cl"), CR = mount("cr"), CORE = mount("core"), DL = mount("dl"), DR = mount("dr");
    const heavy = (m, off = 0) => fire(m, aim(m) + off, 290, 5, BOLT, true);   // cannon bolts
    const spit = (m, off = 0) => fire(m, aim(m, 1.1) + off, 235, 3.6, EMBER, false); // dome turrets

    const p = ++b.pattern;

    if (phase === 1) {
        heavy(p % 2 ? CL : CR);
    } else if (phase === 2) {
        heavy(CL); heavy(CR);
        if (p % 2) fan(CORE, 3, 0.5, 200, 5.5, PLASMA);
    } else if (phase === 3) {
        const m = p % 3;
        if (m === 0) { heavy(CL); heavy(CR); spit(DL); spit(DR); }
        else if (m === 1) fan(CORE, 7, 1.1, 215, 5.5, PLASMA);
        else { heavy(CL, -0.08); heavy(CR, 0.08); }
    } else if (phase === 4) {
        heavy(CL, -0.06); heavy(CL, 0.06); heavy(CR, -0.06); heavy(CR, 0.06);
        spit(DL); spit(DR);
        if (p % 2) fan(CORE, 9, 1.5, 195, 5.5, PLASMA);
    } else {
        const m = p % 3;
        if (m === 0) {
            for (let i = 0; i < 13; i++) fire(CORE, 0.25 + (i / 12) * (Math.PI - 0.5), 220, 5.5, PLASMA);
        } else if (m === 1) {
            for (const o of [-0.1, 0, 0.1]) { heavy(CL, o); heavy(CR, o); }
            spit(DL); spit(DR);
        } else {
            fan(CORE, 11, 1.4, 205, 5.5, PLASMA);
            heavy(CL); heavy(CR);
        }
    }
}

function damageBoss(damage) {
    const b = boss;
    if (!b || b.dead || b.enter > 0) return;

    if (b.invuln > 0) { createParticles(b.x, b.y + 30, "#ffffff", 2); return; }

    b.levelHp -= damage;
    b.hp -= damage;
    b.flash = 0.07;
    bossHitSfx();

    if (b.levelHp > 0) return;

    if (b.level > 1) {
        // one HP level down -> it gets angrier
        b.level--;
        b.levelHp = b.levelMax;
        b.invuln = 1.4;
        b.roar = 1.2;
        b.mode = "patrol";
        enemyBullets = [];
        shake = 14;
        hurtFlash = 0.6;
        createParticles(b.x, b.y, "#ff3b3b", 40);
        createParticles(b.x, b.y, "#a6ff2e", 20);
        createRing(b.x, b.y, "255,60,60", 200, 420);
        createRing(b.x, b.y, "166,255,46", 140, 320);
        addScore(300);
        roarSfx();
        showBanner(`PHASE ${BOSS_LEVELS + 1 - b.level} / ${BOSS_LEVELS}`, b.level === 1 ? "FINAL RAGE" : "ENRAGED", true);
    } else {
        // last level gone: death throes, then stage / chapter clear
        b.hp = 0; b.levelHp = 0;
        b.dead = true; b.deathT = 2.2;
        b.mode = "patrol";
        enemyBullets = [];
        shake = 16;
        roarSfx();
    }
}

function updateBoss(dt) {
    const b = boss;
    if (!b) return;

    b.flash = Math.max(0, b.flash - dt);
    b.invuln = Math.max(0, b.invuln - dt);
    b.roar = Math.max(0, b.roar - dt);
    if (b.fireFlash) for (const key in b.fireFlash) b.fireFlash[key] = Math.max(0, b.fireFlash[key] - dt * 4);

    const phase = BOSS_LEVELS + 1 - b.level;

    if (b.dead) {
        b.deathT -= dt;
        b.y += 22 * dt;
        b.tilt += dt * 0.15;
        createParticles(b.x + random(-110, 110), b.y + random(-70, 70), Math.random() < 0.5 ? "#a6ff2e" : "#ff4a3a", 4);
        if (Math.random() < 0.15) createRing(b.x + random(-90, 90), b.y + random(-60, 60), "255,90,60", 70, 220);
        shake = Math.max(shake, 6);
        if (b.deathT <= 0) {
            createParticles(b.x, b.y, "#ff3b3b", 60);
            createParticles(b.x, b.y, "#a6ff2e", 40);
            createRing(b.x, b.y, "255,80,60", 240, 420);
            createRing(b.x, b.y, "166,255,46", 170, 320);
            shake = 16;
            boss = null;
            enemyBullets = [];
            stageClear();
        }
        return;
    }

    if (b.enter > 0) {
        b.enter -= dt;
        const t = 1 - Math.max(0, b.enter) / 2.4;
        b.y = -240 + (110 + 240) * (1 - Math.pow(1 - t, 3));
        shake = Math.max(shake, 2.5 * (1 - t));
        return;
    }

    b.tilt += (Math.max(-0.28, Math.min(0.28, (b.vx || 0) * 0.0016)) - b.tilt) * Math.min(1, dt * 5);

    if (b.mode === "patrol") {
        b.moveT = (b.moveT || 0) - dt;
        if (b.moveT <= 0) {
            b.moveT = random(0.9, 2.1);
            b.tx = Math.random() < 0.55 ? player.x + random(-90, 90) : random(110, WIDTH - 110);
            b.tx = Math.max(110, Math.min(WIDTH - 110, b.tx));
        }
        const maxV = 150 + phase * 30;
        const want = Math.max(-maxV, Math.min(maxV, (b.tx - b.x) * 2.2));
        b.vx = (b.vx || 0) + (want - (b.vx || 0)) * Math.min(1, dt * 3);
        b.x = Math.max(100, Math.min(WIDTH - 100, b.x + b.vx * dt));
        b.direction = b.vx >= 0 ? 1 : -1;
        b.y = 110 + Math.sin(gameTime * 1.6) * 10 + Math.sin(gameTime * 0.7) * 8;

        b.attackTimer -= dt;
        if (b.attackTimer <= 0 && b.roar <= 0) {
            bossShoot();
            b.attackTimer = [1.15, 0.98, 0.86, 0.72, 0.55][phase - 1];
        }

        if (phase >= 3) {
            b.lungeCd -= dt;
            if (b.lungeCd <= 0 && b.roar <= 0) {
                b.mode = "windup"; b.modeT = 0.8;
                b.lungeCd = random(5, 7) - phase * 0.3;
                showBanner("DODGE", "IT'S LUNGING!", true);
            }
        }
    } else if (b.mode === "windup") {
        b.modeT -= dt;
        b.x += (player.x - b.x) * Math.min(1, dt * 3);
        b.y += (105 - b.y) * Math.min(1, dt * 5);
        shake = Math.max(shake, 3);
        if (b.modeT <= 0) {
            b.mode = "lunge"; b.modeT = 0.5;
            b.lockY = Math.max(280, Math.min(440, player.y - 80));
        }
    } else if (b.mode === "lunge") {
        b.modeT -= dt;
        b.y += (b.lockY - b.y) * Math.min(1, dt * 9);
        if (b.modeT <= 0) {
            b.mode = "return"; b.modeT = 0.9;
            shake = 8;
            createRing(b.x, b.y + 40, "255,70,60", 140, 420);
        }
    } else {
        b.modeT -= dt;
        b.y += (110 - b.y) * Math.min(1, dt * 3.5);
        if (b.modeT <= 0) b.mode = "patrol";
    }

    // claws / body contact
    if (hit(player, { x: b.x, y: b.y + 8 }, 13, 66)) damagePlayer();

    // acid drool
    b.drool -= dt;
    if (b.drool <= 0) {
        b.drool = 0.09;
        particles.push({ x: b.x + random(-30, 30), y: b.y - 50, vx: random(-20, 20), vy: random(-70, -30), life: 0.5, maxLife: 0.5, size: random(1.5, 3), color: "#ff5a3a" });
    }
}
