// DOM
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

// Изображения / флаги
let playerImg = new Image();
playerImg.src = "images/player.png";
let playerImgLoaded = false;

let bugImg = new Image();
bugImg.src = "images/bug.png";

// Игровые переменные
let player = { x: 400, y: 500, width: 50, height: 50, speed: 5 };
let bugs = [];
let score = 0;
let lives = 5;
let gameInterval = null;
let spawnInterval = null;
let bugSpeed = 2;
let acceleration = 0.1;

// Скрываем кнопки управления до старта
if (controls) controls.style.display = "none";

// Звуки (необязательно)
const soundCatch = new Audio("sounds/catch.mp3");
const soundLose = new Audio("sounds/lifedown.mp3"); // использую твоё имя файла
const soundVictory = new Audio("sounds/victory.mp3");

// ---- Обработчик кнопки "Начать" — навешиваем всегда ----
startBtn.disabled = true; // блокируем пока не загрузится картинка игрока

function handleStartClick() {
  // Если ресурсы не готовы — игнорируем нажатие
  if (!playerImgLoaded) {
    console.log("Waiting for assets to load...");
    return;
  }
  // Скрываем стартовый экран, показываем игру и контролы
  startScreen.style.display = "none";
  gameContainer.style.display = "block";
  controls.style.display = "flex";
  startGame();
}

startBtn.addEventListener("click", handleStartClick);

// ---- Обработка загрузки картинки игрока ----
playerImg.onload = () => {
  playerImgLoaded = true;
  startBtn.disabled = false;
  console.log("playerImg loaded — start button enabled");
};
// если картинка уже в кеше, вызвать onload вручную
if (playerImg.complete) {
  playerImg.onload();
}

// ---- Основные игровые функции ----
function startGame() {
  score = 0;
  lives = 5;
  bugs = [];
  bugSpeed = 2;
  scoreDisplay.textContent = "Счёт: " + score;
  livesDisplay.textContent = "Жизни: " + lives;

  gameOverScreen.style.display = "none";
  victoryScreen.style.display = "none";

  // Защита от двойного запуска
  if (gameInterval) clearInterval(gameInterval);
  if (spawnInterval) clearInterval(spawnInterval);

  gameInterval = setInterval(updateGame, 20);
  spawnInterval = setInterval(spawnBug, 1000);
}

function spawnBug() {
  let x = Math.random() * (canvas.width - 50);
  bugs.push({ x: x, y: 0, width: 50, height: 50 });
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Движение жуков
  for (let i = bugs.length - 1; i >= 0; i--) {
    bugs[i].y += bugSpeed;
    if (bugs[i].y > canvas.height) {
      bugs.splice(i, 1);
      lives--;
      try { soundLose.play(); } catch (e) {}
      livesDisplay.textContent = "Жизни: " + lives;
      if (lives <= 0) endGame(false);
    }
  }

  // Рисуем жуков
  for (let bug of bugs) {
    if (bugImg.complete) ctx.drawImage(bugImg, bug.x, bug.y, bug.width, bug.height);
    else {
      ctx.fillStyle = "red";
      ctx.fillRect(bug.x, bug.y, bug.width, bug.height);
    }
  }

  // Рисуем игрока
  if (playerImgLoaded) ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  else { ctx.fillStyle = "blue"; ctx.fillRect(player.x, player.y, player.width, player.height); }

  // Проверка столкновений
  for (let i = bugs.length - 1; i >= 0; i--) {
    if (
      player.x < bugs[i].x + bugs[i].width &&
      player.x + player.width > bugs[i].x &&
      player.y < bugs[i].y + bugs[i].height &&
      player.y + player.height > bugs[i].y
    ) {
      bugs.splice(i, 1);
      score++;
      try { soundCatch.play(); } catch (e) {}
      scoreDisplay.textContent = "Счёт: " + score;

      if (score % 10 === 0) bugSpeed += acceleration;
      if (score >= 50) endGame(true);
    }
  }
}

function endGame(victory) {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  gameInterval = null;
  spawnInterval = null;
  controls.style.display = "none";

  if (victory) {
    victoryScreen.style.display = "block";
    try { soundVictory.play(); } catch (e) {}
  } else {
    gameOverScreen.style.display = "block";
  }
}

// Перезапуск
restartBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  controls.style.display = "flex";
  startGame();
});
restartBtnVictory.addEventListener("click", () => {
  victoryScreen.style.display = "none";
  controls.style.display = "flex";
  startGame();
});

// ---- Кнопки влево/вправо: клики и сенсор ----
function moveLeftOnce() { player.x = Math.max(0, player.x - player.speed); }
function moveRightOnce() { player.x = Math.min(canvas.width - player.width, player.x + player.speed); }

// Мышь
leftBtn.addEventListener("mousedown", moveLeftOnce);
rightBtn.addEventListener("mousedown", moveRightOnce);

// Сенсор (touch)
leftBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveLeftOnce(); }, { passive: false });
rightBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveRightOnce(); }, { passive: false });

// Для удержания (плавное движение) — опционально:
let holdInterval = null;
leftBtn.addEventListener("touchstart", () => {
  clearInterval(holdInterval);
  holdInterval = setInterval(moveLeftOnce, 80);
});
leftBtn.addEventListener("touchend", () => clearInterval(holdInterval));
leftBtn.addEventListener("mousedown", () => {
  clearInterval(holdInterval);
  holdInterval = setInterval(moveLeftOnce, 80);
});
leftBtn.addEventListener("mouseup", () => clearInterval(holdInterval));
leftBtn.addEventListener("mouseleave", () => clearInterval(holdInterval));

rightBtn.addEventListener("touchstart", () => {
  clearInterval(holdInterval);
  holdInterval = setInterval(moveRightOnce, 80);
});
rightBtn.addEventListener("touchend", () => clearInterval(holdInterval));
rightBtn.addEventListener("mousedown", () => {
  clearInterval(holdInterval);
  holdInterval = setInterval(moveRightOnce, 80);
});
rightBtn.addEventListener("mouseup", () => clearInterval(holdInterval));
rightBtn.addEventListener("mouseleave", () => clearInterval(holdInterval));

// Клавиатура
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveLeftOnce();
  if (e.key === "ArrowRight") moveRightOnce();
});

// Отключаем масштабирование/жесты, чтобы двойной тап не зумил страницу
document.addEventListener("touchstart", function (event) {
  if (event.touches.length > 1) event.preventDefault();
}, { passive: false });
document.addEventListener("gesturestart", function (event) { event.preventDefault(); });
