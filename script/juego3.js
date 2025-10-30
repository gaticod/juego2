// juego3.js (versión corregida — movimiento de monedas por JS para colisiones fiables)
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

// arrays para limpiar intervalos si es necesario
const coinIntervals = new Set();
const coinMoves = new Set();

// --- NUBES (sin cambios) ---
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

// --- AVES (sin cambios) ---
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
setInterval(createBird, 20000);

// --- MONEDAS: ahora MOVIMIENTO por JS para evitar problemas de colisión ---
function createCoin() {
  if (!gameRunning) return;

  const coin = document.createElement("div");
  coin.classList.add("coin");
  // posición vertical aleatoria; posición horizontal inicial fuera a la derecha
  const topPos = Math.random() * 80;
  coin.style.top = topPos + "vh"; // usamos vh para quedar bien con diferentes tamaños
  let posX = window.innerWidth + 20; // px, comienza fuera de pantalla
  coin.style.left = posX + "px";
  sky.appendChild(coin);

  // velocidad aleatoria ligera
  const speed = 3 + Math.random() * 3; // px por tick

  // mover la moneda con setInterval (control total)
  const moveId = setInterval(() => {
    if (!gameRunning) return;
    posX -= speed;
    coin.style.left = posX + "px";

    // comprobación de colisión
    const coinRect = coin.getBoundingClientRect();
    const planeRect = plane.getBoundingClientRect();

    if (
      coinRect.left < planeRect.right &&
      coinRect.right > planeRect.left &&
      coinRect.top < planeRect.bottom &&
      coinRect.bottom > planeRect.top
    ) {
      // moneda recogida
      coins++;
      if (coinsDisplay) coinsDisplay.textContent = coins;
      // efecto visual rápido (opcional): scale antes de quitar
      coin.remove();
      clearInterval(moveId);
      coinMoves.delete(moveId);
      return;
    }

    // si ya salió por la izquierda, limpiamos
    if (posX < -100) {
      coin.remove();
      clearInterval(moveId);
      coinMoves.delete(moveId);
      return;
    }
  }, 25);

  // guardamos para limpiar si se acaba el juego
  coinMoves.add(moveId);

  // seguridad: eliminar moneda si algo falla (10s)
  const killId = setTimeout(() => {
    try { coin.remove(); } catch {}
    clearInterval(moveId);
    coinMoves.delete(moveId);
    coinIntervals.delete(killId);
  }, 10000);
  coinIntervals.add(killId);
}

// Inicia las monedas cada 10s y una al inicio
createCoin();
const coinSpawner = setInterval(createCoin, 10000);

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

  // límites
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
  if (timeDisplay) timeDisplay.textContent = timeLeft;
  if (timeLeft <= 0) endGame();
}, 1000);

// --- FIN DEL JUEGO ---
function endGame() {
  if (!gameRunning) return;
  gameRunning = false;

  // limpiar intervalos de monedas y spawn
  clearInterval(timer);
  clearInterval(coinSpawner);
  coinIntervals.forEach(id => clearTimeout(id));
  coinMoves.forEach(id => clearInterval(id));
  coinIntervals.clear();
  coinMoves.clear();

  // mostrar pantalla final
  endScreen.classList.remove("hidden");
  finalCoins.textContent = coins;
}

// --- REINICIAR ---
if (restartBtn) {
  restartBtn.addEventListener("click", () => window.location.reload());
}
