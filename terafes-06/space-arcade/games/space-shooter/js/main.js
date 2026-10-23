"use strict";

// ---------- Main loop ----------

function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000 || 0, 0.033);
    lastTime = timestamp;
    time += dt;
    bgScroll += dt * (state === "playing" ? 34 : 12);

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
    if (!stageSelect.classList.contains("hidden")) drawStageSelect();
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
    double: 0,
    shootTimer: 0,
    invincible: 0,
    shield: 0
};

bestScoreElement.textContent = bestScore;
updateUI();

overlay.classList.add("hidden");
openStageSelect();

lastTime = performance.now();
animationId = requestAnimationFrame(loop);
