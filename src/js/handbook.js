(function init() {
  Tabletop.init({
    key: '1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM',
    callback: function(d, t) {
      console.log('sheets loaded');

      cardData = d; // save these in case we need them later (ie re-running rendering)
      tabletop = t;
      sheets = tabletop.sheets();

      // assert load worked
      for (var page in templates) {
        if (!sheets[page]) {
          return alert('Failed to sheet: ' + page);
        }
        if (sheets[page].elements.length <= 1) {
          return alert('No cards loaded for: ' + page);
        }
      }
      render();
    }, simpleSheet: true
  });
})();


function render() {
  var sorted = [];
  $(".cardfront").each(function(i, e) {
    var $e = $(e);
    var id = $e.attr('data-card');
    var title = $e.attr('data-title');
    for (var i = 0; i < sheets[id].elements.length; i++) {
      if (sheets[id].elements[i].Name == title) {
        $e.html(renderCardFront(id, sheets[id].elements[i]));
        return;
      }
    }
  });
  SVGInjector(document.querySelectorAll('img.svg'), {});
}