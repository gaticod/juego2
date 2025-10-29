// Juego 2 - Atención Selectiva (final pedido)
// Duración total 10 minutos; fases:
// 0-3min => 5x4
// 3-6min => 6x5
// 6-9min => 7x6
// 9-10min => 7x6 (mantenido)
// Rondas cada 5s; 3 X reales (dispersas) por ronda
// Solo 3 selecciones por ronda. Solo cuentan rondas como "acertadas" si el usuario seleccionó las 3 X (3/3).
// Modal aparece solo al final (10 min) o si se presiona ESC (detención manual).

const board = document.getElementById('board');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const modal = document.getElementById('resultModal');
const modalBody = document.getElementById('modalBody');
const restartBtn = document.getElementById('restartBtn');
const closeBtn = document.getElementById('closeBtn');

let totalCorrectRounds = 0;   // cuenta de rondas donde seleccionó 3/3
let totalRounds = 0;
let totalSeconds = 0;
let gameInterval = null;      // 1s ticker
let roundTimeout = null;      // 5s per round
let roundRunning = false;
let selectionsThisRound = 0;
let selectedCorrectThisRound = 0;
let currentXPositions = [];
let gameActive = false;
let roundDurationMs = 5000;   // 5 seconds
const distractors = ['Y','V','/','\\','O','x'];
const ROUND_STEP_MS = 5000;
const TOTAL_GAME_MS = 10 * 60 * 1000; // 10 minutes
const PHASE_MS = 3 * 60 * 1000; // 3 minutes per phase

// helpers for grid sizes by elapsed ms
function gridSizeForElapsed(msElapsed){
  const minutes = msElapsed / 60000;
  if (minutes < 3) return { cols: 5, rows: 4 };
  if (minutes < 6) return { cols: 6, rows: 5 };
  if (minutes < 9) return { cols: 7, rows: 6 };
  return { cols: 7, rows: 6 }; // final minute keep largest
}

// create a round
function startRound(){
  // prevent overlapping
  clearTimeout(roundTimeout);
  selectionsThisRound = 0;
  selectedCorrectThisRound = 0;
  currentXPositions = [];

  // determine current grid size based on totalSeconds
  const msElapsed = totalSeconds * 1000;
  const { cols, rows } = gridSizeForElapsed(msElapsed);
  renderGrid(cols, rows);

  roundRunning = true;
  // setup automatic end of round after 5s
  roundTimeout = setTimeout(() => {
    endRound();
  }, roundDurationMs);
}

function renderGrid(cols, rows){
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;
  board.style.gridTemplateRows = `repeat(${rows}, var(--cell-size))`;

  const total = cols * rows;
  // pick 3 distinct positions for X (dispersed)
  const positions = new Set();
  while (positions.size < 3){
    positions.add(Math.floor(Math.random() * total));
  }
  currentXPositions = Array.from(positions);

  // build cells
  for (let i=0;i<total;i++){
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;

    if (currentXPositions.includes(i)){
      cell.textContent = 'X';
      cell.dataset.correct = 'true';
    } else {
      cell.textContent = distractors[Math.floor(Math.random() * distractors.length)];
      cell.dataset.correct = 'false';
    }

    // fade-in effect small stagger
    cell.style.opacity = '0';
    board.appendChild(cell);
    setTimeout(()=>{ cell.style.transition = 'opacity .35s ease, transform .18s ease'; cell.style.opacity = '1'; }, Math.random()*250);

    // click handler
    cell.addEventListener('click', () => onCellClick(cell));
  }
}

function onCellClick(cell){
  if (!roundRunning || !gameActive) return;
  if (selectionsThisRound >= 3) return;
  if (cell.classList.contains('selected')) return;

  selectionsThisRound++;
  cell.classList.add('selected');

  if (cell.dataset.correct === 'true'){
    cell.classList.add('correct');
    selectedCorrectThisRound++;
  } else {
    cell.classList.add('wrong');
  }

  // If user has used 3 clicks, evaluate short after brief feedback
  if (selectionsThisRound >= 3){
    clearTimeout(roundTimeout);
    setTimeout(()=> endRound(), 650);
  }
}

function endRound(){
  roundRunning = false;
  totalRounds++;

  // Only count this round as successful if selectedCorrectThisRound === 3
  if (selectedCorrectThisRound === 3){
    totalCorrectRounds++;
  }

  // proceed to next round unless total time exceeded
  if (!gameActive) return;

  // check if total game time reached
  if (totalSeconds * 1000 >= TOTAL_GAME_MS){
    finishGame();
    return;
  }

  // start next round immediately
  startRound();
}

// main game timer: ticks every second to track totalSeconds
function startGame(){
  if (gameActive) return;
  gameActive = true;
  totalCorrectRounds = 0;
  totalRounds = 0;
  totalSeconds = 0;

  startBtn.disabled = true;
  stopBtn.style.display = 'inline-block';

  // start first round immediately
  startRound();

  // tick every second
  gameInterval = setInterval(()=>{
    totalSeconds++;
    // if game total time reached -> finish
    if (totalSeconds * 1000 >= TOTAL_GAME_MS){
      clearInterval(gameInterval);
      // ensure round timeout cleared and end current round
      clearTimeout(roundTimeout);
      roundRunning = false;
      finishGame();
    }
  }, 1000);

  // ESC handling to stop early
  window.addEventListener('keydown', escHandler);
}

// stop/finish handlers
function escHandler(e){
  if (e.code === 'Escape'){
    // stop early and show final results
    if (gameActive){
      clearInterval(gameInterval);
      clearTimeout(roundTimeout);
      roundRunning = false;
      finishGame(true);
    }
  }
}

function finishGame(manual=false){
  gameActive = false;
  roundRunning = false;
  clearInterval(gameInterval);
  clearTimeout(roundTimeout);
  startBtn.disabled = false;
  stopBtn.style.display = 'none';
  window.removeEventListener('keydown', escHandler);

  // compute level from totalCorrectRounds (these thresholds can be adjusted)
  let level = 'Bajo';
  if (totalCorrectRounds >= 40) level = 'Alto';
  else if (totalCorrectRounds >= 20) level = 'Medio';

  // show modal with results (single modal at the end)
  const minutesRan = Math.floor(totalSeconds / 60);
  modalBody.innerHTML = `
    <p><strong>Tiempo jugado:</strong> ${minutesRan} min ${totalSeconds % 60} s ${manual ? '(detenido manualmente)' : ''}</p>
    <p><strong>Rondas totales jugadas:</strong> ${totalRounds}</p>
    <p><strong>Rondas con 3/3 aciertos:</strong> ${totalCorrectRounds}</p>
    <p><strong>Nivel de atención:</strong> ${level}</p>
    <hr>
    <p style="margin:0;color:#555;font-size:13px;">Nota: se cuentan únicamente las rondas en las que el usuario seleccionó las 3 X correctamente (3 de 3).</p>
  `;
  modal.setAttribute('aria-hidden','false');
}

// UI button wiring
startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', ()=>{
  if (gameActive){
    clearInterval(gameInterval);
    clearTimeout(roundTimeout);
    roundRunning = false;
    finishGame(true);
  }
});
closeBtn.addEventListener('click', ()=>{
  modal.setAttribute('aria-hidden','true');
});
restartBtn.addEventListener('click', ()=>{
  modal.setAttribute('aria-hidden','true');
  // reset and restart
  totalCorrectRounds = 0;
  totalRounds = 0;
  totalSeconds = 0;
  startGame();
});

// ensure stop button initially hidden
stopBtn.style.display = 'none';
