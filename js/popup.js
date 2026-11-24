(function () {
  // Set to true while testing so the pop-up appears on every refresh.
  var ALWAYS_SHOW = false;

  var overlay = document.getElementById('wl-overlay');
  var input   = document.getElementById('wl-name');
  var errorEl = document.getElementById('wl-error');
  var playBtn = document.getElementById('wl-play');
  var skipBtn = document.getElementById('wl-skip');
  var lastFocus = null;

  // Storage can be blocked (private browsing), so every access is wrapped.
  function read(store, key) {
    try { return window[store].getItem(key); } catch (e) { return null; }
  }
  function write(store, key, value) {
    try { window[store].setItem(key, value); } catch (e) {}
  }

  // Put the saved nickname into every element with class "player-name".
  function showName(name) {
    var spots = document.querySelectorAll('.player-name');
    for (var i = 0; i < spots.length; i++) { spots[i].textContent = name; }
  }

  function openPopup() {
    lastFocus = document.activeElement;
    overlay.classList.add('wl-open');
    document.body.style.overflow = 'hidden';
    input.focus();
  }

  function closePopup() {
    overlay.classList.remove('wl-open');
    document.body.style.overflow = '';
    write('sessionStorage', 'wlSeen', '1');
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  function submitName() {
    var name = input.value.trim();
    if (!name) {
      errorEl.textContent = 'Type a nickname to start playing.';
      input.focus();
      return;
    }
    write('localStorage', 'wlName', name);
    showName(name);
    closePopup();
  }

  playBtn.addEventListener('click', submitName);
  skipBtn.addEventListener('click', closePopup);
  input.addEventListener('input', function () { errorEl.textContent = ''; });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { submitName(); }
  });

  // Keep keyboard focus inside the pop-up while it is open.
  overlay.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closePopup(); return; }
    if (e.key !== 'Tab') { return; }
    var items = [input, playBtn, skipBtn];
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // On load: greet returning players, show the pop-up to new ones.
  function start() {
    var saved = read('localStorage', 'wlName');
    if (saved) { showName(saved); input.value = saved; }
    if (ALWAYS_SHOW || !read('sessionStorage', 'wlSeen')) {
      setTimeout(openPopup, 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
