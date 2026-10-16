"use strict";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'flip') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'match') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'combo') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'bomb') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'over') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    }
}

const ICON_POOL = [
    { icon: 'fa-rocket', color: 'text-pink-400' },
    { icon: 'fa-user-astronaut', color: 'text-cyan-300' },
    { icon: 'fa-shuttle-space', color: 'text-purple-400' },
    { icon: 'fa-meteor', color: 'text-amber-400' },
    { icon: 'fa-sun', color: 'text-yellow-300' },
    { icon: 'fa-moon', color: 'text-blue-300' },
    { icon: 'fa-star', color: 'text-amber-200' },
    { icon: 'fa-satellite', color: 'text-emerald-400' },
    { icon: 'fa-satellite-dish', color: 'text-teal-300' },
    { icon: 'fa-earth-asia', color: 'text-blue-400' },
    { icon: 'fa-atom', color: 'text-indigo-400' },
    { icon: 'fa-shield-halved', color: 'text-cyan-400' },
    { icon: 'fa-bolt', color: 'text-amber-300' },
    { icon: 'fa-compass', color: 'text-rose-400' },
    { icon: 'fa-gem', color: 'text-fuchsia-400' },
    { icon: 'fa-eye', color: 'text-violet-400' },
    { icon: 'fa-radiation', color: 'text-lime-400' },
    { icon: 'fa-crosshairs', color: 'text-red-400' }
];

const DIFFICULTY_SETTINGS = {
    easy: { grid: 2, pairs: 2, time: 30, hints: 1, fontScale: 'text-4xl md:text-6xl', hasBomb: false, next: 'normal' },
    normal: { grid: 4, pairs: 8, time: 60, hints: 3, fontScale: 'text-2xl md:text-4xl', hasBomb: false, next: 'hard' },
    hard: { grid: 6, pairs: 17, time: 120, hints: 5, fontScale: 'text-lg md:text-2xl', hasBomb: true, next: null }
};

let currentDifficulty = 'easy';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let moves = 0;
let combo = 0;
let maxCombo = 0;
let remainingHints = 1;
let timer = 0;
let timerInterval = null;
let isBoardLocked = false;
let isGameStarted = false;

function createStars() {
    const container = document.getElementById('stars-bg');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 70; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2.5 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 3 + 1.5}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(star);
    }
}

function setDifficulty(diff) {
    currentDifficulty = diff;
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.remove('bg-cyan-500', 'text-black', 'shadow-lg', 'shadow-cyan-500/30');
        btn.classList.add('text-slate-300');
    });
    const activeBtn = document.getElementById(`btn-${diff}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-cyan-500', 'text-black', 'shadow-lg', 'shadow-cyan-500/30');
        activeBtn.classList.remove('text-slate-300');
    }
    resetGame();
}

function nextLevel() {
    const nextDiff = DIFFICULTY_SETTINGS[currentDifficulty].next;
    setDifficulty(nextDiff ? nextDiff : 'easy');
}

function resetGame() {
    clearInterval(timerInterval);
    timerInterval = null;

    const setting = DIFFICULTY_SETTINGS[currentDifficulty];
    score = 0;
    moves = 0;
    combo = 0;
    maxCombo = 0;
    matchedPairs = 0;
    remainingHints = setting.hints;
    timer = setting.time;
    flippedCards = [];
    isBoardLocked = false;
    isGameStarted = false;

    updateHintButton();
    updateHUD();
    document.getElementById('clear-modal').classList.add('hidden');
    document.getElementById('gameover-modal').classList.add('hidden');

    generateBoard(setting);
    renderHighScores();
}

function updateHintButton() {
    const hintBtn = document.getElementById('hint-btn');
    document.getElementById('hint-text').textContent = `HINT (${remainingHints})`;

    if (remainingHints <= 0) {
        hintBtn.disabled = true;
        hintBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        hintBtn.disabled = false;
        hintBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function updateHUD() {
    document.getElementById('score-display').textContent = score;
    document.getElementById('timer-display').textContent = String(timer).padStart(3, '0');
    document.getElementById('moves-display').textContent = moves;
    document.getElementById('combo-display').textContent = `x${combo}`;
}

function generateBoard(setting) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    board.className = `grid gap-1.5 md:gap-2.5 w-full max-w-2xl aspect-square p-2.5 neon-panel rounded-2xl grid-${setting.grid}x${setting.grid}`;

    let selectedIcons = ICON_POOL.slice(0, setting.pairs);
    let deck = [...selectedIcons, ...selectedIcons];

    if (setting.hasBomb) {
        deck.push({ icon: 'fa-bomb', color: 'text-red-500', isBomb: true });
        deck.push({ icon: 'fa-bomb', color: 'text-red-500', isBomb: true });
    }

    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    cards = deck.map((item, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `card-container w-full h-full ${item.isBomb ? 'bomb' : ''}`;
        cardEl.dataset.id = index;
        cardEl.dataset.icon = item.icon;
        if (item.isBomb) cardEl.dataset.isBomb = "true";

        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-back">
                    <i class="fa-solid fa-atom text-cyan-500/50 ${setting.fontScale}"></i>
                </div>
                <div class="card-front">
                    <i class="fa-solid ${item.icon} ${item.color} ${setting.fontScale}"></i>
                </div>
            </div>
        `;

        cardEl.addEventListener('click', () => handleCardClick(cardEl));
        board.appendChild(cardEl);
        return cardEl;
    });
}

function useHint() {
    if (remainingHints <= 0 || isBoardLocked) return;
    remainingHints--;
    updateHintButton();

    cards.forEach(card => {
        if (!card.classList.contains('matched') && !card.classList.contains('flipped')) {
            card.classList.add('hinted');
        }
    });

    setTimeout(() => {
        cards.forEach(card => card.classList.remove('hinted'));
    }, 1200);
}

function startTimer() {
    if (isGameStarted) return;
    isGameStarted = true;

    timerInterval = setInterval(() => {
        timer--;
        document.getElementById('timer-display').textContent = String(timer).padStart(3, '0');
        if (timer <= 0) {
            clearInterval(timerInterval);
            playSound('over');
            handleGameOver();
        }
    }, 1000);
}

function handleCardClick(cardEl) {
    if (isBoardLocked) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    if (!isGameStarted) startTimer();

    playSound('flip');
    cardEl.classList.add('flipped');

    if (cardEl.dataset.isBomb === "true") {
        playSound('bomb');
        triggerShake();
        timer = Math.max(0, timer - 5);
        updateHUD();
        setTimeout(() => {
            cardEl.classList.remove('flipped');
        }, 800);
        return;
    }

    flippedCards.push(cardEl);

    if (flippedCards.length === 2) {
        moves++;
        updateHUD();
        checkPairMatch();
    }
}

function triggerShake() {
    const body = document.getElementById('body-root');
    body.classList.add('shake');
    setTimeout(() => body.classList.remove('shake'), 300);
}

function triggerComboBanner(multiplier) {
    const banner = document.getElementById('combo-banner');
    banner.textContent = `🔥 FEVER COMBO x${multiplier}! 🔥`;
    banner.classList.remove('opacity-0');
    setTimeout(() => banner.classList.add('opacity-0'), 1000);
}

function checkPairMatch() {
    isBoardLocked = true;
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.icon === card2.dataset.icon;

    if (isMatch) {
        combo++;
        if (combo > maxCombo) maxCombo = combo;

        if (combo > 1) {
            playSound('combo');
            triggerComboBanner(combo);
        } else {
            playSound('match');
        }

        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            flippedCards = [];
            isBoardLocked = false;

            score += 100 * combo;
            matchedPairs++;
            updateHUD();

            if (matchedPairs === DIFFICULTY_SETTINGS[currentDifficulty].pairs) {
                handleGameClear();
            }
        }, 300);
    } else {
        combo = 0;
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isBoardLocked = false;

            score = Math.max(0, score - 10);
            updateHUD();
        }, 800);
    }
}

function saveHighScore(finalScore) {
    let key = `matching_hs_${currentDifficulty}`;
    let scores = JSON.parse(localStorage.getItem(key) || "[]");
    scores.push(finalScore);
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 3);
    localStorage.setItem(key, JSON.stringify(scores));
    renderHighScores();
}

function renderHighScores() {
    let key = `matching_hs_${currentDifficulty}`;
    let scores = JSON.parse(localStorage.getItem(key) || "[]");
    const container = document.getElementById('high-scores-list');
    if (scores.length === 0) {
        container.innerHTML = `<span class="text-slate-500">NO RECORDS YET</span>`;
    } else {
        container.innerHTML = scores.map((s, i) => `<span>#${i+1}: <span class="text-cyan-300">${s}</span></span>`).join('');
    }
}

function handleGameClear() {
    clearInterval(timerInterval);

    const timeBonus = timer * 10;
    const finalScore = score + timeBonus;

    saveHighScore(finalScore);

    document.getElementById('modal-base-score').textContent = score;
    document.getElementById('modal-time-bonus').textContent = `+${timeBonus}`;
    document.getElementById('modal-max-combo').textContent = `x${maxCombo}`;
    document.getElementById('modal-moves').textContent = moves;
    document.getElementById('modal-final-score').textContent = finalScore;

    const nextBtn = document.getElementById('next-level-btn');
    const nextDiff = DIFFICULTY_SETTINGS[currentDifficulty].next;

    if (nextDiff === 'normal') {
        nextBtn.innerHTML = `<span>NORMAL (4x4) へ挑戦</span> <i class="fa-solid fa-arrow-right"></i>`;
    } else if (nextDiff === 'hard') {
        nextBtn.innerHTML = `<span>HARD (6x6) へ挑戦</span> <i class="fa-solid fa-arrow-right"></i>`;
    } else {
        nextBtn.innerHTML = `<span>最初 (EASY) から遊ぶ</span> <i class="fa-solid fa-rotate-left"></i>`;
    }

    document.getElementById('clear-modal').classList.remove('hidden');

    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
}

function handleGameOver() {
    isBoardLocked = true;
    document.getElementById('gameover-modal').classList.remove('hidden');
}

window.addEventListener('DOMContentLoaded', () => {
    createStars();
    setDifficulty('easy');
});