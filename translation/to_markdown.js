var cheerio = require('cheerio');
var format = require('./format');

function formatRoleplay(node, context) {
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

  // For now, we make the assumption that all QDL elements occur *after* description.
  // and that they aren't interleaved.
  return result + traverse(node.children(":not(p)"), context);
}

function formatInstruction(node, context) {
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
}

function formatEvent(node, context) {
  var link = node.attr('goto');
  var result = format.at(context, "*   on " + node.attr('on') + ((link) ? JSON.stringify({goto: link}) : "") + "\n");
  return result + traverse(node.children(), format.indent(context));
}

function formatChoice(node, context) {
  var link = node.attr('goto');
  var result = format.at(context, "*   " + node.attr('text') + ((link) ? JSON.stringify({goto: link}) : "") + "\n");
  return result + traverse(node.children(), format.indent(context));
}

function formatCombat(node, context) {
  var meta = {enemies: []};
  var enemies = node.children('e');
  for(var i = 0; i < enemies.length; i++) {
    meta.enemies.push(enemies.eq(i).text());
  }
  if (node.attr('icon') !== context.icon) {
    meta.icon = node.attr('icon');
    context.icon = meta.icon;
  }

  result = format.at(context, "_combat_ " + JSON.stringify(meta) + "\n");
  return result + traverse(node.children(":not(e)"), context);
}

function formatTrigger(node, context) {
  var result = format.at(context, "**" + node.text() + "**\n");
  return result + traverse(node.children(), context);
}

function formatQuest(node, context) {
  // Parse headers
  result = format.at(context, "# " + node.attr('title'));

  var attrs = [
    "summary",
    "author",
    "email",
    "url",
    "recommended-min-players",
    "recommended-max-players",
    "min-time-minutes",
    "max-time-minutes"
  ];
  for (var i = 0; i < attrs.length; i++) {
    var v = node.attr(attrs[i]);
    if (v) {
      result += format.at(context, attrs[i]+": " + v);
    }
  }
  result += "\n";

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
    try {
      result += options[nodes.get(i).tagName](nodes.eq(i), context);
    } catch (e) {
      console.log("Failed to parse node with tag name " + nodes.get(i).tagName);
      throw e;
    }
  }
  return result;
}

function convertQuestXMLToMarkdown(text, verbose) {
  format.debug_info = verbose;
  var $ = cheerio.load(text);
  return formatQuest($("quest"), {depth: 0});
}

module.exports = convertQuestXMLToMarkdown;