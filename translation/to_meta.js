var cheerio = require('cheerio');

function formatXMLKey(key) {
  return {
    'title': 'metaTitle',
    'summary': 'metaSummary',
    'min-players': 'metaMinPlayers',
    'max-players': 'metaMaxPlayers',
    'email': 'metaEmail',
    'url': 'metaUrl',
    'min-time-minutes': 'metaMinTimeMinutes',
    'max-time-minutes': 'metaMaxTimeMinutes',
    'author': 'metaAuthor'
  }[key] || key;
}

function formatQuest(node, context) {
  // TODO: Dedupe this against to_markdown
  // Parse headers
  var result = {};

  var attrs = [
    "title",
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

      // TODO: Clean up this later
      if (v === 'min-players' || v === 'max-players' || v === 'min-time-minutes' || v === 'max-time-minutes') {
        v = parseInt(v);
      }

      result[formatXMLKey(attrs[i])] = v;
    }
  }
  return result;
}

function formatKey(key) {
  return {
    'title': 'metaTitle',
    'summary': 'metaSummary',
    'minPlayers': 'metaMinPlayers',
    'maxPlayers': 'metaMaxPlayers',
    'email': 'metaEmail',
    'url': 'metaUrl',
    'minTimeMinutes': 'metaMinTimeMinutes',
    'maxTimeMinutes': 'metaMaxTimeMinutes',
    'author': 'metaAuthor'
  }[key] || key;
}

function convertQuestMarkdownToMetadata(text) {
  var split = text.split('\n');
  result = {metaTitle: split[0].substr(1).trim()};
  for(var i = 1; i < split.length; i++) {
    console.log(line);
    var line = split[i].trim();
    if (line === '') {
      return result;
    }
    var kv = line.split(":");
    result[formatKey(kv[0].trim())] = kv[1].trim();
  }
  console.log(result);
  return result;
}

function convertQuestXMLToMetadata(text) {
  var $ = cheerio.load(text);
  return formatQuest($("quest"), {depth: 0});
}

module.exports = {
  fromMarkdown: convertQuestMarkdownToMetadata,
  fromXML: convertQuestXMLToMetadata
};