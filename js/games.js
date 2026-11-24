(function () {
  var chips = document.querySelectorAll('.chip');
  var cards = document.querySelectorAll('.gcard');
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener('click', function () {
      var f = this.getAttribute('data-filter');
      for (var a = 0; a < chips.length; a++) {
        chips[a].setAttribute('aria-pressed', chips[a] === this ? 'true' : 'false');
      }
      for (var b = 0; b < cards.length; b++) {
        cards[b].hidden = !(f === 'all' || cards[b].getAttribute('data-subject') === f);
      }
    });
  }
})();
