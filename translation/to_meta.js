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

      result['meta_' + formatted_attr] = v;
    }
  }
  return result;
}

function convertQuestXMLToMetadata(text) {
  var $ = cheerio.load(text);
  return formatQuest($("quest"), {depth: 0});
}

module.exports = convertQuestXMLToMetadata;