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

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

let playerImg = new Image();
playerImg.src = "images/player.png"; // путь к картинке
let playerImgLoaded = false;

let bugImg = new Image();
bugImg.src = "images/bug.png";

let player = { x: 400, y: 500, width: 50, height: 50, speed: 5 };
let bugs = [];
let score = 0;
let lives = 5;
let gameInterval;
let spawnInterval;
let bugSpeed = 2;
let acceleration = 0.1;

// Скрываем кнопки управления до начала игры
controls.style.display = "none";

// Звуки
const soundCatch = new Audio("sounds/catch.mp3");
const soundLose = new Audio("sounds/lose.mp3");
const soundVictory = new Audio("sounds/victory.mp3");

// Загрузка игрока и активация кнопки
playerImg.onload = () => {
  playerImgLoaded = true;
  startBtn.disabled = false;

  startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
    gameContainer.style.display = "block";
    controls.style.display = "flex"; // показываем кнопки
    startGame();
  });
};

function startGame() {
  score = 0;
  lives = 5;
  bugs = [];
  bugSpeed = 2;
  scoreDisplay.textContent = "Счёт: " + score;
  livesDisplay.textContent = "Жизни: " + lives;

  // Убираем экраны конца игры
  gameOverScreen.style.display = "none";
  victoryScreen.style.display = "none";

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
      soundLose.play();
      livesDisplay.textContent = "Жизни: " + lives;
      if (lives <= 0) {
        endGame(false);
      }
    }
  }

  // Отрисовка жуков
  for (let bug of bugs) {
    ctx.drawImage(bugImg, bug.x, bug.y, bug.width, bug.height);
  }

  // Игрок
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // Проверка коллизий
  for (let i = bugs.length - 1; i >= 0; i--) {
    if (
      player.x < bugs[i].x + bugs[i].width &&
      player.x + player.width > bugs[i].x &&
      player.y < bugs[i].y + bugs[i].height &&
      player.y + player.height > bugs[i].y
    ) {
      bugs.splice(i, 1);
      score++;
      soundCatch.play();
      scoreDisplay.textContent = "Счёт: " + score;

      if (score % 10 === 0) {
        bugSpeed += acceleration; // плавное ускорение
      }

      if (score >= 50) {
        endGame(true);
      }
    }
  }
}

function endGame(victory) {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  controls.style.display = "none";

  if (victory) {
    victoryScreen.style.display = "block";
    soundVictory.play();
  } else {
    gameOverScreen.style.display = "block";
  }
}

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

// Кнопки влево/вправо
document.getElementById("left-btn").addEventListener("mousedown", () => {
  player.x -= player.speed;
});
document.getElementById("right-btn").addEventListener("mousedown", () => {
  player.x += player.speed;
});

// Клавиатура
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") player.x -= player.speed;
  if (e.key === "ArrowRight") player.x += player.speed;
});
