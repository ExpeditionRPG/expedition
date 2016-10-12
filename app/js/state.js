var CONSTANTS = require('./constants');
var Render = require('./render');


// PRIVATE
var _lastUpdated = 0;


// PUBLIC STATE
exports.filters = {
  template: {
    value: null,
    default: 'All templates',
    options: ['All templates'].concat(CONSTANTS.cardTemplates),
  },
  class: {
    value: null,
    default: 'All classes',
    options: [],
  },
  tier: {
    value: null,
    default: 'All tiers',
    options: [],
  },
  export: {
    value: null,
    default: 'Print-and-Play',
    options: ['Print-and-Play', 'DriveThruCards', 'AdMagic-Fronts', 'AdMagic-Backs', 'Hide-Backs'],
  },
  theme: {
    value: null,
    default: 'official',
    options: Object.keys(window.Expedition),
  },
};
exports.googleSheetId = null;
exports.googleSheetIdDefault = '1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM';
exports.sheets = null;
exports.singlePage = false;


// asynchronously download and callback with sheets
exports.updateSheets = function (callback) {

  callback = callback || function (err) {
    if (err) throw err;
  }

  // rate limit to once per 2 seconds
  if (Date.now() - _lastUpdated < 2000) {
    return callback(null, exports.sheets);
  }
  _lastUpdated = Date.now();

  $("#loading").fadeIn();

  Tabletop.init({
    key: exports.googleSheetId,
    simpleSheet: true,
    callback: function (data, tabletop) {

      lastUpdated = Date.now();
      sheets = tabletop.sheets();
      // TODO call validation / cleanup here (as a separate function)
      // Cleanup could include things like excluding cards with comments, expanding macros
      // So that render is just putting into the UI

      exports.sheets = sheets;
      updateFilters(sheets);
      Render.render(exports.sheets, exports.filters);
      $("#loading").fadeOut();
      return callback(null, sheets);
    }
  });
};


// Save to the appropriate state, then update UI
exports.updateState = function (key, value) {

  switch (key) {
    case 'googleSheetId':
      exports.googleSheetId = value;
    break;
    case 'theme':
      Object.keys(Handlebars.partials).forEach(function (key) {
        Handlebars.unregisterPartial(key);
      });
      Object.keys(window.Expedition[value].partials).forEach(function (key) {
        Handlebars.registerPartial(key, window.Expedition[value].partials[key]);
      });
      $("#renderArea").attr('data-theme', value);
      exports.filters.theme.value = value;
    break;
    case 'export':
      switch (value) {
        case 'AdMagic-Backs':
        case 'AdMagic-Fronts':
        case 'DriveThruCards':
          exports.singlePage = true;
        break;
      }
      exports.filters.export.value = value;
    break;
    case 'template':
    case 'class':
    case 'tier':
      exports.filters[key].value = value;
    break;
    default:
      throw 'Unexpected state key: ' + key + ' - value: ' + value;
    break;
  }

  saveParamsToUrl();

  if (key === 'googleSheetId') {
    exports.updateSheets();
  }
  else {
    Render.render(exports.sheets, exports.filters);
  }
};


function fetchParamsFromUrl () {

  var url = window.location.search.substring(1);
  var match;
  var search = /([^&=]+)=?([^&]*)/g;
  var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); }; // replace + with a space

  while (match = search.exec(url)) {
    var key = decode(match[1]);
    var value = decode(match[2]);
    exports.updateState(key, value);
  }
}


// For filters without values yet, update them to be their default value
function assignFilterDefaults () {
  for (var key in exports.filters) {
    var filter = exports.filters[key];
    if (filter.value == null) {
      exports.updateState(key, filter.default);
    }
  }
  if (exports.googleSheetId == null) {
    exports.updateState('googleSheetId', exports.googleSheetIdDefault);
  }
}


function saveParamsToUrl () {

  var params = {};

  if (exports.googleSheetId !== exports.googleSheetIdDefault) {
    params.googleSheetId = exports.googleSheetId;
  }

  for (var key in exports.filters) {
    var filter = exports.filters[key];
    if (filter.value !== filter.default && filter.value !== '') {
      params[key] = filter.value;
    }
  }

  history.replaceState({}, document.title, '?' + jQuery.param(params));
}


function updateFilters (sheets) {

  exports.filters.tier.options = [exports.filters.tier.default];
  exports.filters.class.options = [exports.filters.class.default];

  var tierCards = sheets.Encounter.elements.concat(sheets.Loot.elements);
  var classCards = sheets.Ability.elements.concat(sheets.Encounter.elements);

  for (var i = 0, l = tierCards.length; i < l; i++) {
    var card = tierCards[i];
    if (card.tier !== '' && exports.filters.tier.options.indexOf(card.tier) === -1) {
      exports.filters.tier.options.push(card.tier);
    }
  }

  for (var i = 0, l = classCards.length; i < l; i++) {
    var card = classCards[i];
    if (card.class !== '' && exports.filters.class.options.indexOf(card.class) === -1) {
      exports.filters.class.options.push(card.class);
    }
  }

  exports.filters.tier.options = exports.filters.tier.options.sort();
  exports.filters.class.options = exports.filters.class.options.sort();
  buildFilters(exports.filters);
}


function buildFilters (filters) {

  $("#dynamicFilters select").remove();
  for (var key in filters) {
    buildFilter(key, filters[key].options, filters[key].value);
  }

  function buildFilter (title, options, value) {

    var el = $("<select data-filter='" + title + "'></select>");
    for (var i = 0, l = options.length; i < l; i++) {
      el.append("<option value='" + options[i] + "'>" + options[i] + "</option>");
    }
    el.change(function (e) {
      exports.updateState($(this).data('filter'), $(this).val());
    });
    $("#dynamicFilters").append(el);
    el.val(value);
  }
}


exports.init = function (callback) {
  fetchParamsFromUrl();
  assignFilterDefaults();
  exports.updateSheets(callback);
};