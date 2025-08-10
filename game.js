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

// Изображения
let playerImg = new Image();
playerImg.src = "images/player.png";
let playerImgLoaded = false;

const types = [
  { name: "bug", img: "images/bug.png" },
  { name: "mockup", img: "images/mockup.png" },
  { name: "confluence", img: "images/confluence.png" },
  { name: "fire", img: "images/fire.png" },
];

let images = {};
types.forEach(t => {
  const img = new Image();
  img.src = t.img;
  images[t.name] = img;
});

// Игровые переменные
let player = { x: 400, y: 550, width: 50, height: 50, speed: 8 };
let bugs = [];
let score = 0;
let lives = 5;
let gameInterval = null;
let spawnInterval = null;
let bugSpeed = 2;
let acceleration = 0.05;

// Звуки
const soundCatch = new Audio("sounds/catch.mp3");
const soundLose = new Audio("sounds/lifedown.mp3");
const soundVictory = new Audio("sounds/victory.mp3");

// Скрываем контролы до старта
controls.style.display = "none";

// Стартовая кнопка — блокируем пока игрок не загрузится
startBtn.disabled = true;

playerImg.onload = () => {
  playerImgLoaded = true;
  startBtn.disabled = false;
  console.log("Player image loaded, start button enabled");
};
if (playerImg.complete) playerImg.onload();

// Обработчик старта
startBtn.addEventListener("click", () => {
  if (!playerImgLoaded) return;
  startScreen.style.display = "none";
  gameContainer.style.display = "block";
  controls.style.display = "flex";
  startGame();
});

// Запуск игры
function startGame() {
  score = 0;
  lives = 5;
  bugs = [];
  bugSpeed = 2;
  scoreDisplay.textContent = "Счёт: " + score;
  livesDisplay.textContent = "Жизни: " + lives;

  gameOverScreen.style.display = "none";
  victoryScreen.style.display = "none";

  if (gameInterval) clearInterval(gameInterval);
  if (spawnInterval) clearInterval(spawnInterval);

  gameInterval = setInterval(updateGame, 20);
  spawnInterval = setInterval(spawnBug, 1000);
}

// Спавн новых объектов
function spawnBug() {
  let x = Math.random() * (canvas.width - 50);
  // Случайно выбираем тип объекта
  let type = types[Math.floor(Math.random() * types.length)].name;
  bugs.push({ x: x, y: 0, width: 50, height: 50, type });
}

// Обновление игрового цикла
function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = bugs.length - 1; i >= 0; i--) {
    bugs[i].y += bugSpeed;

    // Проверка поимки игроком
    if (
      player.x < bugs[i].x + bugs[i].width &&
      player.x + player.width > bugs[i].x &&
      player.y < bugs[i].y + bugs[i].height &&
      player.y + player.height > bugs[i].y
    ) {
      const objType = bugs[i].type;

      bugs.splice(i, 1);  // удаляем пойманный объект

      if (objType === "bug") {
        score += 3;
        soundCatch.play().catch(() => {});
      } else if (objType === "mockup") {
        score += 1;
        soundCatch.play().catch(() => {});
      } else if (objType === "confluence") {
        lives = 5;
        soundCatch.play().catch(() => {});
      } else if (objType === "fire") {
        lives--;
        soundLose.play().catch(() => {});
        if (lives <= 0) {
          endGame(false);
          return; // чтобы остановить обновление игры после конца
        }
      }

      scoreDisplay.textContent = "Счёт: " + score;
      livesDisplay.textContent = "Жизни: " + lives;

      if (score >= 20) {
        endGame(true);
        return; // чтобы остановить обновление игры после победы
      }

      continue; // объект обработан, идем к следующему
    }

    // Если объект достиг низа экрана — просто удаляем, без изменения жизней
    if (bugs[i].y > canvas.height) {
      bugs.splice(i, 1);
      // Жизни и счет не меняем
      continue;
    }
  }

  // Рисуем объекты
  for (let obj of bugs) {
    if (images[obj.type] && images[obj.type].complete) {
      ctx.drawImage(images[obj.type], obj.x, obj.y, obj.width, obj.height);
    } else {
      ctx.fillStyle = "gray";
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
  }

  // Рисуем игрока
  if (playerImgLoaded) {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
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
    startConfetti(); // добавим анимацию конфетти, если хочешь
  } else {
    gameOverScreen.style.display = "block";
  }
}

// Перезапуск игры
restartBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  gameContainer.style.display = "block";
  controls.style.display = "flex";
  startGame();
});

restartBtnVictory.addEventListener("click", () => {
  victoryScreen.style.display = "none";
  gameContainer.style.display = "block";
  controls.style.display = "flex";
  startGame();
});

// Управление игроком — кнопки влево/вправо (одиночные шаги)
function moveLeftOnce() {
  player.x = Math.max(0, player.x - player.speed);
}
function moveRightOnce() {
  player.x = Math.min(canvas.width - player.width, player.x + player.speed);
}

leftBtn.addEventListener("mousedown", moveLeftOnce);
rightBtn.addEventListener("mousedown", moveRightOnce);

leftBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveLeftOnce();
}, { passive: false });

rightBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveRightOnce();
}, { passive: false });

// Плавное движение при удержании (опционально)
let holdInterval = null;
function clearHoldInterval() {
  if (holdInterval) clearInterval(holdInterval);
  holdInterval = null;
}

leftBtn.addEventListener("mousedown", () => {
  clearHoldInterval();
  holdInterval = setInterval(moveLeftOnce, 60);
});
leftBtn.addEventListener("mouseup", clearHoldInterval);
leftBtn.addEventListener("mouseleave", clearHoldInterval);
leftBtn.addEventListener("touchend", clearHoldInterval);

rightBtn.addEventListener("mousedown", () => {
  clearHoldInterval();
  holdInterval = setInterval(moveRightOnce, 60);
});
rightBtn.addEventListener("mouseup", clearHoldInterval);
rightBtn.addEventListener("mouseleave", clearHoldInterval);
rightBtn.addEventListener("touchend", clearHoldInterval);

// Клавиатура
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveLeftOnce();
  if (e.key === "ArrowRight") moveRightOnce();
});

// Отключаем масштабирование/жесты для тач-устройств
document.addEventListener("touchstart", function (event) {
  if (event.touches.length > 1) event.preventDefault();
}, { passive: false });
document.addEventListener("gesturestart", function (event) {
  event.preventDefault();
});

// ------- Анимация конфетти (простая) -------
function startConfetti() {
  // Твой код или можно подключить библиотеку confetti.js
  // Пока просто выводим сообщение в консоль
  console.log("С днем рождения, Витя! 🎉");
}
