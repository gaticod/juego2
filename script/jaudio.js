const audio = document.getElementById("audio");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const progressBar = document.getElementById("progress-bar");

const modal = document.getElementById("result-modal");
const triesEl = document.getElementById("tries");
const evaluationEl = document.getElementById("evaluation");
const closeModalBtn = document.getElementById("close-modal");

let spacePresses = 0;
const targetPresses = 30;
let gameRunning = false;
let progressInterval;

function updateProgress() {
  if (audio.duration > 0) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percent + "%";
  }
}

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  spacePresses = 0;
  progressBar.style.width = "0%";
  modal.classList.add("hidden");

  audio.currentTime = 0;
  audio.play();

  startBtn.disabled = true;
  stopBtn.disabled = false;

  progressInterval = setInterval(updateProgress, 200);
}

function stopGame(showModal = true) {
  if (!gameRunning) return;
  gameRunning = false;
  clearInterval(progressInterval);
  audio.pause();
  progressBar.style.width = "0%";
  startBtn.disabled = false;
  stopBtn.disabled = true;

  if (showModal) showResults();
}

function showResults() {
  triesEl.textContent = spacePresses;
  evaluationEl.textContent =
    spacePresses >= targetPresses
      ? "✅ Atención Dividida Adecuada"
      : "⚠️ Atención Dividida Insuficiente";
  modal.classList.remove("hidden");
}

startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", () => stopGame(true));
closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;

  if (e.code === "Space") {
    spacePresses++;
  }

  if (e.code === "Escape") {
    stopGame(true);
  }
});

audio.addEventListener("ended", () => stopGame(true));

window.addEventListener("message", (e) => {
  if (e.data.action === "start") {
    iniciarJuego(); // tu función principal del juego de audio
  }
  if (e.data.action === "key") {
    const fakeEvent = new KeyboardEvent("keydown", { key: e.data.key });
    document.dispatchEvent(fakeEvent);
  }
});
