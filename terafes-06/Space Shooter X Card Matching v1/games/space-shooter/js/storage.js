"use strict";

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
