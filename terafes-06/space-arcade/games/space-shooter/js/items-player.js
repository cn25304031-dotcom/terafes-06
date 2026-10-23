"use strict";

// ---------- Items ----------

function collectItem(item) {
    if (item.type === "double") {
        player.double = 12;                          // double shot for 12 s
        createParticles(item.x, item.y, "#ffd27a", 14);
        createRing(player.x, player.y, "255,210,122", 60);
    } else if (item.type === "heal") {
        player.hp = Math.min(3, player.hp + 1);
        createParticles(item.x, item.y, "#ff718c", 14);
        createRing(player.x, player.y, "255,113,140", 60);
    } else if (item.type === "shield") {
        player.shield = 6;
        player.invincible = Math.max(player.invincible, 6);
        createParticles(item.x, item.y, "#70caff", 14);
        createRing(player.x, player.y, "112,202,255", 60);
    }
}

// ---------- Player ----------

function playerShoot() {
    laserSfx();
    // Bullets always fly straight up, from the nose of the ship.
    const offsets = player.double > 0 ? [-9, 9] : [0];

    for (const offset of offsets) {
        playerBullets.push({
            x: player.x + offset,
            y: player.y - 24,
            vx: 0,
            vy: -540,
            radius: 4,
            damage: 1
        });
    }
}

function damagePlayer() {
    if (player.invincible > 0) return;

    player.hp--;
    player.invincible = 1.2;
    shake = 7;

    createParticles(player.x, player.y, "#ff647d", 18);
    createRing(player.x, player.y, "255,100,125", 70);
    hurtFlash = 0.55;

    if (player.hp <= 0) {
        player.hp = 0;
        gameOver();
    }

    updateUI();
}
