var Joi = require('joi-browser');

var State = require('./state');
var Helpers = require('./helpers');


(function init() {

  $("#renderArea").hide();

  State.init(function (err, result) {

    if (err) {
      throw err;
    }

    $("#refreshCards").click(function () { State.updateSheets(); });
    $("#setSource").click(function () { setSource(); });
    window.onfocus = function() { State.updateSheets(); };
    $("#renderArea").show();
  });
})();


function setSource () {
  // Official production sheet: https://docs.google.com/spreadsheets/d/1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM/pubhtml
  var sheetWebLink = prompt('Enter your Google Sheet URL (make sure to use the "Publish To Web" option)');

  if (sheetWebLink == null || sheetWebLink == '') {
    return;
  }

  Joi.validate(sheetWebLink, Joi.string().uri(), function (err, value) {

    if (err) {
      return alert (err);
    }

    value = value.replace('https://docs.google.com/spreadsheets/d/', '')
        .replace('/pubhtml', '');
    State.updateState('googleSheetId', value);
  });
}