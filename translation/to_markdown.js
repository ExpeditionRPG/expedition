var cheerio = require('cheerio');
var format = require('./format');

// TODO: Provide line numbers
function XMLParserError(message, html, usage) {
    this.name = 'XMLParserError';
    this.message = message;
    this.stack = (new Error()).stack;
    this.line = html
    this.usage = usage;
}
XMLParserError.prototype = new Error;

function formatRoleplay(node, context) {
  try {
    var result = "";

    var attrs = {};
    if (node.attr("icon") !== context.icon) {
      context.icon = node.attr("icon");
      attrs["icon"] = context.icon;
    }
    if (node.attr("id")) {
      attrs["id"] = node.attr("id");
    }

    // Only repeat roleplay title if there's a previous card with the exact same name.
    if (context.title !== node.attr('title') || node.prev().is('roleplay')) {
      context.title = node.attr('title');
      result += format.at(context, "_" + context.title + "_" + ((Object.keys(attrs).length) ? (" " + JSON.stringify(attrs)) : "") + "\n");
    }

    var ps = node.children('p');
    for (var i = 0; i < ps.length; i++) {
      var lines = ps.eq(i).html()
        .replace(/ +(?= )/g, '')
        .replace(/\&quot;/g, "\"")
        .replace(/\&apos;/g, "'")
        .replace(/<em>|<\/em>/g, "_")
        .replace(/<strong>|<\/strong>/g, "**")
        .replace(/\n/g, "")
        .split('\n');
      for (var j = 0; j < lines.length; j++) {
        result += format.at(context, lines[j].trim());
      }
      result += "\n";
    }
  } catch (e) {
    throw new XMLParserError("Failed to format roleplay: " + e.message, node.html(), "none");
  }
  // For now, we make the assumption that all QDL elements occur *after* description.
  // and that they aren't interleaved.
  return result + traverse(node.children(":not(p)"), context);
}

function formatInstruction(node, context) {
  try {
    var result = "";
    var ps = node.children('p');

    if (!ps.length) {
      result = format.at(context, "> " + node.text().trim() + "\n");
    } else {
      for (var i = 0; i < ps.length; i++) {
        // TODO: Also convert innards to markdown.
        // Replace 3 or more spaces with nothin'.
        var lines = ps.eq(i).html()
          .replace(/ +(?= )/g, '')
          .replace(/\&quot;/g, "\"")
          .replace(/\&apos;/g, "'")
          .split('\n');
        for (var j = 0; j < lines.length; j++) {
          result += format.at(context, "> " + lines[j].trim());
        }
        result += "\n";
      }
    }

    return result;
  } catch (e) {
    throw new XMLParserError("Failed to format instruction: " + e.message, node.html(), "none");
  }
}

function formatEvent(node, context) {
  try {
    var link = node.attr('goto');
    var result = format.at(context, "*   on " + node.attr('on') + ((link) ? JSON.stringify({goto: link}) : "") + "\n");
  } catch (e) {
    throw new XMLParserError("Failed to format event: " + e.message, node.html(), "none");
  }
  return result + traverse(node.children(), format.indent(context));
}

function formatChoice(node, context) {
  try {
    var link = node.attr('goto');
    var result = format.at(context, "*   " + node.attr('text') + ((link) ? JSON.stringify({goto: link}) : "") + "\n");
  } catch (e) {
    throw new XMLParserError("Failed to format choice: " + e.message, node.html(), "none");
  }
  return result + traverse(node.children(), format.indent(context));
}

function formatCombat(node, context) {
  try {
    var meta = {enemies: []};
    var enemies = node.children('e');
    for(var i = 0; i < enemies.length; i++) {
      meta.enemies.push(enemies.eq(i).text());
    }
    if (node.attr('icon') !== context.icon) {
      meta.icon = node.attr('icon');
      context.icon = meta.icon;
    }

    var result = format.at(context, "_combat_ " + JSON.stringify(meta) + "\n");
  } catch (e) {
    throw new XMLParserError("Failed to format combat: " + e.message, node.html(), "none");
  }
  return result + traverse(node.children(":not(e)"), context);
}

function formatTrigger(node, context) {
  try {
    var result = format.at(context, "**" + node.text() + "**\n");
  } catch (e) {
    throw new XMLParserError("Failed to format trigger: " + e.message, node.html(), "none");
  }
  return result + traverse(node.children(), context);
}

function formatQuest(node, context) {
  try {
    // Parse headers
    var result = format.at(context, "# " + node.attr('title'));

    var attrs = [
      "summary",
      "author",
      "email",
      "url",
      "min-players",
      "max-players",
      "min-time-minutes",
      "max-time-minutes"
    ];
    for (var i = 0; i < attrs.length; i++) {
      var v = node.attr(attrs[i]);
      if (v) {
        var formatted_attr = attrs[i].replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        result += format.at(context, formatted_attr+": " + v);
      }
    }
    result += "\n";
  } catch (e) {
    throw new XMLParserError("Failed to format quest: " + e.message, "unknown", "none");
  }
  return result + traverse(node.children(), context);
}

function traverse(nodes, context) {
  var result = "";
  var options = {
    "roleplay": formatRoleplay,
    "instruction": formatInstruction,
    "event": formatEvent,
    "combat": formatCombat,
    "choice": formatChoice,
    "trigger": formatTrigger,
  };

  for (var i = 0; i < nodes.length; i++) {
    if (!options[nodes.get(i).tagName]) {
      throw new XMLParserError("Failed to parse node with tag name " + nodes.get(i).tagName, "unknown", "none");
    }
    result += options[nodes.get(i).tagName](nodes.eq(i), context);
  }
  return result;
}

function convertQuestXMLToMarkdown(text, verbose) {
  format.debug_info = verbose;
  var $ = cheerio.load(text);
  return formatQuest($("quest"), {depth: 0});
}

module.exports = {
  toMarkdown: convertQuestXMLToMarkdown,
  XMLParserError: XMLParserError
};