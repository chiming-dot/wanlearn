(function () {
  var WORDS = (window.WL_WORDS || 'cat car can cap rat ran rap art are ate eat tea ten net nut sun run rub bus bun sit sat set seat east rest tear near earn lane line lone mine nine pine pin tin tip top pot pet pen pan pat tap ant and end den sand land hand band bend send tend mend lend wind find mind kind bind rind pint tint mint hint lint star tars rats arts tree free reed seed need feed deed read lead bead head dead road load toad goat boat coat moat note vote tone bone cone zone stone store snore score core more bore sore tore rose nose hose pose dose lose nest vest west best test pest list mist fist gist sing ring king wing sting bring brine drain train brain grain stain plain place plane plant slant scan span spin skin grin thin then than that this with sent tent rent dent vent went bent lent cent dear fear hear year bear pear gear rear sea see bee fee tee toe doe roe woe red bed led fed wed shed sled slid slide side tide ride hide wide bite kite site mite rite rate late mate gate hate date fate').toUpperCase().split(' ');
  var DICT = {};
  WORDS.forEach(function (w) { DICT[w] = true; });

  var LETTERS = 'EEEEEEEAAAAAIIIIOOOUUTTTTTRRRRNNNNSSSSLLLDDGBCMPFHVWYK';
  var SIZE = 16;
  var LEVELS = [
    { name: 'Dusty Cellar', foes: [
      { n: 'Dust Bunny', hp: 24, atk: 4, c: '#9AA5B1' },
      { n: 'Cave Bat', hp: 36, atk: 6, c: '#7B4FBF' } ] },
    { name: 'Goblin Halls', foes: [
      { n: 'Grumpy Goblin', hp: 48, atk: 8, c: '#2E9B57' },
      { n: 'Rock Troll', hp: 64, atk: 10, c: '#B45F00' } ] },
    { name: "Dragon's Lair", foes: [
      { n: 'Fire Imp', hp: 80, atk: 12, c: '#D81F2A' },
      { n: 'Dungeon Dragon', hp: 110, atk: 14, c: '#1E88D8' } ] }
  ];
  var HEROES = [
    { src: 'assets/mascot.svg', n: '[Character A name]' },
    { src: 'assets/mascot2.svg', n: '[Character B name]' }
  ];
  var HERO_MAX = 100;
  var PUNISH = 2;

  var board = [], path = [], tiles = [], score = 0, recent = [];
  var lvl = 0, idx = 0, heroHp = HERO_MAX, foeHp = 0, foe = null, busy = true, onContinue = null;

  function $(id) { return document.getElementById(id); }
  var wordEl = $('word'), msgEl = $('msg'), foundEl = $('found'), overlay = $('overlay');

  try {
    var n = localStorage.getItem('wlName');
    if (n) { $('nick').textContent = n; }
  } catch (e) {}

  function randLetter() { return LETTERS.charAt(Math.floor(Math.random() * LETTERS.length)); }
  function currentWord() { return path.map(function (i) { return board[i]; }).join(''); }
  function msg(t) { msgEl.textContent = t; }

  function countWords() {
    var have = [], i, c = 0;
    for (i = 0; i < 26; i++) { have.push(0); }
    board.forEach(function (l) { have[l.charCodeAt(0) - 65]++; });
    for (var k = 0; k < WORDS.length; k++) {
      var w = WORDS[k], tmp = have.slice(), ok = true;
      for (i = 0; i < w.length; i++) {
        if (--tmp[w.charCodeAt(i) - 65] < 0) { ok = false; break; }
      }
      if (ok) { c++; }
    }
    return c;
  }

  function newBoard() {
    var tries = 0, count = 0;
    do {
      board = [];
      for (var i = 0; i < SIZE; i++) { board.push(randLetter()); }
      count = countWords();
      tries++;
    } while (count < 25 && tries < 40);
    $('hidden').textContent = count;
    path = [];
    paint();
  }

  function refillUsed() {
    var tries = 0, count = 0;
    do {
      path.forEach(function (i) { board[i] = randLetter(); });
      count = countWords();
      tries++;
    } while (count < 15 && tries < 40);
    $('hidden').textContent = count;
    path = [];
  }

  function buildTiles() {
    var el = $('board');
    el.innerHTML = '';
    for (var i = 0; i < SIZE; i++) {
      (function (i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'tile';
        b.addEventListener('click', function () { toggle(i); });
        el.appendChild(b);
        tiles.push(b);
      })(i);
    }
  }

  function paint() {
    tiles.forEach(function (b, i) {
      b.textContent = board[i];
      b.setAttribute('aria-pressed', path.indexOf(i) !== -1 ? 'true' : 'false');
    });
    wordEl.textContent = currentWord() || 'Pick letters';
  }

  function toggle(i) {
    if (busy) { return; }
    var at = path.indexOf(i);
    if (at === -1) { path.push(i); } else { path.splice(at, 1); }
    msg('');
    paint();
  }

  function typeLetter(ch) {
    for (var i = 0; i < SIZE; i++) {
      if (board[i] === ch && path.indexOf(i) === -1) { path.push(i); msg(''); paint(); return; }
    }
  }

  function setBar(fill, bar, value, max) {
    $(fill).style.width = (Math.max(0, value) / max * 100) + '%';
    $(bar).setAttribute('aria-valuenow', Math.max(0, value));
    $(bar).setAttribute('aria-valuemax', max);
  }
  function drawHud() {
    $('hero-hp').textContent = Math.max(0, heroHp);
    $('foe-hp').textContent = Math.max(0, foeHp);
    setBar('hero-fill', 'hero-bar', heroHp, HERO_MAX);
    setBar('foe-fill', 'foe-bar', foeHp, foe.hp);
  }

  function monsterSVG(c) {
    return '<svg viewBox="0 0 120 120" width="140" height="140" role="img" aria-label="' + foe.n + '">' +
      '<path d="M18 108 Q8 40 60 18 Q112 40 102 108 Z" fill="' + c + '" stroke="#111" stroke-width="6" stroke-linejoin="round"/>' +
      '<circle cx="44" cy="56" r="11" fill="#fff" stroke="#111" stroke-width="4"/><circle cx="76" cy="56" r="11" fill="#fff" stroke="#111" stroke-width="4"/>' +
      '<circle cx="46" cy="58" r="4" fill="#111"/><circle cx="74" cy="58" r="4" fill="#111"/>' +
      '<path d="M30 40 L54 48 M90 40 L66 48" stroke="#111" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M40 86 L48 76 L56 86 L64 76 L72 86 L80 76" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function flash(el) {
    el.classList.remove('hit');
    void el.offsetWidth;
    el.classList.add('hit');
  }

  function loadFoe() {
    foe = LEVELS[lvl].foes[idx];
    foeHp = foe.hp;
    $('foe-name').textContent = foe.n;
    $('monster').innerHTML = monsterSVG(foe.c);
    $('lvl').textContent = 'Level ' + (lvl + 1) + ': ' + LEVELS[lvl].name + ' (enemy ' + (idx + 1) + ' of ' + LEVELS[lvl].foes.length + ')';
    drawHud();
  }

  function showOverlay(title, text, btn, fn) {
    $('ov-title').textContent = title;
    $('ov-text').textContent = text;
    $('ov-btn').textContent = btn;
    onContinue = fn;
    overlay.hidden = false;
    $('ov-btn').focus();
  }

  function startLevel() {
    idx = 0;
    heroHp = HERO_MAX;
    busy = false;
    overlay.hidden = true;
    loadFoe();
    newBoard();
    msg('A ' + foe.n + ' appears! Spell a word to attack.');
  }

  function enemyTurn(mult, note) {
    busy = true;
    var dmg = foe.atk * mult;
    setTimeout(function () {
      heroHp -= dmg;
      flash($('hero-img'));
      drawHud();
      if (heroHp <= 0) {
        showOverlay('You were defeated!', 'The ' + foe.n + ' was too strong this time. Try the level again.', 'Retry level', startLevel);
        return;
      }
      msg(note + ' The ' + foe.n + ' hits you for ' + dmg + ' damage!');
      busy = false;
    }, 700);
  }

  function submit() {
    if (busy) { return; }
    var w = currentWord();
    if (w.length < 3) { msg('Words need 3 or more letters.'); return; }
    if (!DICT[w.toUpperCase()]) {
      path = [];
      paint();
      enemyTurn(PUNISH, w + ' is not a real word! Double damage.');
      return;
    }
    var dmg = w.length * 4 + (w.length >= 5 ? 8 : 0);
    foeHp -= dmg;
    score += dmg;
    $('score').textContent = score;
    flash($('monster'));
    drawHud();
    if (recent.length === 0) { foundEl.innerHTML = ''; }
    recent.push(w);
    foundEl.innerHTML = recent.slice(-10).map(function (x) { return '<li>' + x + '</li>'; }).join('');
    refillUsed();
    paint();
    msg(w + '! ' + dmg + ' damage.');
    if (foeHp > 0) { enemyTurn(1, w + ' hits for ' + dmg + '.'); return; }

    score += 50;
    $('score').textContent = score;
    busy = true;
    if (idx + 1 < LEVELS[lvl].foes.length) {
      showOverlay(foe.n + ' defeated!', 'You rest and recover 30 HP. Another enemy waits ahead.', 'Next enemy', function () {
        idx++;
        heroHp = Math.min(HERO_MAX, heroHp + 30);
        busy = false;
        overlay.hidden = true;
        loadFoe();
        msg('A ' + foe.n + ' appears!');
      });
    } else if (lvl + 1 < LEVELS.length) {
      showOverlay('Level ' + (lvl + 1) + ' complete!', LEVELS[lvl].name + ' is clear. Score: ' + score + '.', 'Next level', function () { lvl++; startLevel(); });
    } else {
      showOverlay('You win!', 'The dungeon is clear. Final score: ' + score + '.', 'Play again', function () { lvl = 0; score = 0; recent = []; $('score').textContent = 0; startLevel(); });
    }
  }

  document.addEventListener('keydown', function (e) {
    if (busy || !overlay.hidden || e.ctrlKey || e.metaKey || e.altKey) { return; }
    var k = e.key;
    if (/^[a-zA-Z]$/.test(k)) { typeLetter(k.toUpperCase()); }
    else if (k === 'Backspace') { path.pop(); msg(''); paint(); }
    else if (k === 'Escape') { path = []; msg(''); paint(); }
    else if (k === 'Enter' && (e.target === document.body || e.target.className === 'tile')) { e.preventDefault(); submit(); }
  });

  $('submit').addEventListener('click', submit);
  $('clear').addEventListener('click', function () { if (!busy) { path = []; msg(''); paint(); } });
  $('shuffle').addEventListener('click', function () {
    if (busy) { return; }
    newBoard();
    enemyTurn(1, 'New letters!');
  });
  $('ov-btn').addEventListener('click', function () { if (onContinue) { onContinue(); } });

  var pickEl = $('pick');
  function applyHero(i) {
    $('hero-img').src = HEROES[i].src;
    $('hero-img').alt = HEROES[i].n + ', your hero';
  }
  function showPick() {
    busy = true;
    pickEl.hidden = false;
    $('pick-0').focus();
  }
  function choose(i) {
    applyHero(i);
    try { localStorage.setItem('wlHero', String(i)); } catch (e) {}
    pickEl.hidden = true;
    busy = false;
    msg('Good luck, ' + HEROES[i].n + '! Spell a word to attack.');
  }
  $('pick-0').addEventListener('click', function () { choose(0); });
  $('pick-1').addEventListener('click', function () { choose(1); });
  $('change').addEventListener('click', function () { if (!busy) { showPick(); } });

  // --- NEW INITIALIZATION LOGIC ---
  var startBtn = $('start-btn');
  var startScreen = $('start-screen');

  startBtn.addEventListener('click', function() {
    startScreen.hidden = true;
    startLevel();
    
    var saved = null;
    try { saved = localStorage.getItem('wlHero'); } catch (e) {}
    
    if (saved === '0' || saved === '1') { 
      applyHero(Number(saved)); 
    } else { 
      showPick(); 
    }
  });

  buildTiles();
})();