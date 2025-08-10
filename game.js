// DOM элементы
const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const controls = document.getElementById("controls");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const gameOverScreen = document.getElementById("game-over");
const restartBtn = document.getElementById("restart-btn");
const victoryScreen = document.getElementById("victory");
const restartBtnVictory = document.getElementById("restart-btn-victory");

const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Игрок и параметры
let playerImg = new Image();
playerImg.src = "images/player.png";
let playerImgLoaded = false;

let bugImg = new Image();
bugImg.src = "images/bug.png";

let player = { x: 400, y: 500, width: 50, height: 50, speed: 8 };
let bugs = [];
let score = 0;
let lives = 5;
let gameInterval = null;
let spawnInterval = null;
let bugSpeed = 2;
let acceleration = 0.1;

// Скрываем кнопки управления до начала игры
controls.style.display = "none";

// Звуки
const soundCatch = new Audio("sounds/catch.mp3");
const soundLose = new Audio("sounds/lifedown.mp3");
const soundVictory = new Audio("sounds/victory.mp3");

// Обработка загрузки игрока и активация кнопки
playerImg.onload = () => {
  playerImgLoaded = true;
  startBtn.disabled = false;
};
if (playerImg.complete) {
  playerImg.onload();
}

// Обработчик кнопки "Начать"
startBtn.addEventListener("click", () => {
  if (!playerImgLoaded) return;
  startScreen.style.display = "none";
  gameContainer.style.display = "block";
  controls.style.display = "flex";
  startGame();
});

// Основные функции игры
function startGame() {
  score = 0;
  lives = 5;
  bugs = [];
  bugSpeed = 2;

  scoreDisplay.textContent = "Счёт: " + score;
  livesDisplay.textContent = "Жизни: " + lives;

  gameOverScreen.style.display = "none";
  victoryScreen.style.display = "none";

  clearInterval(gameInterval);
  clearInterval(spawnInterval);

  gameInterval = setInterval(updateGame, 20);
  spawnInterval = setInterval(spawnBug, 1000);
}

function spawnBug() {
  let x = Math.random() * (canvas.width - 50);
  bugs.push({ x, y: 0, width: 50, height: 50 });
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Движение и удаление жуков
  for (let i = bugs.length - 1; i >= 0; i--) {
    bugs[i].y += bugSpeed;
    if (bugs[i].y > canvas.height) {
      bugs.splice(i, 1);
      lives--;
      soundLose.play().catch(() => {});
      livesDisplay.textContent = "Жизни: " + lives;
      if (lives <= 0) endGame(false);
    }
  }

  // Рисуем жуков
  for (let bug of bugs) {
    if (bugImg.complete) {
      ctx.drawImage(bugImg, bug.x, bug.y, bug.width, bug.height);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(bug.x, bug.y, bug.width, bug.height);
    }
  }

  // Рисуем игрока
  if (playerImgLoaded) {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  // Коллизии
  for (let i = bugs.length - 1; i >= 0; i--) {
    if (
      player.x < bugs[i].x + bugs[i].width &&
      player.x + player.width > bugs[i].x &&
      player.y < bugs[i].y + bugs[i].height &&
      player.y + player.height > bugs[i].y
    ) {
      bugs.splice(i, 1);
      score++;
      soundCatch.play().catch(() => {});
      scoreDisplay.textContent = "Счёт: " + score;

      if (score % 10 === 0) bugSpeed += acceleration;
      if (score >= 50) endGame(true);
    }
  }
}

// Завершение игры
function endGame(victory) {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  gameInterval = null;
  spawnInterval = null;

  controls.style.display = "none";
  gameContainer.style.display = "none";

  if (victory) {
    victoryScreen.style.display = "block";
    soundVictory.play().catch(() => {});
  } else {
    gameOverScreen.style.display = "block";
  }
}

// Перезапуск игры
restartBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  controls.style.display = "flex";
  gameContainer.style.display = "block";
  startGame();
});

restartBtnVictory.addEventListener("click", () => {
  victoryScreen.style.display = "none";
  controls.style.display = "flex";
  gameContainer.style.display = "block";
  startGame();
});

// Управление игроком — кнопки
function moveLeftOnce() {
  player.x = Math.max(0, player.x - player.speed);
}
function moveRightOnce() {
  player.x = Math.min(canvas.width - player.width, player.x + player.speed);
}

let leftInterval = null;
let rightInterval = null;

leftBtn.addEventListener("mousedown", () => {
  moveLeftOnce();
  leftInterval = setInterval(moveLeftOnce, 50);
});
leftBtn.addEventListener("mouseup", () => clearInterval(leftInterval));
leftBtn.addEventListener("mouseleave", () => clearInterval(leftInterval));

rightBtn.addEventListener("mousedown", () => {
  moveRightOnce();
  rightInterval = setInterval(moveRightOnce, 50);
});
rightBtn.addEventListener("mouseup", () => clearInterval(rightInterval));
rightBtn.addEventListener("mouseleave", () => clearInterval(rightInterval));

// Сенсорное управление (тач)
leftBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  moveLeftOnce();
  leftInterval = setInterval(moveLeftOnce, 50);
}, { passive: false });
leftBtn.addEventListener("touchend", () => clearInterval(leftInterval));

rightBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  moveRightOnce();
  rightInterval = setInterval(moveRightOnce, 50);
}, { passive: false });
rightBtn.addEventListener("touchend", () => clearInterval(rightInterval));

// Клавиатура
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") moveLeftOnce();
  else if (e.key === "ArrowRight") moveRightOnce();
});

// Отключение масштабирования на сенсорных устройствах
document.addEventListener("touchstart", e => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });
document.addEventListener("gesturestart", e => e.preventDefault());
