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
  var isHardMode = false;
  var roundTimer = null;

  function startGame() {
    startScreen.hidden = true; // Hide start screen
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

    var maxOp = isHardMode ? 4 : 2; 
    var op = Math.floor(Math.random() * maxOp);
    var a, b, symbol;

    if (op === 0) {
      var maxAdd = isHardMode ? 20 : 10;
      a = Math.floor(Math.random() * maxAdd) + 1;
      b = Math.floor(Math.random() * maxAdd) + 1;
      symbol = ' + ';
      currentAnswer = a + b;
    } else if (op === 1) {
      var maxSub = isHardMode ? 20 : 10;
      a = Math.floor(Math.random() * maxSub) + 1;
      b = Math.floor(Math.random() * maxSub) + 1;
      symbol = ' - ';
      currentAnswer = a - b;
    } else if (op === 2) {
      var maxMult = 9; 
      a = Math.floor(Math.random() * (maxMult - 1)) + 2;
      b = Math.floor(Math.random() * (maxMult - 1)) + 2;
      symbol = ' × ';
      currentAnswer = a * b;
    } else {
      b = Math.floor(Math.random() * 8) + 2;
      currentAnswer = Math.floor(Math.random() * 8) + 2;
      a = b * currentAnswer; 
      symbol = ' ÷ ';
    }

    eqEl.textContent = a + symbol + b + ' = ?';

    var options = [currentAnswer];
    while (options.length < 3) {
      var offset = (Math.floor(Math.random() * 10) - 5) || 1; 
      var wrong = currentAnswer + offset;
      if (wrong !== currentAnswer && options.indexOf(wrong) === -1) {
        options.push(wrong);
      }
    }
    options.sort(function() { return 0.5 - Math.random(); });

    options.forEach(function(num, index) {
      setTimeout(function() {
        if (gameActive) spawnMeteor(num);
      }, index * 200); 
    });
  }

  function spawnMeteor(num) {
    var el = document.createElement('div');
    el.className = 'meteor';
    el.textContent = num;
    var startLeft = Math.random() * 70 + 15; 
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
      startScreen.hidden = false; // Show start screen again
      startBtn.textContent = 'Play Again';
    }
  }

  modeBtn.addEventListener('click', function() {
    isHardMode = !isHardMode;
    if (isHardMode) {
      modeBtn.textContent = 'Mode: Hard (All 4)';
      modeBtn.style.background = '#FFC93C'; 
    } else {
      modeBtn.textContent = 'Mode: Easy (Add/Sub)';
      modeBtn.style.background = 'var(--white)';
    }
    startGame(); 
  });

  restartBtn.addEventListener('click', startGame);
  startBtn.addEventListener('click', startGame);

  // Show start screen initially, don't start automatically
})();