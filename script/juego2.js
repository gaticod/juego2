const state = {
      running: false,
      paused: false,
      soundEnabled: true,
      round: 0,
      score: 0,
      timeLeft: 600,
      totalAttempts: 0,
      selections: 0,
      maxSelections: 3,
      targetLetter: 'X',
      correctPositions: [],
      timer: null,
      correctSelections: 0,
      wrongSelections: 0,
      totalRoundsCompleted: 0
    };

    const els = {
      board: document.getElementById('board'),
      startBtn: document.getElementById('startBtn'),
      stopBtn: document.getElementById('stopBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      timerEl: document.getElementById('timer'),
      roundEl: document.getElementById('round'),
      scoreEl: document.getElementById('score'),
      attemptsEl: document.getElementById('attempts'),
      message: document.getElementById('message'),
      pauseModal: document.getElementById('pauseModal'),
      finalModal: document.getElementById('finalModal')
    };

    function getGridSize() {
      if (state.timeLeft > 420) { // 0-3 minutos (600-420 seg)
        return { rows: 4, cols: 5, class: 'grid-4x5' };
      } else if (state.timeLeft > 240) { // 3-6 minutos (420-240 seg)
        return { rows: 6, cols: 5, class: 'grid-6x5' };
      } else { // 6-10 minutos (240-0 seg)
        return { rows: 7, cols: 6, class: 'grid-7x6' };
      }
    }

    function startGame() {
      state.running = true;
      state.paused = false;
      state.round = 0;
      state.score = 0;
      state.timeLeft = 600;
      state.correctSelections = 0;
      state.wrongSelections = 0;
      state.totalRoundsCompleted = 0;
      
      els.startBtn.disabled = true;
      els.stopBtn.disabled = false;
      els.pauseBtn.disabled = false;
      
      updateDisplay();
      startRound();
      startTimer();
      
      showMessage('¡Juego iniciado! 🎮 ¡Encuentra las X!', 'info');
    }

    function stopGame() {
      state.running = false;
      state.paused = false;
      clearInterval(state.timer);
      
      showFinalModal();
      
      els.startBtn.disabled = false;
      els.stopBtn.disabled = true;
      els.pauseBtn.disabled = true;
      els.board.innerHTML = '';
    }

    function togglePause() {
      if (!state.running) return;
      
      state.paused = !state.paused;
      els.pauseBtn.textContent = state.paused ? '▶️' : '⏸️';
      
      if (state.paused) {
        clearInterval(state.timer);
        showPauseModal();
      } else {
        startTimer();
        els.pauseModal.classList.remove('active');
      }
    }

    function showPauseModal() {
      const mins = Math.floor(state.timeLeft / 60);
      const secs = state.timeLeft % 60;
      document.getElementById('pauseTime').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      document.getElementById('pauseScore').textContent = state.score;
      document.getElementById('pauseRound').textContent = state.round;
      els.pauseModal.classList.add('active');
    }

    function quitFromPause() {
      els.pauseModal.classList.remove('active');
      stopGame();
    }

    function showFinalModal() {
      const totalSelections = state.correctSelections + state.wrongSelections;
      const accuracy = totalSelections > 0 ? Math.round((state.correctSelections / totalSelections) * 100) : 0;
      
      document.getElementById('finalScore').textContent = state.score;
      document.getElementById('finalRounds').textContent = state.totalRoundsCompleted;
      document.getElementById('finalCorrect').textContent = state.correctSelections;
      document.getElementById('finalWrong').textContent = state.wrongSelections;
      document.getElementById('finalAttempts').textContent = state.totalAttempts;
      document.getElementById('finalAccuracy').textContent = accuracy + '%';
      
      els.finalModal.classList.add('active');
    }

    function closeFinalModal() {
      els.finalModal.classList.remove('active');
    }

    function restartGame() {
      els.finalModal.classList.remove('active');
      state.totalAttempts++;
      updateDisplay();
      startGame();
    }

    function startRound() {
      state.round++;
      state.selections = 0;
      state.correctPositions = [];
      
      const grid = getGridSize();
      const gridSize = grid.rows * grid.cols;
      const numTargets = 3;
      
      // Generar exactamente 3 posiciones para X
      while (state.correctPositions.length < numTargets) {
        const pos = Math.floor(Math.random() * gridSize);
        if (!state.correctPositions.includes(pos)) {
          state.correctPositions.push(pos);
        }
      }
      
      // Crear tablero
      els.board.innerHTML = '';
      els.board.className = `board ${grid.class}`;
      
      const distractors = ['Y', 'V', '/'];
      
      for (let i = 0; i < gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        
        if (state.correctPositions.includes(i)) {
          cell.textContent = state.targetLetter;
        } else {
          cell.textContent = distractors[Math.floor(Math.random() * distractors.length)];
        }
        
        cell.addEventListener('click', () => handleCellClick(i, cell));
        els.board.appendChild(cell);
      }
      
      updateDisplay();
    }

    function handleCellClick(index, cell) {
      if (!state.running || state.paused || cell.classList.contains('correct') || cell.classList.contains('wrong')) return;
      if (state.selections >= state.maxSelections) return;
      
      state.selections++;
      cell.classList.add('selected');
      
      if (state.correctPositions.includes(index)) {
        setTimeout(() => {
          cell.classList.remove('selected');
          cell.classList.add('correct');
          state.score += 10;
          state.correctSelections++;
          playSound('correct');
          updateDisplay();
          
          // Verificar si completó la ronda
          const correctCells = document.querySelectorAll('.cell.correct').length;
          if (correctCells === state.correctPositions.length) {
            state.totalRoundsCompleted++;
            setTimeout(() => {
              showMessage('¡Ronda completada! 🎉 ¡Excelente trabajo!', 'success');
              setTimeout(startRound, 1800);
            }, 500);
          }
        }, 300);
      } else {
        setTimeout(() => {
          cell.classList.remove('selected');
          cell.classList.add('wrong');
          state.wrongSelections++;
          playSound('wrong');
          
          if (state.selections >= state.maxSelections) {
            showMessage('Se acabaron los intentos. Nueva ronda... 😅', 'error');
            setTimeout(startRound, 2200);
          }
        }, 300);
      }
    }

    function startTimer() {
      clearInterval(state.timer);
      state.timer = setInterval(() => {
        if (!state.paused && state.running) {
          state.timeLeft--;
          updateDisplay();
          
          // Verificar cambio de nivel
          if (state.timeLeft === 420 || state.timeLeft === 240) {
            showMessage('🆙 ¡Nivel aumentado! El tablero es más grande ahora.', 'info');
            setTimeout(startRound, 1500);
          }
          
          if (state.timeLeft <= 0) {
            stopGame();
          }
        }
      }, 1000);
    }

    function updateDisplay() {
      const mins = Math.floor(state.timeLeft / 60);
      const secs = state.timeLeft % 60;
      els.timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      els.roundEl.textContent = state.round;
      els.scoreEl.textContent = state.score;
      els.attemptsEl.textContent = state.totalAttempts;
    }

    function showMessage(text, type) {
      els.message.textContent = text;
      els.message.className = `message ${type}`;
      setTimeout(() => {
        els.message.textContent = '';
        els.message.className = 'message';
      }, 3000);
    }

    function playSound(type) {
      if (!state.soundEnabled) return;
      // Aquí se podrían agregar sonidos reales
      console.log(`Sound: ${type}`);
    }

    function toggleSound() {
      state.soundEnabled = !state.soundEnabled;
      document.getElementById('soundBtn').textContent = state.soundEnabled ? '🔊' : '🔇';
      showMessage(state.soundEnabled ? '🔊 Sonido activado' : '🔇 Sonido desactivado', 'info');
    }

    function goBack() {
      if (state.running) {
        if (confirm('¿Deseas salir del juego? Se perderá tu progreso.')) {
          stopGame();
        }
      } else {
        if (confirm('¿Deseas salir?')) {
          closeFinalModal();
        }
      }
    }

    function showHelp() {
      alert('🎯 CÓMO JUGAR:\n\n1. Presiona "Iniciar Juego"\n2. Encuentra las 3 letras X en el tablero\n3. Tienes 3 intentos por ronda\n4. Ganas 10 puntos por cada X correcta\n5. El tablero crece cada 3 minutos\n\n📊 NIVELES:\n• 0-3 min: Tablero 4×5 (20 celdas)\n• 3-6 min: Tablero 6×5 (30 celdas)\n• 6-10 min: Tablero 7×6 (42 celdas)\n\n💡 CONSEJOS:\n• Las letras Y, V y / se parecen a X\n• Concéntrate y toma tu tiempo\n• Usa el botón de pausa si necesitas descansar\n\n¡Buena suerte! 🍀');
    }

    // Event listeners
    els.startBtn.addEventListener('click', () => {
      state.totalAttempts++;
      updateDisplay();
      startGame();
    });
    
    els.stopBtn.addEventListener('click', stopGame);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.running) {
        if (state.paused) {
          quitFromPause();
        } else {
          stopGame();
        }
      }
    });

    // Cerrar modales al hacer clic fuera
    els.pauseModal.addEventListener('click', (e) => {
      if (e.target === els.pauseModal) {
        togglePause();
      }
    });

    els.finalModal.addEventListener('click', (e) => {
      if (e.target === els.finalModal) {
        closeFinalModal();
      }
    });