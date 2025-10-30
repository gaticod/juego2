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
  // Calculamos usando el tamaño real del contenedor radar para que
  // las coordenadas sean siempre relativas al centro y no salgan del círculo.
  const width = radar.clientWidth;
  const height = radar.clientHeight;
  const centerX = width / 2;
  const centerY = height / 2;

  // Distancia con distribución uniforme dentro del círculo
  const angle = Math.random() * 2 * Math.PI;
  const r = Math.sqrt(Math.random()) * radius; // sqrt para distribución homogénea
  const x = centerX + r * Math.cos(angle);
  const y = centerY + r * Math.sin(angle);

  return { x, y };
}

// Crear un nuevo punto
function createDot() {
  if (!gameRunning) return;

  const colors = ['blue', 'yellow', 'green'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Calculamos radio efectivo: usamos la mitad del menor lado (ancho/alto)
  // y restamos un pequeño margen para que el punto nunca toque el borde.
  const radarRadius = Math.min(radar.clientWidth, radar.clientHeight) / 2 - 20;
  const pos = randomPosition(radarRadius);

  const dot = document.createElement('div');
  dot.classList.add('dot');
  dot.style.background = color;

  // Posición relativa al contenedor (.radar-container) en px
  // Aseguramos que la posición use translate(-50%,-50%) en CSS para centrar el punto
  dot.style.left = `${pos.x}px`;
  dot.style.top = `${pos.y}px`;
  dot.style.position = 'absolute';

  radar.appendChild(dot);
  activeColor = color;

  // Eliminar el punto después de 1.6s y crear otro
  setTimeout(() => {
    if (dot && dot.parentElement) dot.remove();
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
