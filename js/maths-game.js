(function () {
  var area = document.getElementById('meteor-area');
  var eqEl = document.getElementById('equation');
  var msgEl = document.getElementById('msg');
  var scoreEl = document.getElementById('score');
  var hpEl = document.getElementById('hp');
  var restartBtn = document.getElementById('restart');
  var modeBtn = document.getElementById('mode-toggle');
  var startBtn = document.getElementById('start-btn');
  var startScreen = document.getElementById('start-screen');

  var score = 0, hp = 100, currentAnswer = 0, gameActive = false;
  var gameMode = 0; // 0 = Easy, 1 = Hard, 2 = Chaos
  var roundTimer = null;

  function startGame() {
    startScreen.hidden = true;
    score = 0; hp = 100; gameActive = true;
    scoreEl.textContent = score; hpEl.textContent = hp; hpEl.style.color = '#7FD6A4';
    area.querySelectorAll('.meteor').forEach(function(m) { m.remove(); });
    if (roundTimer) clearTimeout(roundTimer);
    nextRound();
  }

  function nextRound() {
    if (!gameActive) return;
    area.querySelectorAll('.meteor').forEach(function(m) { m.remove(); });
    msgEl.textContent = 'Click the correct asteroid!';
    msgEl.style.color = '';

    var a, b, c, symbol1, symbol2;

    if (gameMode === 0) {
      // EASY MODE (2-step: + or -)
      var maxAdd = 10;
      a = Math.floor(Math.random() * maxAdd) + 1;
      b = Math.floor(Math.random() * maxAdd) + 1;
      var isPlus = Math.random() > 0.5;
      symbol1 = isPlus ? ' + ' : ' - ';
      currentAnswer = isPlus ? a + b : a - b;
      eqEl.textContent = a + symbol1 + b + ' = ?';
      
    } else if (gameMode === 1) {
      // HARD MODE (2-step: +, -, ×, ÷)
      var op = Math.floor(Math.random() * 4);
      if (op === 0) {
        a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1;
        symbol1 = ' + '; currentAnswer = a + b;
      } else if (op === 1) {
        a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1;
        symbol1 = ' - '; currentAnswer = a - b;
      } else if (op === 2) {
        a = Math.floor(Math.random() * 8) + 2; b = Math.floor(Math.random() * 8) + 2;
        symbol1 = ' × '; currentAnswer = a * b;
      } else {
        b = Math.floor(Math.random() * 8) + 2; currentAnswer = Math.floor(Math.random() * 8) + 2;
        a = b * currentAnswer; symbol1 = ' ÷ ';
      }
      eqEl.textContent = a + symbol1 + b + ' = ?';

    } else {
      // CHAOS MODE (3-step: e.g., 3 + 4 - 2, 3 × 4 ÷ 6)
      var pattern = Math.floor(Math.random() * 4); // Pick a random equation pattern
      
      if (pattern === 0) {
        // a + b + c
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        c = Math.floor(Math.random() * 10) + 1;
        eqEl.textContent = a + ' + ' + b + ' + ' + c + ' = ?';
        currentAnswer = a + b + c;
      } 
      else if (pattern === 1) {
        // a × b + c
        a = Math.floor(Math.random() * 6) + 2;
        b = Math.floor(Math.random() * 6) + 2;
        c = Math.floor(Math.random() * 10) + 1;
        eqEl.textContent = a + ' × ' + b + ' + ' + c + ' = ?';
        currentAnswer = (a * b) + c;
      }
      else if (pattern === 2) {
        // a × b ÷ c (Ensure c is a factor of a*b for whole numbers)
        a = Math.floor(Math.random() * 5) + 2;
        b = Math.floor(Math.random() * 5) + 2;
        var product = a * b;
        var factors = [];
        for (var i = 2; i <= product / 2; i++) {
          if (product % i === 0) factors.push(i);
        }
        if (factors.length > 0) {
          c = factors[Math.floor(Math.random() * factors.length)];
        } else {
          c = 2; a = 4; // Fallback
        }
        eqEl.textContent = a + ' × ' + b + ' ÷ ' + c + ' = ?';
        currentAnswer = (a * b) / c;
      }
      else {
        // a ÷ b × c (Ensure a is a multiple of b)
        b = Math.floor(Math.random() * 5) + 2;
        currentAnswer = Math.floor(Math.random() * 5) + 2;
        c = Math.floor(Math.random() * 5) + 2;
        a = b * currentAnswer; 
        eqEl.textContent = a + ' ÷ ' + b + ' × ' + c + ' = ?';
        currentAnswer = currentAnswer * c;
      }
    }

    // Create 3 options (1 correct, 2 wrong)
    var options = [currentAnswer];
    while (options.length < 3) {
      var offset = (Math.floor(Math.random() * 15) - 7) || 1; // Wider offset range for higher numbers
      var wrong = currentAnswer + offset;
      
      if (wrong !== currentAnswer && options.indexOf(wrong) === -1) {
        options.push(wrong);
      }
    }
    options.sort(function() { return 0.5 - Math.random(); });

    var zones = [
      Math.random() * 15 + 10, 
      Math.random() * 20 + 40, 
      Math.random() * 15 + 70  
    ];
    zones.sort(function() { return 0.5 - Math.random(); });

    options.forEach(function(num, index) {
      setTimeout(function() {
        if (gameActive) spawnMeteor(num, zones[index]);
      }, index * 200); 
    });
  }

  function spawnMeteor(num, startLeft) {
    var el = document.createElement('div');
    el.className = 'meteor';
    el.textContent = num;
    
    var fallDuration = Math.random() * 1 + 2.5; 
    
    el.style.left = startLeft + '%';
    el.style.top = '-60px';
    el.style.animation = 'fall ' + fallDuration + 's linear forwards';
    var isHit = false;

    el.addEventListener('click', function () {
      if (!gameActive || isHit) return;
      isHit = true;
      
      if (num === currentAnswer) {
        score += 10;
        scoreEl.textContent = score;
        msgEl.textContent = '💥 Direct hit!';
        msgEl.style.color = '#7FD6A4';
        el.remove();
        
        area.querySelectorAll('.meteor').forEach(function(m) { 
            m.style.animationPlayState = 'paused'; 
            m.style.pointerEvents = 'none';
        });
        roundTimer = setTimeout(nextRound, 800);
      } else {
        takeDamage(15, 'Wrong asteroid! -15 HP');
        el.remove();
      }
    });

    area.appendChild(el);

    setTimeout(function () {
      if (el.parentNode && gameActive && !isHit) {
        el.remove();
        if (num === currentAnswer) {
          takeDamage(20, 'The correct answer hit the ship! -20 HP');
          area.querySelectorAll('.meteor').forEach(function(m) { 
              m.style.animationPlayState = 'paused'; 
              m.style.pointerEvents = 'none';
          });
          roundTimer = setTimeout(nextRound, 800);
        }
      }
    }, fallDuration * 1000);
  }

  function takeDamage(amount, text) {
    hp -= amount;
    hpEl.textContent = hp;
    msgEl.textContent = text;
    msgEl.style.color = '#FF5A64';
    if (hp <= 0) {
      gameActive = false;
      eqEl.textContent = 'GAME OVER';
      msgEl.textContent = 'Your ship was destroyed! Final Score: ' + score;
      area.querySelectorAll('.meteor').forEach(function(m) { m.remove(); });
      startScreen.hidden = false; 
      startBtn.textContent = 'Play Again';
    }
  }

  // --- 3-STAGE MODE TOGGLE LOGIC ---
  modeBtn.addEventListener('click', function() {
    gameMode = (gameMode + 1) % 3; // Cycles 0 -> 1 -> 2 -> 0
    
    if (gameMode === 0) {
      modeBtn.textContent = 'Mode: Easy';
      modeBtn.style.background = 'var(--white)';
      modeBtn.style.color = 'var(--navy)';
    } else if (gameMode === 1) {
      modeBtn.textContent = 'Mode: Hard';
      modeBtn.style.background = '#FFC93C';
      modeBtn.style.color = 'var(--navy)';
    } else {
      modeBtn.textContent = 'Mode: CHAOS';
      modeBtn.style.background = '#FF5A64'; // Red
      modeBtn.style.color = 'var(--white)';
    }
    startGame(); 
  });

  restartBtn.addEventListener('click', startGame);
  startBtn.addEventListener('click', startGame);

})();