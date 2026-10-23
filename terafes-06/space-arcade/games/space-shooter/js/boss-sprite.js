"use strict";

// ---------- Boss sprite: dark battleship ----------
const BOSS_IMG = "assets/boss_ship.webp";
const BOSS_W = 200;
const BOSS_AR = 508 / 640;
const bossImg = new Image();
const bossSprites = { ready: false, base: null, flash: null, rage: null, w: 0, h: 0 };
bossImg.onload = () => {
    const tint = (fill) => {
        const c = document.createElement("canvas"); c.width = bossImg.width; c.height = bossImg.height;
        const g = c.getContext("2d"); g.drawImage(bossImg, 0, 0);
        g.globalCompositeOperation = "source-atop"; g.fillStyle = fill; g.fillRect(0, 0, c.width, c.height);
        return c;
    };
    bossSprites.base = tint("rgba(120,0,20,0.10)");
    bossSprites.flash = tint("rgba(255,255,255,0.55)");
    bossSprites.rage = tint("rgba(255,20,40,0.30)");
    bossSprites.w = bossImg.width; bossSprites.h = bossImg.height; bossSprites.ready = true;
};
bossImg.src = BOSS_IMG;

// Weapon mounts on the ship art (fractions of the sprite) -> offsets from the boss centre
const bf = (fx, fy) => [(fx - 0.5) * BOSS_W, (fy - 0.5) * BOSS_W * BOSS_AR];
const BOSS_MUZ = {
    cl: bf(0.50, 0.89),   // front-left heavy cannon
    cr: bf(0.80, 0.89),   // front-right heavy cannon
    core: bf(0.58, 0.73), // furnace between the hulls
    dl: bf(0.31, 0.58),   // left dome turret
    dr: bf(0.845, 0.57)   // right dome turret
};

function drawBoss() {
    const b = boss;
    if (!b) return;

    const phase = BOSS_LEVELS + 1 - b.level;
    const pulse = 0.5 + 0.5 * Math.sin(time * (3 + phase * 1.6));
    const rage = phase >= 4 || b.mode === "windup" || b.mode === "lunge";
    const rgb = rage ? "255,24,44" : "210,20,60";

    ctx.save();
    ctx.translate(b.x, b.y);

    ctx.globalCompositeOperation = "lighter";
    glowCircle(0, 6, 150, rgb, 0.12 + pulse * 0.08 + phase * 0.015);
    ctx.globalCompositeOperation = "source-over";

    const breathe = 1 + Math.sin(time * (2 + phase * 0.7)) * 0.012
        + (b.mode === "windup" ? 0.04 : 0) + (b.mode === "lunge" ? 0.08 : 0)
        + (b.roar > 0 ? 0.05 * Math.sin(time * 40) : 0);
    const jit = (phase >= 4 || b.mode === "windup" || b.roar > 0) ? 1.6 : (b.enter > 0 ? 1 : 0);
    ctx.translate(random(-jit, jit), random(-jit, jit));
    ctx.rotate(b.tilt);
    ctx.scale(breathe, breathe);
    if (b.dead) ctx.globalAlpha = Math.max(0.15, b.deathT / 2.2);

    if (bossSprites.ready) {
        const w = BOSS_W, h = BOSS_W * BOSS_AR;

        // engine flames behind the stern (top of the screen)
        ctx.globalCompositeOperation = "lighter";
        for (const tx of [-42, -14, 14, 42]) {
            const len = 20 + Math.random() * 14 + Math.abs(b.vx || 0) * 0.02;
            const tg = ctx.createLinearGradient(0, -h * 0.3, 0, -h * 0.3 - len);
            tg.addColorStop(0, rage ? "rgba(255,120,60,0.85)" : "rgba(255,40,60,0.75)");
            tg.addColorStop(1, "rgba(120,0,30,0)");
            ctx.fillStyle = tg;
            ctx.beginPath(); ctx.moveTo(tx - 6, -h * 0.3); ctx.lineTo(tx, -h * 0.3 - len); ctx.lineTo(tx + 6, -h * 0.3); ctx.closePath(); ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";

        // hull
        ctx.shadowColor = `rgba(${rgb},0.9)`; ctx.shadowBlur = 12 + pulse * 8;
        const src = b.flash > 0 ? bossSprites.flash : rage ? bossSprites.rage : bossSprites.base;
        ctx.drawImage(src, -w / 2, -h / 2, w, h);
        ctx.shadowBlur = 0;

        // furnace core pulse + muzzle glow on every weapon mount
        ctx.globalCompositeOperation = "lighter";
        glowCircle(w * 0.07, h * 0.14, 28 + pulse * 9, rgb, 0.3 + pulse * 0.3 + phase * 0.04);
        for (const k of ["cl", "cr", "core", "dl", "dr"]) {
            const heat = Math.max(0, (b.fireFlash && b.fireFlash[k]) || 0);
            if (heat > 0) glowCircle(BOSS_MUZ[k][0], BOSS_MUZ[k][1], 12 + heat * 22, "255,170,90", Math.min(1, heat * 1.4));
        }
        ctx.globalCompositeOperation = "source-over";
    }

    ctx.restore();
}

function drawBullet(bullet, friendly) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    if (friendly) {
        const length = 30;
        const trail = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x - bullet.vx * 0.06, bullet.y + length);
        trail.addColorStop(0, "rgba(140,250,255,0.95)");
        trail.addColorStop(1, "rgba(60,120,255,0)");

        ctx.strokeStyle = trail;
        ctx.lineWidth = bullet.radius * 1.7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(bullet.x - bullet.vx * 0.06, bullet.y + length);
        ctx.stroke();

        glowCircle(bullet.x, bullet.y, bullet.radius * 3.6, "110,240,255", 0.5);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
    } else if (bullet.bolt) {
        const sp = Math.hypot(bullet.vx, bullet.vy) || 1, ux = bullet.vx / sp, uy = bullet.vy / sp;
        const tx = bullet.x - ux * 26, ty = bullet.y - uy * 26;
        const tr = ctx.createLinearGradient(tx, ty, bullet.x, bullet.y);
        tr.addColorStop(0, "rgba(255,90,40,0)"); tr.addColorStop(1, "rgba(255,150,90,0.95)");
        ctx.strokeStyle = tr; ctx.lineWidth = bullet.radius * 1.8; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bullet.x, bullet.y); ctx.stroke();
        glowCircle(bullet.x, bullet.y, bullet.radius * 3.4, "255,100,50", 0.6);
        ctx.fillStyle = "#fff4e0";
        ctx.beginPath(); ctx.arc(bullet.x, bullet.y, bullet.radius * 0.6, 0, Math.PI * 2); ctx.fill();
    } else {
        const rgb = hexToRgb(bullet.color);
        glowCircle(bullet.x, bullet.y, bullet.radius * 3.2, rgb, 0.6);
        ctx.strokeStyle = `rgba(${rgb},0.9)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius * 0.95, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function drawItem(item) {
    const styles = {
        double: { rgb: "255,210,122", label: "x2" },
        heal: { rgb: "255,120,155", label: "+" },
        shield: { rgb: "112,186,255", label: "S" }
    };

    const style = styles[item.type];

    ctx.save();
    ctx.translate(item.x, item.y);

    ctx.globalCompositeOperation = "lighter";
    glowCircle(0, 0, item.radius * 2.6, style.rgb, 0.4);
    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "rgba(6,12,30,0.92)";
    ctx.beginPath();
    ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(${style.rgb},0.95)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([9, 5]);
    ctx.lineDashOffset = -time * 30;
    ctx.beginPath();
    ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgb(${style.rgb})`;
    ctx.font = "bold 14px Orbitron, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(style.label, 0, 1);

    ctx.restore();
}

function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const p of particles) {
        const life = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = life;
        ctx.fillStyle = p.color;
        const size = p.size * (0.5 + life * 0.8);
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    }

    ctx.restore();
}

function drawRings() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const ring of rings) {
        const life = 1 - ring.r / ring.max;
        ctx.strokeStyle = `rgba(${ring.color},${life * 0.9})`;
        ctx.lineWidth = 1 + life * 4;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
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
    drawRings();

    ctx.restore();

    // Damage flash (red screen edge)
    if (hurtFlash > 0) {
        const g = ctx.createRadialGradient(
            WIDTH / 2, HEIGHT / 2, HEIGHT * 0.3,
            WIDTH / 2, HEIGHT / 2, HEIGHT * 0.85
        );
        g.addColorStop(0, "rgba(255,40,80,0)");
        g.addColorStop(1, `rgba(255,40,80,${hurtFlash})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
}
