 // Estado del juego
    const gameState = {
      playing: false,
      paused: false,
      timeLeft: 120,
      coinsCollected: 0,
      planeX: 100,
      planeY: window.innerHeight / 2,
      planeSpeed: 6,
      coins: [],
      keys: {},
      adviceIndex: 0
    };

    // Consejos que irá mostrando
    const adviceMessages = [
      '¡Usa las flechas o WASD para moverte! 🎮',
      '¡Recoge todas las monedas que puedas! 💰',
      '¡Presiona ESC para pausar el juego! ⏸️',
      '¡Mantente alerta, las monedas vienen rápido! ⚡',
      '¡Tienes 2 minutos para recolectar monedas! ⏱️',
      '¡Muévete con precisión para no perder monedas! 🎯',
      '¡Cada moneda cuenta para tu puntuación! 🌟'
    ];

    // Elementos DOM
    const plane = document.getElementById('plane');
    const hud = document.getElementById('hud');
    const timeDisplay = document.getElementById('time');
    const coinsDisplay = document.getElementById('coins');
    const startScreen = document.getElementById('start-screen');
    const pauseMenu = document.getElementById('pause-menu');
    const endScreen = document.getElementById('end-screen');
    const finalCoinsDisplay = document.getElementById('final-coins');
    const gameContainer = document.getElementById('game-container');
    const advisorContainer = document.getElementById('advisor-container');
    const adviceText = document.getElementById('advice-text');

    // Botones
    const startButton = document.getElementById('start-button');
    const continueButton = document.getElementById('continue-button');
    const restartLevelButton = document.getElementById('restart-level-button');
    const backButton = document.getElementById('back-button');
    const restartButton = document.getElementById('restart');

    // Crear confeti decorativo
    function createConfetti() {
      for (let i = 0; i < 15; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 4 + 's';
        confetti.style.width = (Math.random() * 6 + 4) + 'px';
        confetti.style.height = (Math.random() * 6 + 4) + 'px';
        gameContainer.appendChild(confetti);
      }
    }
    createConfetti();

    // Rotar consejos del advisor
    function rotateAdvice() {
      setInterval(() => {
        if (!gameState.playing || gameState.paused) return;
        
        gameState.adviceIndex = (gameState.adviceIndex + 1) % adviceMessages.length;
        adviceText.textContent = adviceMessages[gameState.adviceIndex];
      }, 8000); // Cambiar consejo cada 8 segundos
    }

    // Crear monedas que vienen desde la derecha
    function createCoin() {
      const coin = document.createElement('div');
      coin.className = 'coin';
      
      // Posición inicial desde el borde derecho
      const randomY = Math.random() * (window.innerHeight - 120) + 60;
      coin.style.top = randomY + 'px';
      coin.style.right = '-70px';
      
      gameContainer.appendChild(coin);
      
      const coinData = {
        element: coin,
        x: window.innerWidth + 70,
        y: randomY,
        speed: 3 + Math.random() * 2,
        collected: false
      };
      
      gameState.coins.push(coinData);
      return coinData;
    }

    // Mover monedas de derecha a izquierda
    function moveCoins() {
      gameState.coins.forEach((coin, index) => {
        if (coin.collected) return;
        
        coin.x -= coin.speed;
        coin.element.style.right = (window.innerWidth - coin.x) + 'px';
        
        // Eliminar monedas que salieron de la pantalla
        if (coin.x < -70) {
          coin.element.remove();
          gameState.coins.splice(index, 1);
        }
      });
    }

    // Generador automático de monedas
    let coinGeneratorInterval;
    function startCoinGenerator() {
      coinGeneratorInterval = setInterval(() => {
        if (!gameState.playing || gameState.paused) return;
        createCoin();
      }, 1500); // Nueva moneda cada 1.5 segundos
    }

    function stopCoinGenerator() {
      if (coinGeneratorInterval) {
        clearInterval(coinGeneratorInterval);
      }
    }

    // Actualizar posición del avión
    function updatePlane() {
      plane.style.left = gameState.planeX + 'px';
      plane.style.top = gameState.planeY + 'px';
    }

    // Detectar colisiones con monedas
    function checkCoinCollisions() {
      const planeRect = {
        x: gameState.planeX,
        y: gameState.planeY - 40,
        width: 120,
        height: 80
      };

      gameState.coins.forEach((coin, index) => {
        if (coin.collected) return;

        const coinRect = {
          x: coin.x - 30,
          y: coin.y - 30,
          width: 60,
          height: 60
        };

        if (planeRect.x < coinRect.x + coinRect.width &&
            planeRect.x + planeRect.width > coinRect.x &&
            planeRect.y < coinRect.y + coinRect.height &&
            planeRect.y + planeRect.height > coinRect.y) {
          
          coin.collected = true;
          coin.element.classList.add('collected');
          gameState.coinsCollected++;
          coinsDisplay.textContent = gameState.coinsCollected;
          
          setTimeout(() => {
            coin.element.remove();
            gameState.coins.splice(index, 1);
          }, 500);
        }
      });
    }

    // Game loop
    function gameLoop() {
      if (!gameState.playing || gameState.paused) return;

      // Mover avión
      if (gameState.keys['ArrowUp'] || gameState.keys['w'] || gameState.keys['W']) {
        gameState.planeY = Math.max(60, gameState.planeY - gameState.planeSpeed);
      }
      if (gameState.keys['ArrowDown'] || gameState.keys['s'] || gameState.keys['S']) {
        gameState.planeY = Math.min(window.innerHeight - 60, gameState.planeY + gameState.planeSpeed);
      }
      if (gameState.keys['ArrowLeft'] || gameState.keys['a'] || gameState.keys['A']) {
        gameState.planeX = Math.max(60, gameState.planeX - gameState.planeSpeed);
      }
      if (gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) {
        gameState.planeX = Math.min(window.innerWidth - 60, gameState.planeX + gameState.planeSpeed);
      }

      updatePlane();
      moveCoins();
      checkCoinCollisions();
      requestAnimationFrame(gameLoop);
    }

    // Temporizador
    let timerInterval;
    function startTimer() {
      timerInterval = setInterval(() => {
        if (gameState.paused) return;
        
        gameState.timeLeft--;
        timeDisplay.textContent = gameState.timeLeft;

        if (gameState.timeLeft <= 0) {
          endGame();
        }
      }, 1000);
    }

    // Iniciar juego
    function startGame() {
      gameState.playing = true;
      gameState.paused = false;
      gameState.timeLeft = 120;
      gameState.coinsCollected = 0;
      gameState.planeX = 100;
      gameState.planeY = window.innerHeight / 2;
      gameState.adviceIndex = 0;

      timeDisplay.textContent = gameState.timeLeft;
      coinsDisplay.textContent = gameState.coinsCollected;
      adviceText.textContent = adviceMessages[0];

      startScreen.classList.add('hidden');
      hud.classList.add('visible');
      advisorContainer.classList.add('visible');
      
      updatePlane();
      startCoinGenerator();
      startTimer();
      rotateAdvice();
      gameLoop();
    }

    // Pausar juego
    function pauseGame() {
      gameState.paused = true;
      pauseMenu.classList.add('visible');
    }

    // Continuar juego
    function continueGame() {
      gameState.paused = false;
      pauseMenu.classList.remove('visible');
      gameLoop();
    }

    // Reiniciar nivel
    function restartLevel() {
      clearInterval(timerInterval);
      stopCoinGenerator();
      gameState.coins.forEach(coin => coin.element.remove());
      gameState.coins = [];
      pauseMenu.classList.remove('visible');
      startGame();
    }

    // Volver al inicio
    function backToStart() {
      clearInterval(timerInterval);
      stopCoinGenerator();
      gameState.playing = false;
      gameState.paused = false;
      gameState.coins.forEach(coin => coin.element.remove());
      gameState.coins = [];
      
      pauseMenu.classList.remove('visible');
      hud.classList.remove('visible');
      advisorContainer.classList.remove('visible');
      startScreen.classList.remove('hidden');
    }

    // Terminar juego
    function endGame() {
      clearInterval(timerInterval);
      stopCoinGenerator();
      gameState.playing = false;
      
      finalCoinsDisplay.textContent = gameState.coinsCollected;
      endScreen.classList.remove('hidden');
      endScreen.classList.add('visible');
      hud.classList.remove('visible');
      advisorContainer.classList.remove('visible');
    }

    // Eventos de teclado
    document.addEventListener('keydown', (e) => {
      gameState.keys[e.key] = true;

      if (e.key === 'Escape' && gameState.playing && !gameState.paused) {
        pauseGame();
      }
    });

    document.addEventListener('keyup', (e) => {
      gameState.keys[e.key] = false;
    });

    // Eventos de botones
    startButton.addEventListener('click', startGame);
    continueButton.addEventListener('click', continueGame);
    restartLevelButton.addEventListener('click', restartLevel);
    backButton.addEventListener('click', backToStart);
    restartButton.addEventListener('click', () => {
      endScreen.classList.remove('visible');
      endScreen.classList.add('hidden');
      restartLevel();
    });

    // Posicionar avión inicial en el lado izquierdo
    updatePlane();