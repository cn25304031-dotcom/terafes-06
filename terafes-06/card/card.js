
"use strict";

// ==============================
// ゲーム設定
// ==============================
const DIFFICULTIES = {
    easy: {
        name: "EASY",
        pairs: 2,
        bombs: 0,
        time: 45,
        hints: 2,
        gridClass: "grid-2x2"
    },
    normal: {
        name: "NORMAL",
        pairs: 5,
        bombs: 2,
        time: 60,
        hints: 2,
        gridClass: "grid-3x4"
    },
    hard: {
        name: "HARD",
        pairs: 7,
        bombs: 2,
        time: 75,
        hints: 1,
        gridClass: "grid-4x4"
    }
};

const SPACE_EMOJIS = [
    "🚀", "🪐", "🌙", "⭐", "☄️",
    "👾", "🛸", "🌎", "🌟", "🛰️"
];

const RANKING_KEY = "spaceMatchScores";

let difficulty = "normal";
let level = 1;
let score = 0;
let combo = 0;
let maxCombo = 0;
let moves = 0;
let timeLeft = 60;
let matchedPairs = 0;
let totalPairs = 5;
let hintsLeft = 2;

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let gameStarted = false;
let gameEnded = false;
let scoreSaved = false;

let timerInterval = null;
let hintTimeout = null;
let comboTimeout = null;
let audioContext = null;
let bgmInterval = null;
let soundEnabled = true;

// ==============================
// 初期化
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    createStars();
    setDifficulty("normal");
    renderRanking();

    const rankingForm = document.getElementById("ranking-form");

    rankingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        saveRanking();
    });
});

// ==============================
// 星の背景
// ==============================
function createStars() {
    const container = document.getElementById("stars-bg");

    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < 65; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.animationDuration = `${2 + Math.random() * 4}s`;
        container.appendChild(star);
    }
}

// ==============================
// 難易度選択
// ==============================
function setDifficulty(value) {
    if (!DIFFICULTIES[value]) return;

    difficulty = value;
    level = 1;

    document.querySelectorAll(".difficulty button").forEach(button => {
        button.classList.remove("selected");
    });

    document.getElementById(`btn-${value}`).classList.add("selected");

    startGame();
}

// ==============================
// ゲーム開始・リセット
// ==============================
function resetGame() {
    level = 1;
    startGame();
}

function startGame() {
    clearInterval(timerInterval);
    clearTimeout(hintTimeout);
    clearTimeout(comboTimeout);

    const config = DIFFICULTIES[difficulty];

    score = 0;
    combo = 0;
    maxCombo = 0;
    moves = 0;
    matchedPairs = 0;
    totalPairs = config.pairs;
    timeLeft = config.time + (level - 1) * 5;
    hintsLeft = config.hints;

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    gameStarted = false;
    gameEnded = false;
    scoreSaved = false;

    document.getElementById("clear-modal").classList.remove("show");
    document.getElementById("gameover-modal").classList.remove("show");
    document.getElementById("bomb-alert").classList.remove("show");
    document.getElementById("levelup-overlay").classList.remove("show");
    document.getElementById("combo-banner").className = "combo-banner";
    document.getElementById("combo-card").className = "stat-card combo-card";
    document.getElementById("timer-card").className = "stat-card timer-card";

    document.getElementById("mission-title").textContent =
        `銀河ミッション LEVEL ${level}`;

    document.getElementById("mission-description").textContent =
        "すべてのカードペアを見つけよう！";

    document.getElementById("level-display").textContent = level;
    document.getElementById("hint-count").textContent = hintsLeft;
    document.getElementById("hint-btn").disabled = false;
    document.getElementById("ranking-message").textContent = "";
    document.getElementById("player-name").value = "";
    document.getElementById("save-score-btn").disabled = false;
    document.getElementById("save-score-btn").textContent = "🏆 スコアを保存";
    document.getElementById("next-level-btn").style.display = "block";
    document.getElementById("next-level-btn").disabled = false;
    document.getElementById("hint-text").textContent =
        "カードを2枚選んでペアを見つけよう！";

    updateStats();
    updateProgress();
    createCards();
}

// ==============================
// カードを作成
// ==============================
function createCards() {
    const board = document.getElementById("game-board");
    const config = DIFFICULTIES[difficulty];

    board.innerHTML = "";
    board.className = `game-board ${config.gridClass}`;

    const selectedEmojis = SPACE_EMOJIS.slice(0, config.pairs);

    let cards = [];

    selectedEmojis.forEach((emoji, index) => {
        cards.push({
            type: "pair",
            pairId: index,
            emoji: emoji
        });

        cards.push({
            type: "pair",
            pairId: index,
            emoji: emoji
        });
    });

    for (let i = 0; i < config.bombs; i++) {
        cards.push({
            type: "bomb",
            pairId: null,
            emoji: "💣"
        });
    }

    shuffle(cards);

    cards.forEach((card, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "card-container";
        button.dataset.index = index;
        button.dataset.type = card.type;
        button.dataset.pairId =
            card.pairId === null ? "" : String(card.pairId);
        button.dataset.emoji = card.emoji;
        button.setAttribute("aria-label", "裏向きのカード");
        button.style.animationDelay = `${index * 0.035}s`;

        button.innerHTML = `
            <span class="card-inner">
                <span class="card-back"></span>
                <span class="card-front">${card.emoji}</span>
            </span>
        `;

        button.addEventListener("click", () => flipCard(button));
        board.appendChild(button);
    });

    updateStats();
}

// 配列をランダムに並び替える
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

// ==============================
// カードをめくる
// ==============================
function flipCard(card) {
    if (gameEnded || lockBoard) return;
    if (card.classList.contains("flipped")) return;
    if (card.classList.contains("matched")) return;

    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }

    card.classList.add("flipped");
    card.setAttribute("aria-label", `カード ${card.dataset.emoji}`);
    playTone(520, 0.07, "sine");

    // 爆弾カード
    if (card.dataset.type === "bomb") {
        handleBomb(card);
        return;
    }

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    moves++;

    updateStats();
    checkMatch();
}

// ==============================
// ペア判定
// ==============================
function checkMatch() {
    if (
        firstCard.dataset.pairId === secondCard.dataset.pairId
    ) {
        handleMatch();
    } else {
        handleMismatch();
    }
}

function handleMatch() {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    firstCard.disabled = true;
    secondCard.disabled = true;

    matchedPairs++;
    combo++;
    maxCombo = Math.max(maxCombo, combo);

    // コンボ倍率
    let multiplier = 1;

    if (combo >= 5) {
        multiplier = 3;
    } else if (combo >= 3) {
        multiplier = 2;
    }

    const gainedScore = 100 * multiplier;
    score += gainedScore;

    playTone(combo >= 3 ? 880 : 660, 0.18, "sine");

    firstCard = null;
    secondCard = null;

    updateStats();
    updateProgress();
    showCombo();

    if (matchedPairs >= totalPairs) {
        finishGame();
    }
}

function handleMismatch() {
    lockBoard = true;
    combo = 0;

    playTone(220, 0.12, "triangle");
    updateStats();
    hideCombo();

    const card1 = firstCard;
    const card2 = secondCard;

    setTimeout(() => {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");

        card1.setAttribute("aria-label", "裏向きのカード");
        card2.setAttribute("aria-label", "裏向きのカード");

        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }, 750);
}

// ==============================
// 爆弾カード
// ==============================
function handleBomb(card) {
    lockBoard = true;

    score = Math.max(0, score - 50);
    timeLeft = Math.max(0, timeLeft - 5);
    combo = 0;

    document.body.classList.remove("shake");
    // アニメーションを再実行
    void document.body.offsetWidth;
    document.body.classList.add("shake");

    card.classList.add("bomb");

    const alertBox = document.getElementById("bomb-alert");
    alertBox.classList.remove("show");
    void alertBox.offsetWidth;
    alertBox.classList.add("show");

    playTone(110, 0.35, "sawtooth");
    updateStats();
    hideCombo();

    setTimeout(() => {
        card.classList.remove("flipped", "bomb");
        card.setAttribute("aria-label", "裏向きのカード");

        firstCard = null;
        secondCard = null;
        lockBoard = false;

        if (timeLeft <= 0 && !gameEnded) {
            endGame();
        }
    }, 800);
}

// ==============================
// タイマー
// ==============================
function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (gameEnded) {
            clearInterval(timerInterval);
            return;
        }

        timeLeft--;
        updateStats();

        if (timeLeft <= 10) {
            document.getElementById("timer-card").classList.add("warning");
        }

        if (timeLeft <= 0) {
            timeLeft = 0;
            updateStats();
            endGame();
        }
    }, 1000);
}

// ==============================
// ゲームクリア
// ==============================
function finishGame() {
    if (gameEnded) return;

    gameEnded = true;
    clearInterval(timerInterval);

    const baseScore = score;
    const timeBonus = timeLeft * 10;

    score += timeBonus;

    document.getElementById("modal-base-score").textContent = baseScore;
    document.getElementById("modal-time-bonus").textContent = timeBonus;
    document.getElementById("modal-max-combo").textContent = `×${maxCombo}`;
    document.getElementById("modal-moves").textContent = moves;
    document.getElementById("modal-final-score").textContent = score;

    document.getElementById("mission-title").textContent = "ミッション成功！";
    document.getElementById("mission-description").textContent =
        "次のレベルに挑戦しよう！";

    updateStats();
    playTone(1046, 0.4, "sine");

    document.getElementById("clear-modal").classList.add("show");
}

// ==============================
// ゲームオーバー
// ==============================
function endGame() {
    if (gameEnded) return;

    gameEnded = true;
    clearInterval(timerInterval);

    document.getElementById("gameover-score").textContent = score;
    document.getElementById("gameover-modal").classList.add("show");

    playTone(150, 0.4, "triangle");
}

// ==============================
// 次のレベル
// ==============================
function nextLevel() {
    if (!gameEnded || matchedPairs < totalPairs) return;

    level++;

    const overlay = document.getElementById("levelup-overlay");
    overlay.classList.remove("show");
    void overlay.offsetWidth;
    overlay.classList.add("show");

    playTone(740, 0.2, "sine");

    setTimeout(() => {
        overlay.classList.remove("show");
        startGame();
    }, 900);
}

// ==============================
// ヒント
// ==============================
function useHint() {
    if (gameEnded || lockBoard || hintsLeft <= 0) return;

    const unmatched = Array.from(
        document.querySelectorAll(
            ".card-container:not(.matched):not(.flipped)"
        )
    );

    // ペアが残っていない場合
    if (unmatched.length < 2) return;

    const groups = {};

    unmatched.forEach(card => {
        if (card.dataset.type !== "pair") return;

        const id = card.dataset.pairId;

        if (!groups[id]) groups[id] = [];
        groups[id].push(card);
    });

    const availablePair = Object.values(groups).find(
        group => group.length >= 2
    );

    if (!availablePair) return;

    hintsLeft--;
    document.getElementById("hint-count").textContent = hintsLeft;

    const hintCards = availablePair.slice(0, 2);

    hintCards.forEach(card => {
        card.classList.add("hinted");
        card.classList.add("flipped");
    });

    document.getElementById("hint-text").textContent =
        "💡 ヒント！同じ絵柄のカードを探そう。";

    document.getElementById("hint-btn").disabled = true;

    clearTimeout(hintTimeout);

    hintTimeout = setTimeout(() => {
        hintCards.forEach(card => {
            if (!card.classList.contains("matched")) {
                card.classList.remove("flipped");
                card.setAttribute("aria-label", "裏向きのカード");
            }

            card.classList.remove("hinted");
        });

        document.getElementById("hint-btn").disabled =
            hintsLeft <= 0;

        document.getElementById("hint-text").textContent =
            hintsLeft > 0
                ? "カードを2枚選んでペアを見つけよう！"
                : "ヒントを使い切りました。自力で挑戦！";
    }, 1000);

    playTone(800, 0.12, "sine");
}

// ==============================
// コンボ表示
// ==============================
function showCombo() {
    const card = document.getElementById("combo-card");
    const banner = document.getElementById("combo-banner");
    const bannerText = document.getElementById("combo-banner-text");
    const caption = document.getElementById("combo-caption");

    card.classList.remove("combo-3", "combo-fever");
    banner.className = "combo-banner";

    if (combo >= 5) {
        card.classList.add("combo-fever");
        banner.classList.add("show", "combo-fever");
        bannerText.textContent = `🔥 COMBO ×${combo} FEVER!`;
        caption.textContent = "3倍スコア！";
    } else if (combo >= 3) {
        card.classList.add("combo-3");
        banner.classList.add("show", "combo-3");
        bannerText.textContent = `✨ COMBO ×${combo}!`;
        caption.textContent = "2倍スコア！";
    } else {
        caption.textContent = "連続成功を目指そう！";
        return;
    }

    clearTimeout(comboTimeout);

    comboTimeout = setTimeout(() => {
        banner.classList.remove("show");
    }, 1200);
}

function hideCombo() {
    document.getElementById("combo-banner").className = "combo-banner";
    document.getElementById("combo-card").classList.remove(
        "combo-3",
        "combo-fever"
    );
    document.getElementById("combo-caption").textContent =
        "連続成功を目指そう！";
}

function updateStats() {
    document.getElementById("score-display").textContent = score;
    document.getElementById("combo-display").textContent = `×${combo}`;
    document.getElementById("timer-display").textContent =
        String(timeLeft).padStart(3, "0");
    document.getElementById("moves-display").textContent = moves;
    document.getElementById("pairs-display").textContent =
        `PAIRS: ${matchedPairs} / ${totalPairs}`;
}

function updateProgress() {
    const percent = totalPairs === 0
        ? 0
        : (matchedPairs / totalPairs) * 100;

    document.getElementById("mission-progress").style.width =
        `${percent}%`;

    document.getElementById("mission-progress-text").textContent =
        `${matchedPairs} / ${totalPairs} ペア`;
}

// ==============================
// ローカルランキング
// ==============================
function getRanking() {
    try {
        const data = JSON.parse(localStorage.getItem(RANKING_KEY) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

function saveRanking() {
    if (!gameEnded || matchedPairs < totalPairs || scoreSaved) {
        return;
    }

    const nameInput = document.getElementById("player-name");
    const name = nameInput.value.trim().slice(0, 12);

    if (!name) {
        document.getElementById("ranking-message").textContent =
            "名前を入力してください。";
        nameInput.focus();
        return;
    }

    const ranking = getRanking();

    ranking.push({
        name: name,
        score: score,
        level: level,
        difficulty: difficulty,
        date: new Date().toLocaleDateString("ja-JP")
    });

    ranking.sort((a, b) => b.score - a.score);

    try {
        localStorage.setItem(
            RANKING_KEY,
            JSON.stringify(ranking.slice(0, 10))
        );
    } catch (error) {
        document.getElementById("ranking-message").textContent =
            "保存できませんでした。ブラウザの保存設定を確認してください。";
        return;
    }

    scoreSaved = true;

    document.getElementById("ranking-message").textContent =
        "🏆 ランキングに登録しました！";

    document.getElementById("save-score-btn").disabled = true;
    document.getElementById("save-score-btn").textContent = "保存済み";

    renderRanking();
}

function renderRanking() {
    const list = document.getElementById("high-scores-list");
    if (!list) return;

    list.innerHTML = "";

    const ranking = getRanking();

    if (ranking.length === 0) {
        const item = document.createElement("li");
        item.textContent = "まだ記録がありません。最初の挑戦者になろう！";
        list.appendChild(item);
        return;
    }

    ranking.slice(0, 10).forEach((entry, index) => {
        const item = document.createElement("li");

        const name = document.createElement("strong");
        name.textContent = `${index + 1}位　${entry.name}`;

        const details = document.createElement("span");
        details.textContent =
            ` LEVEL ${entry.level} / ${String(entry.difficulty).toUpperCase()}`;

        const points = document.createElement("span");
        points.className = "rank-score";
        points.textContent = `${entry.score} pt`;

        item.append(name, details, points);
        list.appendChild(item);
    });
}

// ==============================
// 効果音・BGM（Web Audio）
// 音声ファイル・外部APIは不要
// ==============================
function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return null;

        audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}

function playTone(frequency, duration, type = "sine") {
    if (!soundEnabled) return;

    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
        frequency,
        context.currentTime
    );

    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + duration);
}

function toggleSound() {
    soundEnabled = !soundEnabled;

    const button = document.getElementById("sound-btn");

    button.textContent = soundEnabled ? "🔊 SOUND ON" : "🔇 SOUND OFF";

    if (soundEnabled) {
        getAudioContext();
        playTone(660, 0.12, "sine");
    }
}
