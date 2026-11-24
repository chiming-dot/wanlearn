(function () {
  // Keep one accordion item open at a time within the page.
  var items = document.querySelectorAll('details.acc');
  for (var i = 0; i < items.length; i++) {
    items[i].addEventListener('toggle', function () {
      if (!this.open) { return; }
      for (var j = 0; j < items.length; j++) {
        if (items[j] !== this) { items[j].open = false; }
      }
    });
  }
})();
