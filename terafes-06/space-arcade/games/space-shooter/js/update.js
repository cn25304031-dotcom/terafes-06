"use strict";

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

    for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.r += ring.speed * dt;
        if (ring.r >= ring.max) rings.splice(i, 1);
    }

    hurtFlash = Math.max(0, hurtFlash - dt * 1.6);

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
    player.double = Math.max(0, player.double - dt);

    // Continuous shooting
    player.shootTimer -= dt;

    if (keys.has(" ") && player.shootTimer <= 0) {
        playerShoot();
        player.shootTimer = 0.17;
    }

    // Waves: 5 normal enemies + 1 mid-level enemy every few seconds
    if (!bossSpawned) {
        waveTime += dt;

        while (waveSchedule.length && waveSchedule[0].t <= waveTime) {
            const next = waveSchedule.shift();
            if (enemies.length < MAX_ON_SCREEN) spawnEnemy(next.strong);
        }

        if (waveTime >= WAVE_LENGTH && waveSchedule.length === 0) startWave();
    }

    // Enemy movement and shooting
    const slow = (!bossSpawned && gameTime >= BOSS_TIME - 10) ? 0.45 : 1;   // enemies drift in slowly while the boss approaches
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        enemy.y += enemy.speed * slow * dt;
        enemy.x += Math.sin(gameTime * 2 + enemy.phase) * 45 * slow * dt;
        enemy.x = Math.max(20, Math.min(WIDTH - 20, enemy.x));

        if (enemy.strong) {
            enemy.shootTimer -= dt;

            if (enemy.shootTimer <= 0) {
                // Mid-level enemy fires straight down (very slight homing), never from the side
                const aim = Math.max(-30, Math.min(30, (player.x - enemy.x) * 0.15));

                enemyBullets.push({
                    x: enemy.x,
                    y: enemy.y + 16,
                    vx: aim,
                    vy: 210,
                    radius: 5,
                    color: "#ffae58"
                });

                enemy.shootTimer = random(1.6, 2.4);
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

    // The DEVOURER arrives 30 seconds after the stage starts
    if (!bossSpawned && !bossWarned && gameTime >= BOSS_TIME - 3.5) {
        bossWarned = true;
        hurtFlash = 0.35;
        showBanner("WARNING", "SOMETHING IS COMING", true);
    }
    if (!bossSpawned && gameTime >= BOSS_TIME) spawnBoss();

    updateBoss(dt);

    stageTag.textContent = boss
        ? `${PLANETS[stageIdx].name} · BOSS FIGHT`
        : `${PLANETS[stageIdx].name} · BOSS IN ${Math.max(0, Math.ceil(BOSS_TIME - gameTime))}s`;

    // Player bullets
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];

        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;

        let removed = false;

        if (boss && !boss.dead && boss.enter <= 0 && hit(bullet, { x: boss.x, y: boss.y + 8 }, bullet.radius, 76)) {
            damageBoss(bullet.damage);
            playerBullets.splice(i, 1);
            removed = true;
        }

        if (removed) continue;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];

            if (hit(bullet, enemy, bullet.radius, enemy.width * 0.38)) {
                enemy.hp -= bullet.damage;
                if (enemy.hp > 0) hitSfx();
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
