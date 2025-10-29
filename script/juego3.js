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
let timeLeft = 120; // 2 minutos
let gameRunning = true;

// === CREAR NUBES ===
function createCloud() {
  const cloud = document.createElement("div");
  const sizes = ["small", "medium", "large"];
  const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
  cloud.classList.add("cloud", randomSize);
  cloud.style.top = Math.random() * 80 + "%";
  sky.appendChild(cloud);
  setTimeout(() => cloud.remove(), 130000);
}
setInterval(createCloud, 5000);
for (let i = 0; i < 5; i++) createCloud();

// === CREAR AVES ===
function createBird() {
  if (!gameRunning) return;
  const bird = document.createElement("img");
  bird.src = "https://cdn-icons-png.flaticon.com/512/616/616408.png";
  bird.classList.add("bird");
  bird.style.top = Math.random() * 70 + "%";
  bird.style.animationDuration = (10 + Math.random() * 10) + "s";
  sky.appendChild(bird);
  setTimeout(() => bird.remove(), 20000);
}
setInterval(createBird, 15000);

// === CREAR MONEDAS ===
function createCoin() {
  if (!gameRunning) return;
  const coin = document.createElement("div");
  coin.classList.add("coin");
  coin.style.top = Math.random() * 80 + "%";
  sky.appendChild(coin);

  const move = setInterval(() => {
    if (!gameRunning) return;
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
      clearInterval(move);
    }
  }, 50);

  setTimeout(() => {
    coin.remove();
    clearInterval(move);
  }, 15000);
}
setInterval(createCoin, 10000);

// === MOVIMIENTO DEL AVIÓN CON INERCIA ===
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

// === LOOP DE MOVIMIENTO ===
function updatePlane() {
  if (!gameRunning) return;
  planeY += velocityY * 5;
  planeX += velocityX * 5;

  // límites
  planeY = Math.max(20, Math.min(window.innerHeight - 100, planeY));
  planeX = Math.max(0, Math.min(window.innerWidth - 120, planeX));

  plane.style.top = planeY + "px";
  plane.style.left = planeX + "px";

  requestAnimationFrame(updatePlane);
}
updatePlane();

// === CONTADOR DE TIEMPO ===
const timer = setInterval(() => {
  if (!gameRunning) return;
  timeLeft--;
  timeDisplay.textContent = timeLeft;
  if (timeLeft <= 0) endGame();
}, 1000);

// === FIN DEL JUEGO ===
function endGame() {
  gameRunning = false;
  clearInterval(timer);
  endScreen.classList.remove("hidden");
  finalCoins.textContent = coins;
}

// === REINICIAR ===
restartBtn.addEventListener("click", () => window.location.reload());
