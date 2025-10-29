const iniciarBtn = document.getElementById("iniciar");
const detenerBtn = document.getElementById("detener");
const tiempoDisplay = document.getElementById("tiempo");
const aciertosDisplay = document.getElementById("aciertos");
const intentosDisplay = document.getElementById("intentos");
const colorCirculo = document.getElementById("color");

let tiempoRestante = 60; // segundos totales
let intervaloTiempo, intervaloColor;
let aciertos = 0;
let intentos = 0;
let colorActual = "";
let jugando = false;

function actualizarTiempo() {
  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  tiempoDisplay.textContent = `${minutos}:${segundos < 10 ? "0" + segundos : segundos}`;

  if (tiempoRestante <= 0) {
    detenerJuego();
  } else {
    tiempoRestante--;
  }
}

function cambiarColor() {
  const colores = ["red", "yellow", "blue", "green"];
  const random = Math.floor(Math.random() * colores.length);
  colorActual = colores[random];
  colorCirculo.style.background = colorActual;
}

function iniciarJuego() {
  if (jugando) return;

  jugando = true;
  aciertos = 0;
  intentos = 0;
  tiempoRestante = 60;

  aciertosDisplay.textContent = "0";
  intentosDisplay.textContent = "0";

  iniciarBtn.disabled = true;
  detenerBtn.disabled = false;

  colorCirculo.style.background = "transparent";

  intervaloTiempo = setInterval(actualizarTiempo, 1000);
  intervaloColor = setInterval(cambiarColor, 1500);
}

function detenerJuego() {
  if (!jugando) return;

  jugando = false;
  clearInterval(intervaloTiempo);
  clearInterval(intervaloColor);
  iniciarBtn.disabled = false;
  detenerBtn.disabled = true;

  colorCirculo.style.background = "transparent";

  alert(`🧠 Juego finalizado
✅ Aciertos: ${aciertos}
🎮 Intentos: ${intentos}`);
}

document.addEventListener("keydown", (e) => {
  if (!jugando) return;

  if (e.code === "Space") {
    intentos++;
    intentosDisplay.textContent = intentos;

    if (colorActual === "blue") {
      aciertos++;
      aciertosDisplay.textContent = aciertos;
      colorCirculo.style.background = "lightgreen";
      setTimeout(() => colorCirculo.style.background = colorActual, 300);
    }
  }

  if (e.code === "Escape") {
    detenerJuego();
  }
});

iniciarBtn.addEventListener("click", iniciarJuego);
detenerBtn.addEventListener("click", detenerJuego);

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const url = card.getAttribute("data-game");

      if (url) {
        window.location.href = url;
      } else {
        console.error("No se encontró la ruta del juego en data-game");
      }
    });
  });
});
