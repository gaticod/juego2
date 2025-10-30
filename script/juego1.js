// =============================
// 🎯 LÓGICA DEL JUEGO
// =============================
const radar = document.querySelector('.radar-container');
const resultModal = document.getElementById('resultModal');
const resultText = document.getElementById('resultText');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

let attempts = 0;
let hits = 0;
let bad = 0;
let activeColor = null;
let gameRunning = false;

// Calcular posición aleatoria dentro del radar
function randomPosition(radius) {
  const angle = Math.random() * 2 * Math.PI;
  const r = radius * (0.4 + Math.random() * 0.6);
  const x = 260 + r * Math.cos(angle);
  const y = 260 + r * Math.sin(angle);
  return { x, y };
}

// Crear un nuevo punto
function createDot() {
  if (!gameRunning) return;

  const colors = ['blue', 'yellow', 'green'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const pos = randomPosition(220);

  const dot = document.createElement('div');
  dot.classList.add('dot');
  dot.style.background = color;
  dot.style.left = `${pos.x}px`;
  dot.style.top = `${pos.y}px`;

  radar.appendChild(dot);
  activeColor = color;

  // Eliminar el punto después de 1.6s y crear otro
  setTimeout(() => {
    dot.remove();
    if (gameRunning) createDot();
  }, 1600);
}

// Detectar teclas
document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;

  if (e.code === 'Space') {
    attempts++;

    if (activeColor === 'blue') {
      hits++;
    } else if (activeColor === 'yellow' || activeColor === 'green') {
      bad++;
    }
  }

  if (e.code === 'Escape') {
    showResults();
  }
});

// Iniciar el juego
function startGame() {
  gameRunning = true;
  startBtn.style.display = 'none';
  createDot();
}

// Mostrar resultados
function showResults() {
  gameRunning = false;

  let level = 'Bajo';
  let levelColor = '#ff4d4d';

  if (hits > 40) { level = 'Alto'; levelColor = '#00ff88'; }
  else if (hits > 20) { level = 'Medio'; levelColor = '#ffcc00'; }

  resultText.innerHTML = `
    <strong>Intentos:</strong> ${attempts}<br>
    <strong>Aciertos:</strong> ${hits}<br>
    <strong>Erróneos:</strong> ${bad}<br>
    <strong style="color:${levelColor}">Nivel de Atención: ${level}</strong>
  `;

  resultModal.classList.remove('hidden');
  resultModal.style.display = 'flex';
}

// Reiniciar juego
restartBtn.addEventListener('click', () => location.reload());
startBtn.addEventListener('click', startGame);


// =============================
// 🧠 MODAL CONSEJERO
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalConsejero");
  const btnCerrar = document.getElementById("cerrarModal");

  // Mostrar el modal automáticamente al cargar la página
  modal.classList.remove("hidden");

  // Función para cerrar el modal
  const cerrarModal = () => {
    modal.classList.add("animate__fadeOut");
    modal.classList.remove("animate__fadeIn");

    // Esperar la animación antes de ocultarlo
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("animate__fadeOut");
    }, 400);
  };

  // Cerrar al hacer clic en el botón
  btnCerrar.addEventListener("click", cerrarModal);

  // Cerrar al presionar Enter
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") cerrarModal();
  });
});


// =============================
// 💬 MENSAJES DINÁMICOS DEL DINO
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const mensajes = [
    "Presiona espacio cuando veas el círculo azul 🟦",
    "Concéntrate... ¡El radar está buscando objetivos! 🎯",
    "Excelente reflejo 🚀",
    "Mantente atento 👀",
    "Recuerda: la velocidad y precisión son clave ⚡"
  ];

  const dinoMessage = document.getElementById("dinoMessage");
  let index = 0;

  // Función para mostrar el mensaje
  const mostrarMensaje = () => {
    dinoMessage.classList.remove("show");
    setTimeout(() => {
      dinoMessage.querySelector("p").textContent = mensajes[index];
      dinoMessage.classList.add("show");
      index = (index + 1) % mensajes.length;
    }, 600);
  };

  mostrarMensaje();
  setInterval(mostrarMensaje, 5000);
});


// =============================
// ☁️ SISTEMA DE NUBES ANIMADAS
// =============================
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Sistema de nubes animadas cargado correctamente");

  const clouds = document.querySelectorAll(".cloud");

  clouds.forEach((cloud, index) => {
    cloud.setAttribute("data-cloud-index", index + 1);

    cloud.addEventListener("mouseenter", function () {
      this.style.filter = "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.15))";
    });

    cloud.addEventListener("mouseleave", function () {
      this.style.filter = "drop-shadow(0 4px 15px rgba(0, 0, 0, 0.1))";
    });
  });

  console.log(`[v0] ${clouds.length} nubes animadas inicializadas`);
});
