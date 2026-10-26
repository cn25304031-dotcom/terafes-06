"use strict";

// ---------- Stage select ----------
let cleared = loadCleared();
function loadCleared() { try { return JSON.parse(localStorage.getItem("spaceShooterCleared") || "[]"); } catch { return []; } }
function saveCleared() { try { localStorage.setItem("spaceShooterCleared", JSON.stringify(cleared)); } catch { /* ignore */ } }

function buildStageSelect() {
    ssGrid.innerHTML = PLANETS.map((p, i) => {
        const done = cleared.includes(i);
        return `<div class="ss-card${done ? " cleared" : ""}" data-i="${i}" tabindex="0" role="button" aria-label="Stage ${i + 1} ${p.name}">
            <canvas width="168" height="168"></canvas><strong>${p.name}</strong>
            <em>${done ? "✔ CLEARED" : "&nbsp;"}</em></div>`;
    }).join("");
    ssCards = [...ssGrid.children].map((el, i) => ({
        el, g: el.querySelector("canvas").getContext("2d"), sprite: new PlanetSprite(PLANETS[i], PLANETS[i].cardR)
    }));
    ssCards.forEach((c, i) => {
        const go = () => { stageIdx = i; startGame(); };
        c.el.addEventListener("click", go);
        c.el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); go(); } });
    });
}
function openStageSelect() {
    state = "ready";
    overlay.classList.add("hidden");
    bossHud.classList.remove("show");
    stageTag.textContent = "";
    buildStageSelect();
    stageSelect.classList.remove("hidden");
}
function drawStageSelect() {
    for (let i = 0; i < ssCards.length; i++) {
        const c = ssCards[i], p = PLANETS[i];
        c.g.clearRect(0, 0, 168, 168);
        if (p.rings) drawPlanetRings(c.g, 84, 84, p.cardR, false);
        c.sprite.update(time * p.spin * 2 + i * 0.13);
        c.g.drawImage(c.sprite.c, 84 - p.cardR, 84 - p.cardR);
        if (p.rings) drawPlanetRings(c.g, 84, 84, p.cardR, true);
    }
}
function drawStagePlanet() {
    if (!bgPlanet) return;
    const p = PLANETS[stageIdx], R = p.bgR;
    bgPlanet.update(time * p.spin);
    glowCircle(p.bgX, p.bgY, R * 1.55, p.atmo.join(","), 0.26);
    if (p.rings) drawPlanetRings(ctx, p.bgX, p.bgY, R, false);
    ctx.drawImage(bgPlanet.c, p.bgX - R, p.bgY - R);
    if (p.rings) drawPlanetRings(ctx, p.bgX, p.bgY, R, true);
}
