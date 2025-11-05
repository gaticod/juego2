// =============================
// 🎯 LÓGICA DEL JUEGO DEL AVIÓN
// =============================
const sky = document.getElementById("sky");
const plane = document.getElementById("plane");
const coinsDisplay = document.getElementById("coins");
const timeDisplay = document.getElementById("time");
const endScreen = document.getElementById("end-screen");
const finalCoins = document.getElementById("final-coins");
const restartBtn = document.getElementById("restart");

let planeY = window.innerHeight / 2;
let planeX = 100;
let velocityY = 0;
let velocityX = 0;
let coins = 0;
let timeLeft = 120; // 🕒 2 minutos exactos
let gameRunning = true;

let coinCount = 0; // 🔢 contador de monedas creadas

// --- NUBES ---
function createCloud() {
  if (!gameRunning) return;
  const cloud = document.createElement("div");
  const sizes = ["small", "medium", "large"];
  const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
  cloud.classList.add("cloud", randomSize);
  cloud.style.top = Math.random() * 80 + "%";
  sky.appendChild(cloud);
  setTimeout(() => cloud.remove(), 130000);
}
setInterval(createCloud, 8000);
for (let i = 0; i < 4; i++) createCloud();


// --- MONEDAS ---
function createCoin() {
  if (!gameRunning || coinCount >= 30) return; // 💰 solo 30 monedas en total

  const coin = document.createElement("div");
  coin.classList.add("coin");

  const topPos = Math.random() * 80;
  coin.style.top = topPos + "vh";
  let posX = window.innerWidth + 20;
  coin.style.left = posX + "px";
  sky.appendChild(coin);

  coinCount++; // incrementamos contador de monedas creadas

  const speed = 3 + Math.random() * 3;
  const moveId = setInterval(() => {
    if (!gameRunning) return;
    posX -= speed;
    coin.style.left = posX + "px";

    const coinRect = coin.getBoundingClientRect();
    const planeRect = plane.getBoundingClientRect();

    if (
      coinRect.left < planeRect.right &&
      coinRect.right > planeRect.left &&
      coinRect.top < planeRect.bottom &&
      coinRect.bottom > planeRect.top
    ) {
      coins++;
      coinsDisplay.textContent = coins;
      coin.remove();
      clearInterval(moveId);
      return;
    }

    if (posX < -100) {
      coin.remove();
      clearInterval(moveId);
    }
  }, 25);

  setTimeout(() => coin.remove(), 10000);
}

// 🕑 Crea una moneda cada 6 segundos (30 monedas en total durante 180s, pero cortamos a 120s)
createCoin();
const coinSpawner = setInterval(() => {
  if (coinCount < 30 && gameRunning) {
    createCoin();
  } else {
    clearInterval(coinSpawner);
  }
}, 6000);

// --- MOVIMIENTO DEL AVIÓN ---
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  const speed = 2;
  if (e.key === "ArrowUp") velocityY = -speed;
  if (e.key === "ArrowDown") velocityY = speed;
  if (e.key === "ArrowLeft") velocityX = -speed;
  if (e.key === "ArrowRight") velocityX = speed;
  if (e.key === "Escape") endGame();
});

document.addEventListener("keyup", (e) => {
  if (["ArrowUp", "ArrowDown"].includes(e.key)) velocityY = 0;
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) velocityX = 0;
});

// --- LOOP DE MOVIMIENTO ---
function updatePlane() {
  if (!gameRunning) return;
  planeY += velocityY * 5;
  planeX += velocityX * 5;

  planeY = Math.max(20, Math.min(window.innerHeight - 100, planeY));
  planeX = Math.max(0, Math.min(window.innerWidth - 120, planeX));

  plane.style.top = planeY + "px";
  plane.style.left = planeX + "px";

  requestAnimationFrame(updatePlane);
}
updatePlane();

// --- CONTADOR DE TIEMPO ---
const timer = setInterval(() => {
  if (!gameRunning) return;
  timeLeft--;
  timeDisplay.textContent = timeLeft;
  if (timeLeft <= 0) endGame();
}, 1000);

// --- FIN DEL JUEGO ---
function endGame() {
  if (!gameRunning) return;
  gameRunning = false;

  clearInterval(timer);
  clearInterval(coinSpawner);

  endScreen.classList.remove("hidden");
  finalCoins.textContent = coins;
}

// --- REINICIAR ---
restartBtn.addEventListener("click", () => window.location.reload());
