"use strict";

// ---------- Drawing (premium dark look) ----------

// Pre-rendered deep-space nebula, tiled vertically for a seamless scroll.
const nebula = (() => {
    const c = document.createElement("canvas");
    c.width = WIDTH;
    c.height = HEIGHT * 2;
    const g = c.getContext("2d");

    g.fillStyle = "#02030a";
    g.fillRect(0, 0, c.width, c.height);

    const blobs = [
        [150, 200, 280, "92,44,210", 0.34],
        [650, 520, 320, "24,120,230", 0.26],
        [420, 900, 340, "180,34,160", 0.24],
        [90, 1060, 260, "30,150,210", 0.22],
        [700, 1150, 300, "104,54,230", 0.26],
        [330, 560, 220, "60,24,150", 0.22]
    ];

    for (const [x, y, r, color, alpha] of blobs) {
        for (const offset of [-c.height, 0, c.height]) {
            const gradient = g.createRadialGradient(x, y + offset, 0, x, y + offset, r);
            gradient.addColorStop(0, `rgba(${color},${alpha})`);
            gradient.addColorStop(1, `rgba(${color},0)`);
            g.fillStyle = gradient;
            g.fillRect(0, 0, c.width, c.height);
        }
    }

    return c;
})();

function drawBackground() {
    ctx.fillStyle = "#02030a";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const offset = bgScroll % (HEIGHT * 2);
    ctx.drawImage(nebula, 0, offset - HEIGHT * 2);
    ctx.drawImage(nebula, 0, offset);

    // Stage planet (3D, rotating)
    drawStagePlanet();

    // Stars (three depth layers, twinkling)
    for (const star of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(time * 2.2 + star.tw);
        ctx.globalAlpha = (0.3 + star.z * 0.7) * twinkle;
        ctx.fillStyle = star.color;
        ctx.fillRect(star.x, star.y, star.size, star.size * (1 + star.z * 2.6));
    }

    ctx.globalAlpha = 1;
}

function glowCircle(x, y, radius, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, `rgba(${color},${alpha})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer() {
    if (
        player.invincible > 0 &&
        player.shield <= 0 &&
        Math.floor(gameTime * 15) % 2 === 0
    ) {
        return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    // Engine glow + flame (additive)
    const flame = 24 + Math.random() * 9;
    ctx.globalCompositeOperation = "lighter";
    glowCircle(0, 16, 34, "80,170,255", 0.38);

    for (const fx of [-9, 9]) {
        const fg = ctx.createLinearGradient(0, 12, 0, 12 + flame * 0.75);
        fg.addColorStop(0, "rgba(160,240,255,0.95)");
        fg.addColorStop(0.5, "rgba(70,140,255,0.55)");
        fg.addColorStop(1, "rgba(70,70,255,0)");
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.moveTo(fx - 4, 12);
        ctx.lineTo(fx, 12 + flame * 0.75);
        ctx.lineTo(fx + 4, 12);
        ctx.closePath();
        ctx.fill();
    }

    const cg = ctx.createLinearGradient(0, 10, 0, 10 + flame);
    cg.addColorStop(0, "rgba(255,255,255,0.95)");
    cg.addColorStop(0.35, "rgba(110,225,255,0.75)");
    cg.addColorStop(1, "rgba(60,90,255,0)");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(-5, 10);
    ctx.lineTo(0, 10 + flame);
    ctx.lineTo(5, 10);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Wings
    const wing = ctx.createLinearGradient(-30, 0, 30, 0);
    wing.addColorStop(0, "#12204a");
    wing.addColorStop(0.5, "#5c8dff");
    wing.addColorStop(1, "#12204a");
    ctx.fillStyle = wing;
    ctx.strokeStyle = "rgba(127,233,255,0.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(8, -4);
    ctx.lineTo(26, 12);
    ctx.lineTo(31, 23);
    ctx.lineTo(11, 15);
    ctx.lineTo(0, 19);
    ctx.lineTo(-11, 15);
    ctx.lineTo(-31, 23);
    ctx.lineTo(-26, 12);
    ctx.lineTo(-8, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fuselage
    const body = ctx.createLinearGradient(0, -28, 0, 20);
    body.addColorStop(0, "#f2fbff");
    body.addColorStop(0.55, "#8cc4ff");
    body.addColorStop(1, "#3a63c8");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(6, -6);
    ctx.lineTo(5, 16);
    ctx.lineTo(0, 21);
    ctx.lineTo(-5, 16);
    ctx.lineTo(-6, -6);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#5fe8ff";
    const cockpit = ctx.createLinearGradient(0, -14, 0, 0);
    cockpit.addColorStop(0, "#c8fbff");
    cockpit.addColorStop(1, "#1a8dff");
    ctx.fillStyle = cockpit;
    ctx.beginPath();
    ctx.ellipse(0, -7, 2.8, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Wing-tip lights
    const blink = 0.5 + 0.5 * Math.sin(time * 6);
    ctx.fillStyle = `rgba(255,90,140,${0.5 + blink * 0.5})`;
    ctx.beginPath();
    ctx.arc(-28, 21, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(110,255,200,${0.5 + (1 - blink) * 0.5})`;
    ctx.beginPath();
    ctx.arc(28, 21, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Shield
    if (player.shield > 0 && (player.shield > 1.2 || Math.floor(gameTime * 10) % 2 === 0)) {
        ctx.globalCompositeOperation = "lighter";
        glowCircle(0, 0, 34, "90,200,255", 0.22);
        ctx.strokeStyle = "rgba(130,225,255,0.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 7]);
        ctx.lineDashOffset = -time * 40;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalCompositeOperation = "source-over";
    }

    ctx.restore();
}

function drawEnemy(enemy) {
    const rgb = enemy.strong ? "255,156,85" : "255,88,126";
    const hex = enemy.strong ? "#ff9c55" : "#ff587e";
    const pulse = 0.5 + 0.5 * Math.sin(time * 6 + enemy.phase);

    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    ctx.globalCompositeOperation = "lighter";
    glowCircle(0, 2, enemy.width * 0.95, rgb, 0.2 + pulse * 0.08);
    ctx.globalCompositeOperation = "source-over";

    const body = ctx.createLinearGradient(0, -16, 0, 20);
    body.addColorStop(0, enemy.strong ? "#6a3418" : "#6e1630");
    body.addColorStop(1, "#150814");
    ctx.fillStyle = body;
    ctx.strokeStyle = hex;
    ctx.lineWidth = 1.6;
    ctx.shadowBlur = 12;
    ctx.shadowColor = hex;

    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(-enemy.width / 2, -8);
    ctx.lineTo(-7, -3);
    ctx.lineTo(0, -15);
    ctx.lineTo(7, -3);
    ctx.lineTo(enemy.width / 2, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (enemy.strong) {
        ctx.strokeStyle = "rgba(255,200,150,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-enemy.width / 2 + 5, -4);
        ctx.lineTo(0, 12);
        ctx.lineTo(enemy.width / 2 - 5, -4);
        ctx.stroke();
    }

    // Glowing core
    ctx.globalCompositeOperation = "lighter";
    glowCircle(0, 1, 9, rgb, 0.7 + pulse * 0.3);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, 1, 2.2, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.strong) {
        // gold ring = "defeat me for a bonus"
        ctx.strokeStyle = `rgba(255,210,122,${0.45 + pulse * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([7, 5]);
        ctx.lineDashOffset = -time * 20;
        ctx.beginPath();
        ctx.arc(0, 1, enemy.width * 0.62, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    if (enemy.strong) {
        ctx.fillStyle = "rgba(20,8,24,0.85)";
        ctx.fillRect(-20, -32, 40, 4);
        ctx.fillStyle = hex;
        ctx.shadowBlur = 6;
        ctx.shadowColor = hex;
        ctx.fillRect(-20, -32, 40 * enemy.hp / enemy.maxHp, 4);
        ctx.shadowBlur = 0;
    }

    ctx.restore();
}
