(function () {
  var header = document.querySelector('.nav');
  var btn = header && header.querySelector('.burger');
  if (!btn) { return; }

  function setOpen(open) {
    header.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  btn.addEventListener('click', function () {
    setOpen(!header.classList.contains('open'));
  });

  // Close after choosing a link, when clicking elsewhere, or on Escape.
  header.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#site-menu a')) { setOpen(false); }
  });
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) { setOpen(false); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('open')) {
      setOpen(false);
      btn.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 700) { setOpen(false); }
  });
})();