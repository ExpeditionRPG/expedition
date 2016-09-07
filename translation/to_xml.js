var markdown = require("markdown").markdown;
var cheerio = require('cheerio');
var prettifyHTML = require("html").prettyPrint;
var format = require('./format');
var htmlToMarkdown = require('to-markdown');

// ----------------------------------------------------------
// These are the regular HTML elements that markdown creates.
// The mapping is outlined in code in traverseAndAppend().
var TEXT_ELEM = "p";
var BRANCH_ELEM = "li";
var BRANCH_WRAPPER = "ul";
var TRIGGER_ELEM = "strong";
var HEADER_ELEM = "em";
var INSTRUCTION_ELEM = "blockquote";

// ----------------------------------------------------------
// Parser helpers

function MarkdownParserError(message, html, usage) {
    this.name = 'MarkdownParserError';
    this.message = message;
    this.stack = (new Error()).stack;
    this.line = htmlToMarkdown(html)
    this.usage = usage;
}
MarkdownParserError.prototype = new Error;

var parseHeader = function(node) {
  if (node.is(TEXT_ELEM) && node.contents().eq(0).is(HEADER_ELEM)) {
    return node.contents().eq(0).text().trim();
  };
};

var parseTrigger = function(node) {
  if (node.is(TEXT_ELEM) && node.contents().eq(0).is(TRIGGER_ELEM)) {
    return node.contents().eq(0).text().trim();
  };
};

// Parse the JSON string directly after a header element.
var PARSE_EXAMPLE_SYNTAX = "_roleplay title_ {\"id\": \"string\", \"icon\": \"adventurer\"}";
var parseAttributes = function(node) {
  if (!parseHeader(node) || node.contents().length === 1) {
    return;
  }

  if (node.contents().length !== 2) {
    throw new MarkdownParserError("Too many elements", node.html(), PARSE_EXAMPLE_SYNTAX);
  }

  var attribute_text = node.contents().eq(1).text();
  if (attribute_text.trim() === "") {
    return;
  }

  try {
    return JSON.parse(attribute_text);
  } catch (e) {
    throw new MarkdownParserError("Failed to get attributes", node.html(), PARSE_EXAMPLE_SYNTAX);
  }
};

var firstChildText = function(node) {
  return node.children().eq(0).text();
}

// -----------------------------------------------------------
// Conditionals for evaluating nodes

var isEvent = function(node) {
  return firstChildText(node).startsWith("on");
};

var isCombat = function(node) {
  return node.is(TEXT_ELEM) && parseHeader(node) === 'combat';
}

var isChoice = function(node) {
  return node.is(BRANCH_ELEM) && !isEvent(node);
}

var isTrigger = function(node) {
  return node.is(TEXT_ELEM) && parseTrigger(node);
}

var isInstruction = function(node) {
  return node.is(INSTRUCTION_ELEM);
}

var isRoleplay = function(node, parent) {
  return node.is(TEXT_ELEM) && !parent.is("roleplay");
}

var isText = function(node, parent) {
  return node.is(TEXT_ELEM) && parent.is("roleplay")
}

// Adds the given fields to node as attributes, pulling from
// attribs and context.
// If attribs and context both have a field, attrib wins.
// If neither have a field, the field is ignored.
// Both context and fields are optional.
var applyAttributes = function(node, attribs, context, fields) {
  if (!attribs) {
    attribs = {};
  }
  if (fields && context) {
    for (var i = 0; i < fields.length; i++) {
      if (attribs[fields[i]]) {
        // Sync attributes to context
        context[fields[i]] = attribs[fields[i]];
      } else if(context[fields[i]]) {
        // Sync context to attributes
        attribs[fields[i]] = context[fields[i]];
      }
    }
  }
  for (var prop in attribs) {
    if (attribs.hasOwnProperty(prop)) {
      node.attr(prop, attribs[prop]);
    }
  }
};

// Traverses the list of children, contextually converting them
// to QDL elements and appending them to the parent node.
// This should be called by every toXXX() function that has children.
var traverseAndAppend = function(parent, children, context) {
  var i = 0;
  while (i < children.length) {
    var node = children.eq(i);
    var result;

    if (node.is(BRANCH_WRAPPER)) {
      // Transparently unwrap branches so the elements appear inline.
      traverseAndAppend(parent, node.children(), context);
      i++;
      continue;
    } else if (isCombat(node)) {
      result = toCombat(node, children.slice(i), context);
    } else if (isTrigger(node)) {
      result = toTrigger(node, context);
    } else if (isText(node, parent)) {
      result = toText(node, context);
    } else if (isRoleplay(node, parent)) {
      result = toRoleplay(node, children.slice(i), context);
    } else if (isEvent(node)) {
      result = toEvent(node, context);
    } else if (isChoice(node)) {
      result = toChoice(node, context);
    } else if (isInstruction(node)) {
      result = toInstruction(node, context);
    } else {
      throw new MarkdownParserError("Could not parse line (seen as a " + node.get(0).tagName + " element)", node.html(), "none");
    }

    parent.append(result.node);
    i += result.consumed;
  }
};

var toText = function(node, context) {
  format.dbg(context, "<p></p>");
  return {node: node, consumed: 1};
}

var toRoleplay = function(node, nodes, context) {
  var header = parseHeader(node);
  if (header) {
    context.title = header;
  }

  var elem = cheerio.load('<roleplay title="'+context.title+'"></roleplay>')
  var roleplay = elem("roleplay");

  if (node) {
    applyAttributes(roleplay, parseAttributes(node), context, ["icon"]);
  }
  format.dbg(context, elem.html());

  // Roleplay can either be explicitly defined in markdown, such as:
  //
  //   _roleplay title_
  //
  //   This is roleplay text
  //
  // or implicitly after branching logic, like this:
  //
  //   *   This is a choice
  //
  //   This is still roleplay text
  //
  // If we're in the first case, we want to ignore the first element in nodes
  // as it's the title, but in case of the secon we want to preserve it so that
  // we don't skip a paragraph.
  var start = (header) ? 1 : 0;
  var i = start;
  for (; i < nodes.length; i++) {
    var n = nodes.eq(i);
    if (parseHeader(n) || parseTrigger(n)) {
      break;
    }
  }
  traverseAndAppend(roleplay, nodes.slice(start, i), format.indent(context));
  return {node: roleplay, consumed: i};
};

var toCombat = function(node, nodes, context) {
  var elem = cheerio.load('<combat></combat>');
  var combat = elem("combat");

  var attribs = parseAttributes(node);

  // Add enemies as <e>, and delete it from attributes
  for (var i = 0; i < attribs.enemies.length; i++) {
    combat.append("<e>" + attribs.enemies[i] + "</e>");
  }
  delete attribs.enemies;

  applyAttributes(combat, attribs, context, ["icon"]);
  format.dbg(context, elem.html());

  // Get the event nodes (initially this is a BRANCH_WRAP, so there's only one)
  traverseAndAppend(combat, nodes.eq(1), format.indent(context));
  return {node: combat, consumed: 2};
};

var toChoice = function(node, context) {
  var data = firstChildText(node).split('{');
  var text = data[0].trim();
  var attribs = (data[1]) ? JSON.parse('{'+data[1]) : {};
  var elem = cheerio.load('<choice text="'+text+'"></choice>');
  var choice = elem("choice");

  applyAttributes(choice, attribs);
  format.dbg(context, elem.html());

  traverseAndAppend(choice, node.children().slice(1), format.indent(context));
  return {node: choice, consumed: 1};
};

var toEvent = function(node, context) {
  var data = firstChildText(node).split('{');
  var condition = data[0].split(" ")[1].trim();
  var attribs = (data[1]) ? JSON.parse('{'+data[1]) : {};
  var elem = cheerio.load('<event on="'+condition+'"></event>');
  var event = elem("event");

  applyAttributes(event, attribs);
  format.dbg(context, elem.html());

  traverseAndAppend(event, node.children().slice(1), format.indent(context));
  return {node: event, consumed: 1};
};

var toInstruction = function(node, context) {
  var elem = cheerio.load('<instruction></instruction>');
  var instruction = elem("instruction");
  format.dbg(context, elem.html());
  instruction.append(node.children());
  return {node: instruction, consumed: 1};
};

var toTrigger = function(node, context) {
  var action = firstChildText(node);
  var elem = cheerio.load('<trigger>'+action+'</trigger>');
  format.dbg(context, elem.html());
  return {node: elem("trigger"), consumed: 1};
};

var toQuest = function(node, nodes, context) {
  var elem = cheerio.load('<quest></quest>');
  var quest = elem('quest');

  // Assign quest metadata
  quest.attr('title', firstChildText(node));
  var meta = node.children().eq(1).text().split('\n');
  for(var i = 0; i < meta.length; i++) {
    var kv = meta[i].split(":");
    quest.attr(kv[0].trim().toLowerCase(), kv[1].trim());
  }

  // Exclude quest metadata elements in children
  traverseAndAppend(quest, node.children().slice(2), format.indent(context));
  return {node: quest, consumed: 1};
}

// TODO: Support operations

var convertQuestMarkdownToXML = function(text, verbose) {
  format.debug_info = verbose;

  var md = cheerio.load("<quest>" + markdown.toHTML(text) + "</quest>");
  var md_quest = md('quest');

  var quest_root = cheerio.load('<root></root>')('root');
  var result = toQuest(md_quest, null, {title: null, depth: 0, parentType: null});
  quest_root.append(result.node);

  return prettifyHTML(quest_root.html(), {indent_size: 2});
};

module.exports = {
  toXML: convertQuestMarkdownToXML,
  MarkdownParserError: MarkdownParserError
};