var CONSTANTS = require('./constants');
var Render = require('./render');


// PRIVATE
var _lastUpdated = 0;


// PUBLIC STATE
exports.googleSheetId = null;
exports.googleSheetIdDefault = '1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM';
exports.sheets = null;
exports.singlePage = false;



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

