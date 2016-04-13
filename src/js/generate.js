// Card Filters

var forPrinter = false; // set via url param

var selectOptions = {
  threat: [],
  class: [],
  template: [],
};
var filters, filterList, filterCount;
function fetchFilters() {
  var match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1);
  filters = {};
  filterList = [];
  while (match = search.exec(query)) {
    var f = decode(match[1]);
    if (f !== 'printer' && f !== 'printandplay' && f !== 'hideBacks') {
      filters[f] = decode(match[2]);
      filterList.push(f);
    }
  }
  filterCount = filterList.length;

  if (filterCount > 0) {
    var docTitle = '';
    Object.keys(filters).forEach(function (key) {
      docTitle += filters[key] + '-';
    });
    docTitle = docTitle.slice(0, -1);
    document.title = docTitle;
  }
}


var cardCount, fronts, backs, cardData, tabletop, sheets; // vars for rendering cards


(function init() {
  console.log('init');
  if (window.location.search.indexOf("printer") !== -1) {
    forPrinter = true;
    $("body").addClass("printer");
  }
  if (window.location.search.indexOf("printandplay") !== -1) {
    $("body").addClass("printandplay");
  }
  if (window.location.search.indexOf("hideBacks") !== -1) {
    $("body").addClass("hideBacks");
  }
  loadTable();
})();

function loadTable() {
  Tabletop.init({
    key: '1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM',
    callback: function(data, tabletop) {
      console.log('done!');

      cardData = data; // save these in case we need them later (ie re-running rendering)
      sheets = tabletop.sheets();

      // assert load worked
      for (var page in templates) {
        if (!sheets[page]) {
          return alert('Failed to sheet: ' + page);
        }
        if (sheets[page].elements.length <= 1) {
          return alert('No cards loaded for: ' + page);
        }

        selectOptions.template.push(page);
      }

      render();

      // Remove past filters
      $("#filters select").remove();
      for (var field in selectOptions) {
        selectOptions[field] = selectOptions[field].sort();
        makeFilter(field, selectOptions[field]);
      }

      // We're done loading!
      $("#loading").remove();
    }, simpleSheet: true
  });
  $("#resetFilters").click(function() {
    $("#filters select").find("option[value='']").attr('selected', true);
    history.replaceState({}, document.title, '?');
    render();
  });
}

function render() {
  $(".page").remove(); // clear out any cards from past renders
  cardCount = 0;
  fetchFilters();

  var sorted = [];

  for (var key in templates) {
    sorted[sorted.length] = key;
  }
  for (var i = 0, l = sorted.length; i < l; i++) { // sort by type in order listed in var templates
    sorted[i] = sheets[sorted[i]];
  }

  // iterate through and display, render IMG as SVG when done
  for (var i = 0, l = sorted.length; i < l; i++) {
    var sheet = sorted[i];
    makeCards(sheet.name, sheet.elements);
  }
}

function makeCards (template, cards) {
  var templateCount = 0;
  for (var i = 0, l = cards.length; i < l; i++) {
    var card = cards[i], filteredOut = false;

    if (card.Comment !== "") {
      continue;
    }

    for (var field in selectOptions) {
      if (card[field] && selectOptions[field].indexOf(card[field]) === -1) {
        selectOptions[field].push(card[field]);
      }
    }

    // define filters / skips here
    card.template = template;
    for (var j = 0; j < filterCount; j++) {
      if (card[filterList[j]] !== filters[filterList[j]]) {
        filteredOut = true;
        continue;
      }
    }
    if (filteredOut) {
      continue;
    }

// SPLIT CARDS 9 TO A PAGE
// Note: comment this if loop out to do 1 per page
    if (cardCount % 9 === 0 || forPrinter) {
      fronts = $('<div class="page fronts"></div>');
      backs = $('<div class="page backs"></div>');
      $("body").append(fronts);
      $("body").append(backs);
    }

    fronts.append(renderCardFront(template, card));
    backs.append(renderCardBack(template, card));
    if (card.template === "Ability" || card.template === "Loot") {
      var el = $("#" + camelCase(card.name));
      var text = el.find(".abilitytext");
      var textHeight = text.height();
      if (!textHeight) {
        console.log("Error reading height of " + card.name);
      }
      else if (textHeight > 160) {
        console.log("Potential overflow on " + card.name)
      }
    }
    cardCount++;
    templateCount++;
  }
  console.log(templateCount + " " + template + " cards, " + cardCount + " total");
  SVGInjector(document.querySelectorAll('img.svg'), {});
}


function makeFilter (title, values) {
  var el = $("<select data-filter='" + title + "'></select>");
  el.append("<option value=''>All " + title + "</option>");
  for (var v in values) {
    el.append("<option value='" + values[v] + "'>" + values[v] + "</option>");
  }
  el.change(function(e) {
    var params = {};
    $("#filters select").each(function(i, elem) {
      if ($(this).val() !== '') {
        params[$(this).data('filter')] = $(this).val();
      }
    }).promise().done(function() {
      history.replaceState({}, document.title, '?' + jQuery.param(params));
    })
    render();
  });
  $("#filters").prepend(el);
  if (filters[title]) {
    $("#filters select[data-filter='" + title + "']").find("option[value='" + filters[title] + "']").attr('selected', true);
  }
}

// also in cards.js
function camelCase (str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '').replace(/'/, '');
}