// Make these config? Since they're globally relevant magic strings...
var cardFilters = ['tier', 'class', 'template']; // UI filters that filter card data
var cardTemplates = ['Helper', 'Adventurer', 'Ability', 'Encounter', 'Loot']; // Handlebars card templates
  // TODO this is also defined / used in app.js as a dictionary mapping id: template


exports.loadTable = function (id, callback) {

  Tabletop.init({
    key: id,
    simpleSheet: true,
    callback: function (data, tabletop) {

      var sheets = tabletop.sheets();
      // TODO call validation / cleanup here (as a separate / modular function)
      // Cleanup could include things like excluding cards with comments, expanding macros
/*
      for (var page in templates) { // validate loaded data
        if (!sheets[page]) {
          return alert('Failed to sheet: ' + page);
        }
        if (sheets[page].elements.length <= 1) {
          return alert('No cards loaded for: ' + page);
        }
      }
*/
      callback(null, sheets);
    }
  });
};


exports.generateFilterOptions = function (sheets) {

  var filterOptions = {};

  for (var i = 0; i < cardFilters.length; i++) {
    var field = cardFilters[i];
    filterOptions[field] = [];
  }

  for (var i = 0; i < cardTemplates.length; i++) {

    var template = cardTemplates[i];

    if (sheets[template] != null) {

      filterOptions.template.push(template);

      for (var row = 0; row < sheets[template].elements.length; row++) {

        var card = sheets[template].elements[row];

        for (var j in cardFilters) {
          var field = cardFilters[j];
          if (card[field] && filterOptions[field].indexOf(card[field]) === -1) {
            filterOptions[field].push(card[field]);
          }
        }
      }
    }
  }

  return filterOptions;
}