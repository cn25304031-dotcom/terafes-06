"use strict";

// ---------- UI and overlay ----------

function updateUI() {
    scoreElement.textContent = score;
    if (hpElement.dataset.v !== String(player.hp)) {
        hpElement.dataset.v = String(player.hp);
        hpElement.innerHTML = [0, 1, 2].map((i) =>
            '<span class="sh' + (i < player.hp ? '' : ' off') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L4 5.2v6.2c0 5 3.3 8.9 8 10.6 4.7-1.7 8-5.6 8-10.6V5.2z"/><path d="M12 6.2v12.2c-2.8-1.4-4.6-4-4.6-7V7.6z" fill="rgba(4,10,30,.35)" stroke="none"/></svg></span>').join("");
    }

    powerElement.textContent = player.double > 0 ? `x2 ${Math.ceil(player.double)}s` : "x1";

    bossHud.classList.toggle("show", !!boss);

    if (boss) {
        const pct = boss.dead ? 0 : Math.max(1, Math.ceil(boss.hp / boss.maxHp * 100));
        bossHpElement.textContent = pct;
        bossBarFill.style.width = `${Math.max(0, boss.hp / boss.maxHp * 100)}%`;
        bossPips.forEach((pip, i) => pip.classList.toggle("on", i < boss.level));
    } else {
        bossHpElement.textContent = "---";
        bossBarFill.style.width = "0%";
    }

    bestScoreElement.textContent = bestScore;
}

function showOverlay(title, message, buttonText, withMenu = false) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    startButton.textContent = buttonText;
    menuButton.hidden = !withMenu;
    overlay.classList.remove("hidden");
}

function gameOver() {
    if (state !== "playing") return;

    state = "over";
    saveBestScore();

    showOverlay(
        "GAME OVER",
        `${PLANETS[stageIdx].name}\nSCORE: ${score}\nBEST SCORE: ${bestScore}`,
        "RETRY",
        true
    );
}

function stageClear() {
    if (state !== "playing") return;

    state = "clear";
    score += 1000;
    saveBestScore();
    if (!cleared.includes(stageIdx)) { cleared.push(stageIdx); saveCleared(); }
    updateUI();

    const p = PLANETS[stageIdx];
    const last = stageIdx === PLANETS.length - 1;
    if (last || PLANETS.every((_, i) => cleared.includes(i))) {
        showOverlay(
            "ALL CLEAR",
            `All 8 planets defended!\nSCORE: ${score}  (Bonus +1000)`,
            "STAGE SELECT"
        );
    } else {
        showOverlay(
            "STAGE CLEAR",
            `${p.name} · BOSS DESTROYED\nSCORE: ${score}  (Bonus +1000)`,
            `NEXT STAGE · ${PLANETS[stageIdx + 1].name}`,
            true
        );
    }
}
