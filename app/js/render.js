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

    // filter out / skip cards
    if (card.Comment !== '') {
      continue;
    }
    for (var j = 0; j < CONSTANTS.cardFilters.length; j++) {
      var key = CONSTANTS.cardFilters[j];
      if (filters[key].value !== filters[key].default && card[key] !== filters[key].value) {
        filteredOut = true;
        continue;
      }
    }
    if (filters.export.value === 'AdMagic-Backs') {
      if (card.class === cards[i-1].class && card.tier === cards[i-1].tier && cards[i-1].Comment === "") {
        filteredOut = true;
      }
    }
    if (filteredOut) {
      continue;
    }

    // split cards 9 to a page unless singlePage
    if (cardCount % 9 === 0 || State.singlePage) {
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
      return window.Expedition[filters.theme.value].templates[template + '-back'](card);
    } else {
      return window.Expedition[filters.theme.value].templates[template](card);
    }
  }

  function renderCardBack (template, card) {
    card = cleanCardData(template, card);
    if (template === "Helper" && card.Face === "back") {
      return window.Expedition[filters.theme.value].templates[template](card);
    } else {
      return window.Expedition[filters.theme.value].templates[template + '-back'](card);
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
            return '<img class="svg inline_icon" src="/themes/' + filters.theme.value + '/images/icon/' +
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