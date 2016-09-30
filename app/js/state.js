var CONSTANTS = require('./constants');


var lastUpdated = 0;


// STATE
exports.sheets = null;
/*
exports.state = {
  filters: {},
  params: {}, // maybe we should split out all non-filtering things (like filters.export, singlePage)
    // though, what's a better name for this, then?
}
*/

// asynchronously download and callback with sheets
exports.updateSheets = function (id, callback) {

  // rate limit to once per 2 seconds
  if (Date.now() - lastUpdated < 2000) {
    return callback(null, exports.sheets);
  }
  lastUpdated = Date.now();

  Tabletop.init({
    key: id,
    simpleSheet: true,
    callback: function (data, tabletop) {

      lastUpdated = Date.now();
      sheets = tabletop.sheets();
      // TODO call validation / cleanup here (as a separate function)
      // Cleanup could include things like excluding cards with comments, expanding macros
      // So that render is just putting into the UI
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
      exports.sheets = sheets;
      callback(null, exports.sheets);
    }
  });
};


exports.generateFilterOptions = function (sheets) {

  var filterOptions = {};

  for (var i = 0; i < CONSTANTS.cardFilters.length; i++) {
    var field = CONSTANTS.cardFilters[i];
    filterOptions[field] = [];
  }

  for (var i = 0; i < CONSTANTS.cardTemplates.length; i++) {

    var template = CONSTANTS.cardTemplates[i];

    if (sheets[template] != null) {

      filterOptions.template.push(template);

      for (var row = 0; row < sheets[template].elements.length; row++) {

        var card = sheets[template].elements[row];

        for (var j in CONSTANTS.cardFilters) {
          var field = CONSTANTS.cardFilters[j];
          if (card[field] && filterOptions[field].indexOf(card[field]) === -1) {
            filterOptions[field].push(card[field]);
          }
        }
      }
    }
  }

  return filterOptions;
}