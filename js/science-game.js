(function () {
  var area = document.getElementById('biome-area');
  var msgEl = document.getElementById('msg');
  var scoreEl = document.getElementById('score');
  var hpEl = document.getElementById('hp');
  var comboEl = document.getElementById('combo');
  var restartBtn = document.getElementById('restart');
  var modeBtn = document.getElementById('mode-toggle');
  var startBtn = document.getElementById('start-btn');
  var startScreen = document.getElementById('start-screen');
  var bins = document.querySelectorAll('.bin-btn');

  var animals = [
    { emoji: '🦉', bin: 'forest' }, { emoji: '🐻', bin: 'forest' }, 
    { emoji: '🦌', bin: 'forest' }, { emoji: '🍄', bin: 'forest' },
    { emoji: '🐪', bin: 'desert' }, { emoji: '🌵', bin: 'desert' }, 
    { emoji: '🦂', bin: 'desert' }, { emoji: '🦎', bin: 'desert' },
    { emoji: '🐬', bin: 'ocean' }, { emoji: '🐙', bin: 'ocean' }, 
    { emoji: '🦈', bin: 'ocean' }, { emoji: '🐠', bin: 'ocean' }
  ];

  var score = 0, hp = 100, combo = 1;
  var gameActive = false, currentItem = null;
  var spawnTimer = null, fallTimer = null;
  
  var fallSpeed = 3500; 
  var isHardMode = false;

  function startGame() {
    startScreen.hidden = true;
    score = 0; hp = 100; combo = 1; 
    fallSpeed = isHardMode ? 2000 : 3500; // Hard mode starts faster
    gameActive = true;
    
    scoreEl.textContent = score;
    hpEl.textContent = hp;
    hpEl.style.color = '#7FD6A4';
    comboEl.textContent = '1x';
    msgEl.textContent = isHardMode ? 'Speed round! Sort fast!' : 'Sort the animals!';
    msgEl.style.color = '';
    
    area.querySelectorAll('.biome-item').forEach(function(e) { e.remove(); });
    if (spawnTimer) clearTimeout(spawnTimer);
    if (fallTimer) clearTimeout(fallTimer);
    
    spawnItem();
  }

  function spawnItem() {
    if (!gameActive) return;

    var data = animals[Math.floor(Math.random() * animals.length)];
    
    var el = document.createElement('div');
    el.className = 'biome-item';
    el.textContent = data.emoji;
    
    el.style.left = (Math.random() * 70 + 15) + '%';
    el.style.top = '-80px';
    el.style.animation = 'fall-biome ' + (fallSpeed / 1000) + 's linear forwards';
    
    area.appendChild(el);
    currentItem = { el: el, bin: data.bin, hit: false };

    if (fallTimer) clearTimeout(fallTimer);
    fallTimer = setTimeout(function () {
      if (gameActive && !currentItem.hit) {
        currentItem.hit = true;
        currentItem.el.remove();
        combo = 1;
        comboEl.textContent = '1x';
        takeDamage(isHardMode ? 30 : 20, "It hit the ground! -HP");
        
        if (gameActive) spawnTimer = setTimeout(spawnItem, isHardMode ? 400 : 800);
      }
    }, fallSpeed);

    msgEl.textContent = 'Quick, sort it!';
  }

  bins.forEach(function (bin) {
    bin.addEventListener('click', function () {
      if (!gameActive || !currentItem || currentItem.hit) return;
      
      var chosenBin = this.getAttribute('data-bin');
      currentItem.hit = true;
      clearTimeout(fallTimer); 
      
      if (chosenBin === currentItem.bin) {
        this.classList.add('correct');
        setTimeout(function() { bin.classList.remove('correct'); }, 300);
        
        score += (10 * combo);
        scoreEl.textContent = score;
        combo = Math.min(combo + 1, 5);
        comboEl.textContent = combo + 'x';
        msgEl.textContent = '✅ Correct!';
        msgEl.style.color = '#7FD6A4';
        
        // Speed scaling
        var minSpeed = isHardMode ? 800 : 1500;
        if (fallSpeed > minSpeed) fallSpeed -= (isHardMode ? 200 : 150);
        
        currentItem.el.style.transform = 'scale(0)';
        setTimeout(function() { if(currentItem) currentItem.el.remove(); }, 150);
        
        spawnTimer = setTimeout(spawnItem, isHardMode ? 300 : 600);
        
      } else {
        this.classList.add('wrong');
        setTimeout(function() { bin.classList.remove('wrong'); }, 300);
        
        combo = 1;
        comboEl.textContent = '1x';
        takeDamage(isHardMode ? 25 : 15, "❌ Wrong biome! -HP");
        
        currentItem.el.style.transform = 'scale(0)';
        setTimeout(function() { if(currentItem) currentItem.el.remove(); }, 150);
        
        if (gameActive) spawnTimer = setTimeout(spawnItem, isHardMode ? 400 : 800);
      }
    });
  });

  function takeDamage(amount, text) {
    hp -= amount;
    hpEl.textContent = hp;
    hpEl.style.color = '#FF5A64';
    msgEl.textContent = text;
    msgEl.style.color = '#FF5A64';
    
    if (hp <= 0) {
      gameActive = false;
      area.querySelectorAll('.biome-item').forEach(function(e) { e.remove(); });
      msgEl.textContent = "💀 Ecosystem collapsed! Final Score: " + score;
      msgEl.style.color = '#D81F2A';
      comboEl.textContent = '0x';
      
      startScreen.hidden = false;
      startBtn.textContent = 'Try Again';
    }
  }

  modeBtn.addEventListener('click', function() {
    isHardMode = !isHardMode;
    if (isHardMode) {
      modeBtn.textContent = 'Mode: Hard';
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