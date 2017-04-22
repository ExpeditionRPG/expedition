var CONSTANTS = require('./constants');
var State = require('./state');


// Render the cards into the UI based on the current filters
exports.render = function (sheets, filters) {

  if (sheets == null || filters == null) {
    return;
  }

  $("#renderArea").html('');

  $("body").removeClass();
  switch (filters.export) {
    case 'DriveThruCards':
      $("body").addClass("DriveThruCards");
    break;
    case 'Print-and-Play':
      $("body").addClass("printandplay");
    break;
    case 'Hide-Backs':
      $("body").addClass("hideBacks");
    break;
    case 'AdMagic-Fronts':
      $("body").addClass("hideBacks");
    break;
    case 'AdMagic-Backs':
      $("body").addClass("hideFronts");
    break;
  }

  if (State.singlePage) {
    $("body").addClass("singlePage");
  }

  var sorted = [];

  for (var i = 0, l = CONSTANTS.cardTemplates.length; i < l; i++) {
    sorted[sorted.length] = CONSTANTS.cardTemplates[i];
  }
  for (var i = 0, l = sorted.length; i < l; i++) {
    var sheet = sheets[sorted[i]];
    renderSheet(sheet.name, sheet.elements, filters);
  }
}


// Renders a specific sheet of cards (ie encounter, loot)
function renderSheet (template, cards, filters) {

  var cardCount = 0;
  var fronts, backs;

  for (var i = 0, l = cards.length; i < l; i++) {

    var card = cards[i];
    var filteredOut = false;
    card.template = template;

    if (filters.export.value === 'AdMagic-Backs') {
      if (card.class === cards[i-1].class && card.tier === cards[i-1].tier && cards[i-1].Comment === "") {
        filteredOut = true;
      }
    }
    if (filteredOut) {
      continue;
    }


  }
  }
}
