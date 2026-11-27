(function () {
  var area = document.getElementById('catch-area');
  var basket = document.getElementById('basket');
  var msgEl = document.getElementById('msg');
  var scoreEl = document.getElementById('score');
  var livesEl = document.getElementById('lives');
  var countryEl = document.getElementById('country');
  var restartBtn = document.getElementById('restart');
  var modeBtn = document.getElementById('mode-toggle');
  var startBtn = document.getElementById('start-btn');
  var startScreen = document.getElementById('start-screen');

  var data = [
    { c: 'France', cap: 'Paris', wrong: ['London', 'Rome'] },
    { c: 'Japan', cap: 'Tokyo', wrong: ['Beijing', 'Seoul'] },
    { c: 'Australia', cap: 'Canberra', wrong: ['Sydney', 'Melbourne'] },
    { c: 'Canada', cap: 'Ottawa', wrong: ['Toronto', 'Vancouver'] },
    { c: 'Brazil', cap: 'Brasília', wrong: ['Rio', 'São Paulo'] },
    { c: 'Egypt', cap: 'Cairo', wrong: ['Alexandria', 'Giza'] }
  ];

  var score = 0, lives = 3, gameActive = false;
  var basketX = 50, targetX = 50; 
  var currentTarget = null;
  var spawnTimer;
  var isHardMode = false;

  function updateBasket() {
    if (gameActive) {
      basketX += (targetX - basketX) * 0.2; 
      basket.style.left = basketX + '%';
    }
    requestAnimationFrame(updateBasket);
  }
  requestAnimationFrame(updateBasket);

  // Mouse move (Desktop)
  area.addEventListener('mousemove', function(e) {
    if (!gameActive) return;
    var rect = area.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width) * 100;
    if (x < 5) x = 5;
    if (x > 95) x = 95;
    targetX = x;
  });

  // Touch move (Mobile)
  area.addEventListener('touchmove', function(e) {
    if (!gameActive) return;
    e.preventDefault(); // Stops the screen from scrolling
    var rect = area.getBoundingClientRect();
    var touch = e.touches[0]; // Get the first finger
    var x = ((touch.clientX - rect.left) / rect.width) * 100;
    if (x < 5) x = 5;
    if (x > 95) x = 95;
    targetX = x;
  }, { passive: false }); // Required for preventDefault to work

  window.addEventListener('keydown', function(e) {
    if (!gameActive) return;
    if (e.key === 'ArrowLeft') { targetX -= 5; if (targetX < 5) targetX = 5; }
    if (e.key === 'ArrowRight') { targetX += 5; if (targetX > 95) targetX = 95; }
  });

  function setNewTarget() {
    var target = data[Math.floor(Math.random() * data.length)];
    currentTarget = target;
    countryEl.textContent = target.c;
  }

  function spawnCity() {
    if (!gameActive) return;
    
    var isCorrect = Math.random() > 0.5;
    var text = isCorrect ? currentTarget.cap : currentTarget.wrong[Math.floor(Math.random() * currentTarget.wrong.length)];
    
    var el = document.createElement('div');
    el.className = 'falling-city';
    el.textContent = text;
    el.style.left = (Math.random() * 80 + 10) + '%';
    el.style.top = '-30px';
    
    var speed = Math.random() * 1 + (isHardMode ? 1.8 : 2.5); 
    el.style.animation = 'drop ' + speed + 's linear forwards';
    area.appendChild(el);

    var hasHit = false;

    var checkHit = setInterval(function() {
      if (!el.parentNode || hasHit) { clearInterval(checkHit); return; }
      var rect1 = el.getBoundingClientRect();
      var rect2 = basket.getBoundingClientRect();
      
      var fLeft = rect1.left + 10;
      var fRight = rect1.right - 10;
      var bLeft = rect2.left + 15;
      var bRight = rect2.right - 15;
      
      if (rect1.bottom >= rect2.top + 10 && rect1.top <= rect2.bottom && fLeft < bRight && fRight > bLeft) {
        hasHit = true;
        clearInterval(checkHit);
        el.remove();
        
        if (text === currentTarget.cap) {
          score += 10;
          scoreEl.textContent = score;
          msgEl.textContent = '✅ Correct! +10 points';
          msgEl.style.color = '#7FD6A4';
          setNewTarget();

          if (!isHardMode) {
            clearInterval(spawnTimer);
            area.querySelectorAll('.falling-city').forEach(function(city) { city.remove(); });
            setTimeout(function() {
              if(gameActive) spawnTimer = setInterval(spawnCity, 1200);
            }, 1000);
          }
        } else {
          lives--;
          livesEl.textContent = lives;
          msgEl.textContent = '❌ Wrong city! -1 Life';
          msgEl.style.color = '#FF5A64';
          checkGameOver();
        }
      }
    }, 30);

    setTimeout(function() {
      if (el.parentNode && !hasHit) {
        el.remove();
        clearInterval(checkHit);
        if (text === currentTarget.cap) {
          lives--;
          livesEl.textContent = lives;
          msgEl.textContent = '❌ Missed the capital! -1 Life';
          msgEl.style.color = '#FF5A64';
          checkGameOver();
        }
      }
    }, speed * 1000);
  }

  function checkGameOver() {
    if (lives <= 0) {
      gameActive = false;
      clearInterval(spawnTimer);
      msgEl.textContent = 'Game Over! Final Score: ' + score;
      msgEl.style.color = '#D81F2A';
      area.querySelectorAll('.falling-city').forEach(function(e) { e.remove(); });
      startScreen.hidden = false;
      startBtn.textContent = 'Play Again';
    }
  }

  function startGame() {
    startScreen.hidden = true;
    score = 0; lives = 3; gameActive = true; basketX = 50; targetX = 50;
    scoreEl.textContent = score; livesEl.textContent = lives;
    msgEl.textContent = isHardMode ? 'CHAOS MODE: Target changes instantly!' : 'Catch the right city!';
    msgEl.style.color = isHardMode ? '#FF5A64' : '';
    basket.style.left = '50%';
    area.querySelectorAll('.falling-city').forEach(function(e) { e.remove(); });
    
    setNewTarget();
    if (spawnTimer) clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnCity, isHardMode ? 800 : 1200);
  }

  modeBtn.addEventListener('click', function() {
    isHardMode = !isHardMode;
    if (isHardMode) {
      modeBtn.textContent = 'Mode: Chaos';
      modeBtn.style.background = '#FFC93C';
    } else {
      modeBtn.textContent = 'Mode: Normal';
      modeBtn.style.background = 'var(--white)';
    }
    startGame(); 
  });

  restartBtn.addEventListener('click', startGame);
  startBtn.addEventListener('click', startGame);
})();