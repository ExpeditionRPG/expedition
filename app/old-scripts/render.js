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
