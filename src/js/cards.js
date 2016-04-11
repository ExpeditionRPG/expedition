// Insert cards via: (returns rendered HTML)

function renderCardFront (template, card) {
  card = cleanCardData(template, card);
  if (template === "Helper" && card.Face === "back") {
    return this.Expedition.templates[template + '-back'](card);
  } else {
    return this.Expedition.templates[template](card);
  }
}


function renderCardBack (template, card) {
  card = cleanCardData(template, card);
  if (template === "Helper" && card.Face === "back") {
    return this.Expedition.templates[template](card);
  } else {
    return this.Expedition.templates[template + '-back'](card);
  }
}


// Register helpers and partials

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
  return "BETA " + today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear().toString().substr(2,2);
});

// also in generate.js
Handlebars.registerHelper("camelCase", function (str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '').replace(/'/, '');
});

Handlebars.registerHelper('healthCounter', function (health) {

  var max = false;
  if (health === 'max') {
    health = 23;
    max = true;
  }

  var output = '<ul class="hp-tracker-vertical">';
  var outputted = (max) ? -1 : 0; // put one extra on the vertical to fill out max
  var horizontal = false;
  while (health > 0) {
    health--; //subtract HP first, since we're already showing the max HP at the top

    if (outputted < 9) { // vert-horiz transition point
      output += "<li>" + health + "</li>";
    }
    else {
      if (outputted === 9) {
        output += '</ul><ul class="hp-tracker-horizontal">';
      }
      output += "<li>" + health + "</li>";
    }
    outputted++;
  }
  output += "</ul>";
  return output;
});

for (var key in this.Expedition.partials) {
  Handlebars.registerPartial(key, this.Expedition.partials[key]);
}

// register card templates

var templates = { // will be rendered into UI in this order
  Helper: this.Expedition.templates.Helper,
  Adventurer: this.Expedition.templates.Adventurer,
  Ability: this.Expedition.templates.Ability,
  Encounter: this.Expedition.templates.Encounter,
  Loot: this.Expedition.templates.Loot,
};

// Helper functions

function cleanCardData(template_id, card) {

  card.cardType = template_id;

  if (!card.rendered) {
    if (card.text) { // bold ability STATEMENTS:
      card.text = card.text.replace(/(.*:)/g, boldCapture);
    }
    if (card.abilitytext) { // bold ability STATEMENTS:
      card.abilitytext = card.abilitytext.replace(/(.*:)/g, boldCapture);
    }

    Object.keys(card).forEach(function(property) {
      if (card[property] === '-') { card[property] = ''; } // remove '-' proprties
      else {
        card[property] = card[property].replace(/(?:\r\n|\r|\n)/g, '<br />'); // turn linebreaks into BR's

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
          var src = "/img/icon/"+match.substring(1);
          if (card.cardType === 'Encounter') {
            src += '_white';
          }
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