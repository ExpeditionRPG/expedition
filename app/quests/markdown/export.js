var markdown = require("markdown").markdown;
var cheerio = require('cheerio');
var fs = require('fs');
var prettifyHTML = require("html").prettyPrint;

var transmute = require('./transmute');
var traversal = require('./traversal');

if (process.argv.length < 3) {
  console.log("Usage: node export.js <input> <(optional) output>");
  process.exit(1);
}
var input_file = process.argv[2];
var output_file = process.argv[3] || "output.xml";

fs.readFile(input_file, 'utf8', function(err, data) {
  if (err) {
    return console.log(err);
  }
  var rawhtml = markdown.toHTML(data);
  console.log(rawhtml);

  var $ = cheerio.load("<quest>" + rawhtml + "</quest>");

  var result = transmute.toQuest($("quest").children().eq(0), $("quest").children().eq(1));
  var results = traversal.traverse($("quest > :not(:nth-child(1)):not(:nth-child(2))"), {title: null, depth: -1, parentType: null});
  var quest = result("quest");
  for (var i = 0; i < results.length; i++) {
    quest.append(results[i]);
  }
  var pretty_html = prettifyHTML(result.html(), {indent_size: 2});

  console.log("=========== RESULT: =============");
  console.log(pretty_html);
  console.log("=================================");

  fs.writeFile(output_file, pretty_html, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("Saved successfully to " + output_file);
  });
});
