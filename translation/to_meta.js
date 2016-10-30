var cheerio = require('cheerio');

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
    "minplayers",
    "maxplayers",
    "mintimeminutes",
    "maxtimeminutes"
  ];

  for (var i = 0; i < attrs.length; i++) {
    var v = node.attr(attrs[i]);
    if (v) {
      var formatted_attr = attrs[i].replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });

      // TODO: Clean up this later
      if (v === 'minplayers' || v === 'maxplayers' || v === 'mintimeminutes' || v === 'maxtimeminutes') {
        v = parseInt(v);
      }

      result[attrs[i]] = v;
    }
  }
  return result;
}

function convertQuestMarkdownToMetadata(text) {
  var split = text.split('\n');
  result = {title: split[0].substr(1).trim()};
  for(var i = 1; i < split.length; i++) {
    var line = split[i].trim();
    if (line === '') {
      return result;
    }
    var kv = line.split(":");
    result[kv[0].trim().toLowerCase()] = kv[1].trim();
  }
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