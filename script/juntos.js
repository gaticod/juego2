// juego3.js (versión integrada con audio y conteo Space)
// elementos DOM
const sky = document.getElementById("sky");
const plane = document.getElementById("plane");
const coinsDisplay = document.getElementById("coins");
const timeDisplay = document.getElementById("time");
const endScreen = document.getElementById("end-screen");
const finalCoins = document.getElementById("final-coins");
const finalSpace = document.getElementById("final-space");
const restartBtn = document.getElementById("restart");
const spaceCountEl = document.getElementById("spaceCount");
const bgAudio = document.getElementById("bgAudio");

// estado del juego
let planeY = window.innerHeight / 2;
let planeX = 120;
let velocityY = 0;
let velocityX = 0;
let coins = 0;
let timeLeft = 300; // 5 minutos
let gameRunning = false;

let coinCountCreated = 0; // cuántas monedas creadas (máx 60)
let coinMoves = new Set();
let coinCleanupTimers = new Set();

let spaceCount = 0;

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

// crear algunas nubes iniciales y continuar
for (let i = 0; i < 4; i++) createCloud();
setInterval(() => createCloud(), 8000);

// --- AVES ---
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
setInterval(() => createBird(), 20000);

// --- MONEDAS: movimiento por JS para colisiones fiables ---
function createCoin() {
  if (!gameRunning) return;
  if (coinCountCreated >= 60) return;

  const coin = document.createElement("div");
  coin.classList.add("coin");

  // posición vertical aleatoria (vh para adaptarse)
  const topPos = Math.random() * 80;
  coin.style.top = topPos + "vh";

  // posición inicial fuera de la derecha
  let posX = window.innerWidth + 40;
  coin.style.left = posX + "px";

  sky.appendChild(coin);

  coinCountCreated++;

  // velocidad aleatoria
  const speed = 3 + Math.random() * 3; // px por tick

  const moveId = setInterval(() => {
    if (!gameRunning) return;
    posX -= speed;
    coin.style.left = posX + "px";

    // comprobación de colisión con avión
    const coinRect = coin.getBoundingClientRect();
    const planeRect = plane.getBoundingClientRect();

    if (
      coinRect.left < planeRect.right &&
      coinRect.right > planeRect.left &&
      coinRect.top < planeRect.bottom &&
      coinRect.bottom > planeRect.top
    ) {
      // recogido
      coins++;
      if (coinsDisplay) coinsDisplay.textContent = `${coins}`;
      try { coin.remove(); } catch(e){}
      clearInterval(moveId);
      coinMoves.delete(moveId);
      return;
    }

    // fuera de pantalla
    if (posX < -120) {
      try { coin.remove(); } catch(e){}
      clearInterval(moveId);
      coinMoves.delete(moveId);
      return;
    }
  }, 25);

  coinMoves.add(moveId);

  // seguridad: eliminar moneda si algo falla a los 12s
  const killTimer = setTimeout(() => {
    try { coin.remove(); } catch(e){}
    clearInterval(moveId);
    coinMoves.delete(moveId);
    coinCleanupTimers.delete(killTimer);
  }, 12000);
  coinCleanupTimers.add(killTimer);
}

// Generador de monedas: cada 3 segundos, hasta 60
let coinSpawner = null;
function startCoinSpawner() {
  // generar una inicial rápida (opcional)
  createCoin();
  coinSpawner = setInterval(() => {
    if (!gameRunning) return;
    if (coinCountCreated < 60) createCoin();
    else clearInterval(coinSpawner);
  }, 3000);
}

// --- MOVIMIENTO DEL AVIÓN ---
function handleKeyDown(e) {
  if (!gameRunning) return;
  const speed = 2;
  if (e.key === "ArrowUp") velocityY = -speed;
  if (e.key === "ArrowDown") velocityY = speed;
  if (e.key === "ArrowLeft") velocityX = -speed;
  if (e.key === "ArrowRight") velocityX = speed;

  if (e.code === "Space" || e.key === " ") {
    // evitar que la página haga scroll o mueva foco
    e.preventDefault();
    spaceCount++;
    if (spaceCountEl) spaceCountEl.textContent = spaceCount;
  }

  if (e.key === "Escape") {
    endGame();
  }
}

function handleKeyUp(e) {
  if (["ArrowUp", "ArrowDown"].includes(e.key)) velocityY = 0;
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) velocityX = 0;
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// --- LOOP DE MOVIMIENTO ---
function updatePlane() {
  if (!gameRunning) return;
  planeY += velocityY * 5;
  planeX += velocityX * 5;

  // límites
  planeY = Math.max(20, Math.min(window.innerHeight - 100, planeY));
  planeX = Math.max(0, Math.min(window.innerWidth - (plane.offsetWidth + 20), planeX));

  plane.style.top = planeY + "px";
  plane.style.left = planeX + "px";

  requestAnimationFrame(updatePlane);
}

// --- INICIO DEL JUEGO (cuenta regresiva 3s visible en HUD temporales) ---
function startGame() {
  if (gameRunning) return;
  gameRunning = true;

  // actualizar displays iniciales
  if (coinsDisplay) coinsDisplay.textContent = `${coins}`;
  if (timeDisplay) timeDisplay.textContent = `${timeLeft}`;
  if (spaceCountEl) spaceCountEl.textContent = `${spaceCount}`;

  // iniciar audio (play) — algunos navegadores requieren interacción, pero
  // al iniciar tras un gesto (p.ej. click) está permitido; aquí lo intentamos:
  try {
    bgAudio.loop = true;
    bgAudio.volume = 0.8;
    bgAudio.play().catch(()=>{/* sin reproducir si lo bloquea el navegador */});
  } catch (err) {
    console.warn("Audio no pudo iniciarse automáticamente:", err);
  }

  // empezar generador de monedas
  startCoinSpawner();

  // iniciar loop del avión
  updatePlane();

  // iniciar timer 300s
  gameTimer = setInterval(() => {
    if (!gameRunning) return;
    timeLeft--;
    if (timeDisplay) timeDisplay.textContent = `${timeLeft}`;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

// Llamamos a startGame tras una cuenta regresiva visible de 3s
function beginWithCountdown() {
  // crear overlay simple
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(10,10,30,0.9)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "2000";
  overlay.style.color = "#fff";
  overlay.style.fontFamily = "Poppins, sans-serif";
  overlay.style.textAlign = "center";

  const counter = document.createElement("div");
  counter.style.fontSize = "6rem";
  counter.style.fontWeight = "800";
  counter.textContent = "3";

  const label = document.createElement("div");
  label.style.marginTop = "10px";
  label.style.fontSize = "1.2rem";
  label.textContent = "Preparados...";

  overlay.appendChild(counter);
  overlay.appendChild(label);
  document.body.appendChild(overlay);

  let c = 3;
  const iv = setInterval(() => {
    c--;
    if (c > 0) {
      counter.textContent = c;
      if (c === 1) label.textContent = "¡Listo!";
    } else {
      clearInterval(iv);
      counter.textContent = "¡Vamos!";
      label.textContent = "";
      setTimeout(() => {
        document.body.removeChild(overlay);
        startGame();
      }, 700);
    }
  }, 1000);
}

// iniciar automáticamente la cuenta regresiva al cargar
window.addEventListener("load", () => {
  // posicion inicial del avión
  planeY = window.innerHeight / 2 - plane.offsetHeight / 2;
  planeX = 120;
  plane.style.top = planeY + "px";
  plane.style.left = planeX + "px";

  beginWithCountdown();
});

// variables de intervalos para limpiar
let gameTimer = null;

// --- FIN DEL JUEGO ---
function endGame() {
  if (!gameRunning) return;
  gameRunning = false;

  // detener audio
  try { bgAudio.pause(); bgAudio.currentTime = 0; } catch(e){}

  // limpiar timers
  if (gameTimer) clearInterval(gameTimer);
  if (coinSpawner) clearInterval(coinSpawner);
  coinMoves.forEach(id => clearInterval(id));
  coinCleanupTimers.forEach(id => clearTimeout(id));
  coinMoves.clear();
  coinCleanupTimers.clear();

  // mostrar modal final con resultados
  endScreen.classList.remove("hidden");
  if (finalCoins) finalCoins.textContent = coins;
  if (finalSpace) finalSpace.textContent = spaceCount;
}

// --- REINICIAR ---
if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    location.reload();
  });
}
