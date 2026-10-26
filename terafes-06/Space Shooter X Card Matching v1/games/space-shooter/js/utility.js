"use strict";

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

function createRing(x, y, color, max = 70, speed = 260) {
    rings.push({ x, y, r: 6, max, speed, color });
}

function addScore(points) {
    score += points;
    saveBestScore();
}
