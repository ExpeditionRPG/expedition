var cheerio = require('cheerio');

function formatQuest(node, context) {
  // Parse headers
  var result = {};

  var attrs = [
    "title",
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
      result[attrs[i]] = v;
    }
  }
  return result;
}

function convertQuestXMLToMetadata(text) {
  var $ = cheerio.load(text);
  return formatQuest($("quest"), {depth: 0});
}

module.exports = convertQuestXMLToMetadata;