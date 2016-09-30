var Joi = require('joi-browser');

var CONSTANTS = require('./constants');
var State = require('./state');
var Helpers = require('./helpers');


var filters = {},
    filterOptions = {
      theme: Object.keys(window.Expedition),
      export: ['Print-and-Play', 'DriveThruCards', 'AdMagic-Fronts', 'AdMagic-Backs', 'Hide-Backs'],
      tier: [],
      class: [],
      template: [],
    };

(function init() {
  updateSheets(); // TODO because this is run before getParams, it'll fail to use the URL-specified sheet on the first load
  wireUI();
})();


/* ===== DATA AND FILTERS ===== */

function getParams() {

  var match,
      matches = {}, // temporarily store query matches
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); }, // replace + with a space
      query  = window.location.search.substring(1),
      filterCount = 0,
      oldFilters = JSON.parse(JSON.stringify(filters));
  filters = {};

  while (match = search.exec(query)) {
    var key = decode(match[1]);
    var value = decode(match[2]);
    matches[key] = value;
  }

  Object.assign(filters, CONSTANTS.filterDefaults, matches);
  Object.keys(filters).forEach(function (key) {
    var oldValue = oldFilters[key];
    if (CONSTANTS.cardFilters.indexOf(key) !== -1) {
      filterCount ++;
    }
    if (key === 'theme' && oldValue !== filters[key]) {
      onThemeChange();
    }
  });

  switch (filters.export) {
    case 'AdMagic-Backs':
    case 'AdMagic-Fronts':
    case 'DriveThruCards':
      filters.singlePage = true;
    break;
  }

  if (filterCount > 0) {
    var docTitle = 'Expedition Card Creator: ';
    Object.keys(filters).forEach(function (key) {
      docTitle += filters[key] + ' ';
    });
    docTitle = docTitle.slice(0, -1);
    document.title = docTitle;
  }

  return filters;
}

function buildFilters () {

  $("#dynamicFilters select").remove();
  for (var field in filterOptions) {
    filterOptions[field] = filterOptions[field].sort();
    buildFilter(field, filterOptions[field]);
  }

  function buildFilter (title, values) {

    var el = $("<select data-filter='" + title + "'></select>");
    if (CONSTANTS.filterDefaults[title] == null) {
      el.append("<option value=''>All " + title + "</option>");
    }
    for (var v in values) {
      el.append("<option value='" + values[v] + "'>" + values[v] + "</option>");
    }
    el.change(onFilterChange);
    $("#dynamicFilters").prepend(el);
    el.val(CONSTANTS.filterDefaults[title]);
    if (filters[title]) {
      $("#dynamicFilters select[data-filter='" + title + "']").find("option[value='" + filters[title] + "']").attr('selected', true);
    }
  }

  function onFilterChange (e) {

    var params = {};
    $("#dynamicFilters select").each(function (i, elem) {
      if ($(this).val() !== '') {
        params[$(this).data('filter')] = $(this).val();
      }
    }).promise().done(function () {
// TODO think of a better / unified way to do filter changes, ie passing a specific single key-value
// rather than re-reading the state of the UI
// (for example of why this is needed, see how setSource has to replicate this functionality)
// bonus points: based on what filter changed, updateSheets or render
      if (filters.googleSheetId != null) {
        params.googleSheetId = filters.googleSheetId;
      }
// TODO only store params in URL that're different than the default
      history.replaceState({}, document.title, '?' + jQuery.param(params));
      render(getParams(), State.sheets);
    });
  }
}


function wireUI () {
  $("#refreshCards").click(function () { updateSheets(); });
  $("#setSource").click(function () { setSource(); });
  $("#resetFilters").click(function () { resetFilters(); });
  window.onfocus = function() { updateSheets(true); };
}


function onThemeChange () {

  Object.keys(Handlebars.partials).forEach(function (key) {
    Handlebars.unregisterPartial(key);
  });
  Object.keys(window.Expedition[filters.theme].partials).forEach(function (key) {
    Handlebars.registerPartial(key, window.Expedition[filters.theme].partials[key]);
  });
  $("#renderArea").attr('data-theme', filters.theme);
}


function resetFilters () {
  $("#dynamicFilters select").find("option[value='']").attr('selected', true);
  history.replaceState({}, document.title, '?');
  getParams();
  render(getParams(), State.sheets);
}


function setSource () {
  // Official production sheet link: https://docs.google.com/spreadsheets/d/1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM/pubhtml
  var sheetWebLink = prompt('Enter your Google Sheet URL (make sure to use the "Publish To Web" option)');

  if (sheetWebLink == null || sheetWebLink == '') {
    return;
  }

  Joi.validate(sheetWebLink, Joi.string().uri(), function (err, value) {

    if (err) {
      return alert (err);
    }

    filters.googleSheetId = value.replace('https://docs.google.com/spreadsheets/d/', '')
        .replace('/pubhtml', '');
  // TODO this should use the same onFilterChange function, which should also handle updateSheets
    history.replaceState({}, document.title, '?' + jQuery.param(filters));
    updateSheets();
  });
}


// wrapper around loading table data that manages the UI
// if invisible is set to true, update in the background / don't hide the render area
function updateSheets(invisible) {



  $("#loading").fadeIn();

  if (invisible == undefined || !invisible) {
    $("#renderArea").hide();
  }

// TODO doing the || default shouldn't be necessary - need to run getParams before calling updateSheets for the first time
  State.updateSheets(filters.googleSheetId || CONSTANTS.filterDefaults.googleSheetId, function (err, sheets) {

    $.extend(filterOptions, State.generateFilterOptions(sheets));

    render(getParams(), sheets);
    buildFilters();
    $("#renderArea").show();
    setTimeout(function () { $("#loading").fadeOut(); }, 100); // wait for UI to settle
  });
}





/* ===== RENDER CARDS FUNCTIONS ===== */

// Render the cards into the UI based on the current filters
function render (filters, sheets) {

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

  if (filters.singlePage) {
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

    var card = cards[i], filteredOut = false;
    card.template = template;

    if (card.Comment !== "") {
      continue;
    }

    // filter out / skip cards
    for (var i = 0, l = CONSTANTS.cardFilters.length; i < l; i++) {
      var key = CONSTANTS.cardFilters[i];
      if (filters[key] != null && card[key] !== filters[key]) {
        filteredOut = true;
        continue;
      }
    }
    if (filters.export === 'AdMagic-Backs') {
      if (card.class === cards[i-1].class && card.tier === cards[i-1].tier && cards[i-1].Comment === "") {
        filteredOut = true;
      }
    }
    if (filteredOut) {
      continue;
    }

    // split cards 9 to a page unless singlePage
    if (cardCount % 9 === 0 || filters.singlePage) {
      fronts = $('<div class="page fronts"></div>');
      backs = $('<div class="page backs"></div>');
      $("#renderArea").append(fronts);
      $("#renderArea").append(backs);
    }

    fronts.append(renderCardFront(template, card));
    backs.append(renderCardBack(template, card));

    cardCount++;
  }

  console.log(cardCount + " " + template + " cards rendered");
  SVGInjector(document.querySelectorAll('img.svg'), {});

  function renderCardFront (template, card) {
    card = cleanCardData(template, card);
    if (template === "Helper" && card.Face === "back") {
      return window.Expedition[filters.theme].templates[template + '-back'](card);
    } else {
      return window.Expedition[filters.theme].templates[template](card);
    }
  }

  function renderCardBack (template, card) {
    card = cleanCardData(template, card);
    if (template === "Helper" && card.Face === "back") {
      return window.Expedition[filters.theme].templates[template](card);
    } else {
      return window.Expedition[filters.theme].templates[template + '-back'](card);
    }
  }

  function cleanCardData (template_id, card) {

    card.cardType = template_id;

    if (!card.rendered) {
      if (card.text != null) { // bold ability STATEMENTS:
        card.text = makeBold(card.text);
      }
      if (card.abilitytext != null) { // bold ability STATEMENTS:
        card.abilitytext = makeBold(card.abilitytext);
      }
      if (card.roll != null) { // bold loot STATEMENTS:
        card.roll = makeBold(card.roll);
      }

      function makeBold (string) {
        return string.replace(/(.*:)/g, function (whole, capture, match) {
          return '<strong>' + capture + '</strong>';
        });
      }

      Object.keys(card).forEach(function parseProperties (property) {

        if (card[property] === '-') { // remove '-' proprties
          card[property] = '';
        }
        else {
          // replace CSV line breaks with BR's - padded if: above and below OR's, below end of </strong>, above start of <strong>
          // otherwise just a normal BR
          card[property] = card[property].replace(/(\n(<strong>))|((<\/strong>)\n)|(\n(OR)\n)|(\n)/mg, function (whole, capture, match) {
            if (whole.indexOf('<strong>') !== -1) {
              return '<br class="padded"/>' + whole;
            }
            else if (whole.indexOf('</strong>') !== -1) {
              return whole + '<br class="padded"/>';
            }
            else if (whole.indexOf('OR') !== -1) {
              return '<br class="padded"/>' + whole + '<br class="padded"/>';
            }
            else {
              return whole + '<br />';
            }
          });

          // Expand &macro's
          card[property] = card[property].replace(/&[a-zA-Z0-9;]*/mg, function replacer (match) {
            switch (match.substring(1)) {
              case 'crithit':
                return '#roll <span class="symbol">&ge;</span> 20';
              break;
              case 'hit':
                return '#roll <span class="symbol">&ge;</span> $risk';
              break;
              case 'miss':
                return '#roll <span class="symbol">&lt;</span> $risk';
              break;
              case 'critmiss':
                return '#roll <span class="symbol">&le;</span> 1';
              break;
              // >, <, etc
              case 'geq;': return '≥'; break;
              case 'lt;': return '<'; break;
              case 'leq;': return '≤'; break;
              case 'gt;': return '>'; break;
            }
            throw "BROKEN MACRO: " + match.substring(1);
            return 'BROKEN MACRO';
          });

          // Replace #ability with the icon image
          card[property] = card[property].replace(/#\w*/mg, function replacer (match) {
            return '<img class="svg inline_icon" src="/themes/' + filters.theme + '/images/icon/' +
                match.substring(1) + '_small.svg"></img>';
          });

          // Replace $var with variable value
          card[property] = card[property].replace(/\$\w*/mg, function replacer (match) {
            return card[match.substring(1)];
          });
        }
      });

      if (card.Effect) { // put ORs in divs
        card.Effect = card.Effect.replace(/OR<br \/>/g, function (whole, capture, match) {
          return '<div class="or"><span>OR</span></div>';
        });
      }
      card.rendered = true;
    }

    return card;
  }
}