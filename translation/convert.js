var fs = require('fs');
var toMarkdown = require('./to_markdown');
var toXML = require('./to_xml');
var toGraph = require('./to_graph');

var convertQuest = function(data, intype, outtype) {
  // XML <=> Markdown
  // XML => Graph
  // Markdown => Graph
  if (intype === 'xml' && outtype === 'md') {
    return toMarkdown(data);
  } else if (intype === 'md' && outtype === 'xml') {
    return toXML(data);
  } else if (intype === 'xml' && outtype === 'graph') {
    return toGraph(data);
  } else if (intype === 'md' && outtype === 'graph') {
    return toGraph(toXML(data));
  } else {
    throw new Error("Invalid translation from " + intype + " to " + outtype);
  }
};

var readConvertWrite = function(input_file, node_transform, output_file, verbose) {
  fs.readFile(input_file, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }

    var result = node_transform(data, verbose);

    if (verbose) {
      console.log("=========== RESULT: =============");
      console.log(result);
      console.log("=================================");
    }

    fs.writeFile(output_file, result, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("Wrote " + output_file);
    });
  });
};

if (require.main === module) {
  var path = require('path');
  var argv = require('yargs')
    .usage('Usage: $0 [input_file.md/input_file.xml] [output_file.md/output_file.xml] -v')
    .demand(2)
    .argv;

  input_ext = path.extname(argv._[0]);
  output_ext = path.extname(argv._[1]);
  if (input_ext === '.md' && output_ext === '.xml') {
    readConvertWrite(argv._[0], toXML, argv._[1], argv.v);
  } else if (input_ext === '.xml' && output_ext === '.md') {
    readConvertWrite(argv._[0], toMarkdown, argv._[1], argv.v);
  } else if (input_ext === '.xml' && output_ext === '.json') {
    readConvertWrite(argv._[0], toGraph, argv._[1], argv.v);
  } else {
    throw new Error("No valid conversion from *"+input_ext+" to *"+output_ext);
  }
} else {
  module.exports = convertQuest;
}