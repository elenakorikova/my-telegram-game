const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Игрок
const playerImg = new Image();
playerImg.src = "images/player.png";
let playerImgLoaded = false;
playerImg.onload = () => {
  playerImgLoaded = true;
  console.log("Player image loaded");
};

// Скорость движения игрока
let moveSpeed = 12;

// Получаем кнопки управления
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// Интервал для плавного движения при удержании
let moveInterval;

// Управление кнопками

document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  document.getElementById('controls').style.display = 'block'; // показываем кнопки
  startGame();
});

function startMove(direction) {
  clearInterval(moveInterval);
  moveInterval = setInterval(() => movePlayer(direction), 50);
}

function stopMove() {
  clearInterval(moveInterval);
}

leftBtn.addEventListener("mousedown", () => startMove(-1));
leftBtn.addEventListener("mouseup", stopMove);
leftBtn.addEventListener("mouseleave", stopMove);

rightBtn.addEventListener("mousedown", () => startMove(1));
rightBtn.addEventListener("mouseup", stopMove);
rightBtn.addEventListener("mouseleave", stopMove);

// Поддержка сенсорных устройств
leftBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startMove(-1); });
leftBtn.addEventListener("touchend", stopMove);

rightBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startMove(1); });
rightBtn.addEventListener("touchend", stopMove);

// Отключаем масштабирование при быстром нажатии
document.addEventListener("touchstart", function (event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });

document.addEventListener("gesturestart", function (event) {
  event.preventDefault();
});

function movePlayer(direction) {
  player.x += direction * moveSpeed;
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
}

// HUD
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

// Screens
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const victoryScreen = document.getElementById("victory");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const restartBtnVictory = document.getElementById("restart-btn-victory");

// Звуки
const catchSound = new Audio("sounds/catch.mp3");
const lifeUpSound = new Audio("sounds/lifeup.mp3");
const lifeDownSound = new Audio("sounds/lifedown.mp3");
const victorySound = new Audio("sounds/victory.mp3");

// Игровые параметры
let score = 0;
let lives = 5;
let objects = [];
let player = { x: 400, y: 550, size: 40, speed: 8 };
let gameRunning = false;
let fallSpeed = 2;
let spawnInterval = 1500; // мс
let lastSpawn = 0;

// Типы предметов
const types = [
  { name: "bug", img: "images/bug.png", action: () => { score++; catchSound.play(); } },
  { name: "mockup", img: "images/mockup.png", action: () => { if (lives < 5) { lives++; lifeUpSound.play(); } } },
  { name: "confluence", img: "images/confluence.png", action: () => { lives = 5; lifeUpSound.play(); } },
  { name: "fire", img: "images/fire.png", action: () => { lives--; lifeDownSound.play(); } },
];

let images = {};
types.forEach(type => {
  const img = new Image();
  img.src = type.img;
  images[type.name] = img;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") movePlayer(-1);
  if (e.key === "ArrowRight") movePlayer(1);
});

function spawnObject() {
  const type = types[Math.floor(Math.random() * types.length)];
  objects.push({
    x: Math.random() * (canvas.width - 32),
    y: -32,
    type: type.name
  });
}

function update(delta) {
  fallSpeed += delta * 0.0001;
  spawnInterval = Math.max(500, spawnInterval - delta * 0.00005);

  if (performance.now() - lastSpawn > spawnInterval) {
    spawnObject();
    lastSpawn = performance.now();
  }

  for (let i = objects.length - 1; i >= 0; i--) {
    objects[i].y += fallSpeed;
    if (objects[i].y > canvas.height) {
      objects.splice(i, 1);
      continue;
    }

    if (
      objects[i].x < player.x + player.size &&
      objects[i].x + 32 > player.x &&
      objects[i].y < player.y + player.size &&
      objects[i].y + 32 > player.y
    ) {
      let typeData = types.find(t => t.name === objects[i].type);
      typeData.action();
      objects.splice(i, 1);
    }
  }

  if (lives <= 0) {
    endGame(false);
  }
  if (score >= 20) {
    endGame(true);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Рисуем игрока
  if (playerImgLoaded) {
    ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
  } else {
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.size, player.size);
  }

  // Рисуем предметы
  objects.forEach(obj => {
    ctx.drawImage(images[obj.type], obj.x, obj.y, 32, 32);
  });

  // Обновляем HUD
  scoreEl.textContent = "Счёт: " + score;
  livesEl.textContent = "Жизни: " + lives;
}

let lastTime = 0;
function gameLoop(timestamp) {
  if (!gameRunning) return;
  let delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta);
  draw();

  requestAnimationFrame(gameLoop);
}

// Запуск игры только после загрузки картинки игрока
startBtn.disabled = true;
playerImg.onload = () => {
  playerImgLoaded = true;
  startBtn.disabled = false;
};

function startGame() {
  score = 0;
  lives = 5;
  fallSpeed = 2;
  spawnInterval = 1500;
  objects = [];
  gameRunning = true;
  lastTime = performance.now();
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  victoryScreen.style.display = "none";
  document.getElementById("game-container").style.display = "block";
  document.getElementById("controls").style.display = "block"; // показываем кнопки
  gameLoop(lastTime);
}

function endGame(victory) {
  gameRunning = false;
  document.getElementById("game-container").style.display = "none";
  document.getElementById("controls").style.display = "none"; // скрываем кнопки
  if (victory) {
    victoryScreen.style.display = "block";
    victorySound.play();
  } else {
    gameOverScreen.style.display = "block";
  }
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
restartBtnVictory.addEventListener("click", startGame);
