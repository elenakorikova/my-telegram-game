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

const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

leftBtn.addEventListener("mousedown", () => movePlayer(-1));
rightBtn.addEventListener("mousedown", () => movePlayer(1));

// Опционально, чтобы движение было плавным при удержании кнопки:
let moveInterval;

leftBtn.addEventListener("mousedown", () => {
  clearInterval(moveInterval);
  moveInterval = setInterval(() => movePlayer(-1), 50);
});
leftBtn.addEventListener("mouseup", () => clearInterval(moveInterval));
leftBtn.addEventListener("mouseleave", () => clearInterval(moveInterval));

rightBtn.addEventListener("mousedown", () => {
  clearInterval(moveInterval);
  moveInterval = setInterval(() => movePlayer(1), 50);
});
rightBtn.addEventListener("mouseup", () => clearInterval(moveInterval));
rightBtn.addEventListener("mouseleave", () => clearInterval(moveInterval));

function movePlayer(direction) {
  // direction: -1 — влево, 1 — вправо
  player.x += direction * player.speed;
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
  if (e.key === "ArrowLeft") player.x = Math.max(0, player.x - player.speed);
  if (e.key === "ArrowRight") player.x = Math.min(canvas.width - player.size, player.x + player.speed);
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
startBtn.disabled = true; // блокируем кнопку пока картинка не загрузится

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
  gameLoop(lastTime);
}

function endGame(victory) {
  gameRunning = false;
  document.getElementById("game-container").style.display = "none";
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
