"use strict";

// ==============================
// Space Shooter - Game Logic
// ==============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const hpElement = document.getElementById("hp");
const powerElement = document.getElementById("power");
const bossHpElement = document.getElementById("bossHp");
const bossBarFill = document.getElementById("bossBarFill");
const bestScoreElement = document.getElementById("bestScore");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");
const startButton = document.getElementById("startButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const BOSS_KILL_LIMIT = 24;   // 4 waves x 6 enemies, then the boss
const WAVE_LENGTH = 5.5;      // seconds per wave
const WAVE_NORMALS = 5;       // normal enemies per wave
const MAX_ON_SCREEN = 9;       // hard cap so the screen never floods

const keys = new Set();

let state = "ready";
let score = 0;
let bestScore = loadBestScore();
let defeatedEnemies = 0;
let waveTime = 0;
let waveSchedule = [];
let waveNumber = 0;
let gameTime = 0;
let lastTime = 0;
let animationId = 0;
let boss = null;
let bossSpawned = false;
let shake = 0;

let player;
let playerBullets = [];
let enemyBullets = [];
let enemies = [];
let items = [];
let particles = [];
let rings = [];
let hurtFlash = 0;
let bgScroll = 0;
let time = 0;

const bossHud = document.getElementById("bossHud");
const bossPips = [...document.querySelectorAll("#bossPips i")];
const stageTag = document.getElementById("stageTag");
const banner = document.getElementById("banner");
const stageSelect = document.getElementById("stageSelect");
const menuButton = document.getElementById("menuButton");
const ssGrid = document.getElementById("ssGrid");
const BOSS_TIME = 30;      // boss arrives 30 s after the stage starts
const BOSS_LEVELS = 5;     // boss has 5 HP levels
let stageIdx = 0;
let bossWarned = false;
let bgPlanet = null;
let ssCards = [];
let bannerTimer = 0;

const stars = Array.from({ length: 140 }, () => {
    const z = Math.random();
    const roll = Math.random();

    return {
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        z,
        size: 0.6 + z * 1.7,
        speed: 14 + z * 80,
        tw: Math.random() * Math.PI * 2,
        color: roll < 0.2 ? "#9fd8ff" : roll < 0.33 ? "#ffc6e8" : "#e6f1ff"
    };
});
