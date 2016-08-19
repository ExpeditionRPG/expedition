var helpers = require('./helpers.js');
var logAt = helpers.logAt;
var getHeader = helpers.getHeader;
var parseAttributes = helpers.parseAttributes;
var getInstruction = helpers.getInstruction;
var cheerio = require('cheerio');

// ---------------- Element conversion functions ---------------

var applyAttributes = function(node, attribs, context, fields) {
  if (!attribs) {
    attribs = {};
  }

  if (fields && context) {
    for (var i = 0; i < fields.length; i++) {
      if (!attribs[fields[i]] && context[fields[i]]) {
        // Sync context to attributes
        attribs[fields[i]] = context[fields[i]];
      } else if (attribs[fields[i]]) {
        // Sync attributes to context
        context[fields[i]] = attribs[fields[i]];
      }
    }
  }
  for (var prop in attribs) {
    if (attribs.hasOwnProperty(prop)) {
      node.attr(prop, attribs[prop]);
    }
  }
}

exports.toQuest = function(title_node, subtitle_node) {
  var title = title_node.text();
  var meta = subtitle_node.text().split('\n');

  var elem = cheerio.load('<quest title="'+title+'"></quest>');
  var quest = elem('quest');

  for(var i = 0; i < meta.length; i++) {
    var kv = meta[i].split(":");
    quest.attr(kv[0].trim().toLowerCase(), kv[1].trim());
  }

  // Note we're specifically returning the base element here so we
  // can later call .html().
  return elem;
};

exports.toRoleplay = function(node, context) {
  var title = getHeader(node);
  if (title) {
    context.title = title;
  }

  var elem = cheerio.load('<roleplay title="'+context.title+'"></roleplay>')
  var roleplay = elem("roleplay");

  if (node) {
    applyAttributes(roleplay, parseAttributes(node), context, ["icon"]);
  }

  logAt(context, elem.html());
  return roleplay;
}

exports.toCombat = function(node, context) {
  var elem = cheerio.load('<combat></combat>');
  var combat = elem("combat");

  var attribs = parseAttributes(node);
  for (var i = 0; i < attribs.enemies.length; i++) {
    combat.append("<e>" + attribs.enemies[i] + "</e>");
  }

  delete attribs.enemies; // So it isn't added to node attributes
  applyAttributes(combat, attribs, context, ["icon"]);

  logAt(context, elem.html());
  return combat;
}

exports.toChoice = function(node, context) {
  // <li><p>data</p></li>
  // li -> p -> textnode -> data
  var data = node.children[0].children[0].data.split('{');
  var text = data[0].trim();
  var elem = cheerio.load('<choice text="'+text+'"></choice>');
  var choice = elem("choice")

  if (data[1]) {
    applyAttributes(choice, JSON.parse('{'+data[1]));
  }

  logAt(context, elem.html());
  return choice;
}

exports.toEvent = function(node, context) {
  // <li><p>data</p></li>
  // li -> p -> textnode -> data
  var data = node.children[0].children[0].data.split('{');
  var condition = data[0].split(" ")[1].trim();
  var elem = cheerio.load('<event on="'+condition+'"></event>');
  var event = elem("event");

  if (data[1]) {
    applyAttributes(event, JSON.parse('{'+data[1]));
  }

  logAt(context, elem.html());
  return event;
}

exports.toInstruction = function(node, context) {
  // <p><blockquote>data</blockquote></p>
  var elem = cheerio.load('<instruction></instruction>');
  logAt(context, elem.html());
  return elem("instruction");
}

exports.toOperation = function(node) {
  // TODO
}

exports.toTrigger = function(node, context) {
  var action = node.children[0].children[0].data;
  var elem = cheerio.load('<trigger>'+action+'</trigger>');
  logAt(context, elem.html());
  return elem("trigger");
}