var Joi = require('joi-browser');


var renderArea;
var filters = {};


(function init() {

  renderArea = $("#renderArea");
  loadTable(); // TODO because this is run before getParams, it'll fail to use the URL-specified sheet on the first load
  wireUI();
})();


/* ===== DATA AND FILTERS ===== */

var templates = {},
    filters = {},
    filterList = [],
    filterOptions = {
      theme: Object.keys(window.Expedition),
      export: ['Print-and-Play', 'DriveThruCards', 'AdMagic-Fronts', 'AdMagic-Backs', 'Hide-Backs'],
      tier: [],
      class: [],
      template: [],
    },
    filterDefaults = { // for filters with defaults, don't have an "all" option
      theme: 'official',
      export: 'Print-and-Play',
    },
    cardFilters = ['tier', 'class', 'template']; // UI filters that filter card data

function getParams() {

  var match,
      matches = {}, // temporarily store query matches
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); }, // replace + with a space
      query  = window.location.search.substring(1),
      oldFilters = JSON.parse(JSON.stringify(filters));
  filters = {};
  filterList = [];

  while (match = search.exec(query)) {
    var key = decode(match[1]);
    var value = decode(match[2]);
    matches[key] = value;
  }

  Object.assign(filters, filterDefaults, matches);
  Object.keys(filters).forEach(function (key) {
    var oldValue = oldFilters[key];
    if (cardFilters.indexOf(key) !== -1) {
      filterList.push(key);
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

  if (filterList.length > 0) {
    var docTitle = 'Expedition Card Creator: ';
    Object.keys(filters).forEach(function (key) {
      docTitle += filters[key] + ' ';
    });
    docTitle = docTitle.slice(0, -1);
    document.title = docTitle;
  }
}

function buildFilters () {

  $("#dynamicFilters select").remove();
  for (var field in filterOptions) {
    filterOptions[field] = filterOptions[field].sort();
    buildFilter(field, filterOptions[field]);
  }

  function buildFilter (title, values) {

    var el = $("<select data-filter='" + title + "'></select>");
    if (filterDefaults[title] == null) {
      el.append("<option value=''>All " + title + "</option>");
    }
    for (var v in values) {
      el.append("<option value='" + values[v] + "'>" + values[v] + "</option>");
    }
    el.change(onFilterChange);
    $("#dynamicFilters").prepend(el);
    el.val(filterDefaults[title]);
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
// bonus points: based on what filter changed, loadTable or render
      if (filters.googleSheetId != null) {
        params.googleSheetId = filters.googleSheetId;
      }
      history.replaceState({}, document.title, '?' + jQuery.param(params));
      render();
    });
  }
}


function wireUI () {
  $("#refreshCards").click(loadTable);
  $("#setSource").click(setSource);
}


function onThemeChange () {

  Object.keys(Handlebars.partials).forEach(function (key) {
    Handlebars.unregisterPartial(key);
  });
  Object.keys(window.Expedition[filters.theme].partials).forEach(function (key) {
    Handlebars.registerPartial(key, window.Expedition[filters.theme].partials[key]);
  });
  renderArea.attr('data-theme', filters.theme);
  templates = { // will be rendered into UI in this order
    Helper: window.Expedition[filters.theme].templates.Helper,
    Adventurer: window.Expedition[filters.theme].templates.Adventurer,
    Ability: window.Expedition[filters.theme].templates.Ability,
    Encounter: window.Expedition[filters.theme].templates.Encounter,
    Loot: window.Expedition[filters.theme].templates.Loot,
  };
}


function resetFilters () {
  $("#dynamicFilters select").find("option[value='']").attr('selected', true);
  history.replaceState({}, document.title, '?');
  getParams();
  render();
}


function setSource () {
  // Official production sheet link: https://docs.google.com/spreadsheets/d/1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM/pubhtml
  var sheetWebLink = prompt('Enter your Google Sheet URL (make sure to use the "Publish To Web" option)');

  Joi.validate(sheetWebLink, Joi.string().uri(), function (err, value) {

    if (err) {
      return alert (err);
    }

    filters.googleSheetId = value.replace('https://docs.google.com/spreadsheets/d/', '')
        .replace('/pubhtml', '');
  // TODO this should use the same onFilterChange function, which should also handle loadTable
    history.replaceState({}, document.title, '?' + jQuery.param(filters));
    loadTable();
  });
}


function loadTable() {

  $("#loading").show();
  renderArea.html('');

  Tabletop.init({
    key: filters.googleSheetId || '1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM',
    callback: function (data, tabletop) {

      var sheets = tabletop.sheets();
      for (var page in templates) { // validate loaded data
        if (!sheets[page]) {
          return alert('Failed to sheet: ' + page);
        }
        if (sheets[page].elements.length <= 1) {
          return alert('No cards loaded for: ' + page);
        }

        filterOptions.template.push(page);
      }

      render(sheets);
      buildFilters(); // TODO why does this have to be called after render?
          // Because filterOptions gets populated in render, BAD!
          // Any data manipulation / analysis should be done in loadTable, or sub-function

      $("#loading").hide();
    }, simpleSheet: true
  });
}





/* ===== RENDER CARDS FUNCTIONS ===== */

function render (sheets) {

  getParams();
  renderArea.html('');

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

  for (var key in templates) {
    sorted[sorted.length] = key;
  }
  for (var i = 0, l = sorted.length; i < l; i++) { // sort by type in order listed in var templates
    sorted[i] = sheets[sorted[i]];
  }

  for (var i = 0, l = sorted.length; i < l; i++) {
    var sheet = sorted[i];
    buildCards(sheet.name, sheet.elements);
  }
}

function buildCards (template, cards) {

  var cardCount = 0;
  var fronts, backs;

  for (var i = 0, l = cards.length; i < l; i++) {

    var card = cards[i], filteredOut = false;
    card.template = template;

    if (card.Comment !== "") {
      continue;
    }

    for (var field in filterOptions) {
      if (card[field] && filterOptions[field].indexOf(card[field]) === -1) {
        filterOptions[field].push(card[field]);
      }
    }

    // define filters / skips here
    for (var j = 0; j < filterList.length; j++) {
      if (card[filterList[j]] !== filters[filterList[j]]) {
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
      renderArea.append(fronts);
      renderArea.append(backs);
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
      if (card.text) { // bold ability STATEMENTS:
        card.text = card.text.replace(/(.*:)/g, boldCapture);
      }
      if (card.abilitytext) { // bold ability STATEMENTS:
        card.abilitytext = card.abilitytext.replace(/(.*:)/g, boldCapture);
      }
      if (card.roll) { // bold loot STATEMENTS:
        card.roll = card.roll.replace(/(.*:)/g, boldCapture);
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
            console.log("BROKEN MACRO: " + match.substring(1));
            return 'BROKEN MACRO';
          });

          // Replace #ability with the icon image
          card[property] = card[property].replace(/#\w*/mg, function replacer (match) {
            var src = "/themes/" + filters.theme + "/images/icon/" + match.substring(1);
            src += '_small.svg';

            return '<img class="svg inline_icon" src="' + src + '"></img>';
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

  function boldCapture (whole, capture, match) {
    return '<strong>' + capture + '</strong>';
  }
}



/* ===== HANDLEBARS HELPERS, PARTIALS ===== */

Swag.registerHelpers(); // lots of handlebars helpers: https://github.com/elving/swag

Handlebars.registerHelper("romanize", function (num) { // http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
  if (+num === 0) return 0;
  if (!+num) return false;
  var digits = String(+num).split(""),
      key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
             "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
             "","I","II","III","IV","V","VI","VII","VIII","IX"],
      roman = "", i = 3;
  while (i--) roman = (key[+digits.pop() + (i * 10)] || "") + roman;
  return ((num < 0) ? '-' : '') + Array(+digits.join("") + 1).join("M") + roman;
});

Handlebars.registerHelper("dots", function (num) {
  for (var i = 0, ret = ''; i < num; i++) {
    ret += '.';
  }
  return ret;
});

Handlebars.registerHelper("version", function (version) {
  var today = new Date();
  return today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear().toString().substr(2,2);
});

Handlebars.registerHelper("camelCase", function (str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '').replace(/'/, '');
});

// generates a bottom tracker, fits up to 14; inclusive 0-count
Handlebars.registerHelper('horizontalCounter', function (count) {


  var output = '';
  var outputted = 0;

  while (count >= 0) {

    output += "<span>" + outputted + "</span>";
    count--;
    outputted++;
  }
  return output;
});

// generate U-shaped healthCounters with two special cases:
  // 10 health should fit into a single sidge
  // the number of numbers that fit onto the bottom track depends on the number of single vs double digit numbers
    // (since they have different widths)
Handlebars.registerHelper('healthCounter', function (health) {

  var digitWidth = [0, 16, 23];
  var maxWidth = 269;
  var outputtedWidth = 0;

  var max = false;
  if (health === 'max') {
    health = 31;
    max = true;
  }

  var output = '<ul class="hp-tracker hp-tracker-vertical-right">';
  var temp = ''; // temp storage for when we have to output in reverse in horizontal and vertical-right
  var outputted = (max) ? -1 : 0; // put one extra on the vertical to fill out max

  while (health > 0) {
    health--; //subtract HP first, since we're already showing the max HP at the top

    if (outputted < 9 || (outputted === 9 && health === 0)) {
      output += "<li>" + health + "</li>";
    } else if (outputted === 9) { // vert-horiz transition point
      output += '</ul><table class="hp-tracker hp-tracker-horizontal"><tr>';
      temp = "<td>" + health + "</td>";
      outputtedWidth += digitWidth[health.toString().length];
    } else if (outputtedWidth + digitWidth[health.toString().length] < maxWidth) {
      temp = "<td>" + health + "</td>" + temp;
      outputtedWidth += digitWidth[health.toString().length];
    } else if (maxWidth > 0) { // horiz-vert transition
      output += temp + '</tr></table><ul class="hp-tracker hp-tracker-vertical-left">';
      temp = "<li>" + health + "</li>";
      maxWidth = 0;
    } else {
      temp = "<li>" + health + "</li>" + temp;
    }
    outputted++;
  }
  output += temp + "</ul>";
  return output;
});

// same thing as hp tracker, but with different transition points. TODO make unified function that takes in count and transition points
// also post-increments instead of pre-increments, so maybe pass an output range (ie loot is 20-1, HP is 19-0)
Handlebars.registerHelper('lootCounter', function (count) {

  var digitWidth = [0, 16, 23];
  var maxWidth = 269;
  var outputtedWidth = 0;

  var output = '<ul class="hp-tracker hp-tracker-vertical-right">';
  var temp = ''; // temp storage for when we have to output in reverse in horizontal and vertical-right
  var outputted = 0;

  while (count > 0) {
    if (outputted < 15 || (outputted === 15 && count === 0)) {
      output += "<li>" + count + "</li>";
    } else if (outputted === 15) { // vert-horiz transition point
      output += '</ul><table class="hp-tracker hp-tracker-horizontal"><tr>';
      temp = "<td>" + count + "</td>";
      outputtedWidth += digitWidth[count.toString().length];
    } else if (outputtedWidth + digitWidth[count.toString().length] < maxWidth) {
      temp = "<td>" + count + "</td>" + temp;
      outputtedWidth += digitWidth[count.toString().length];
    } else if (maxWidth > 0) { // horiz-vert transition
      output += temp + '</tr></table><ul class="hp-tracker hp-tracker-vertical-left">';
      temp = "<li>" + count + "</li>";
      maxWidth = 0;
    } else {
      temp = "<li>" + count + "</li>" + temp;
    }
    outputted++;
    count--; //subtract count last, so that we get all the values
  }
  output += temp + "</ul>";
  return output;
});