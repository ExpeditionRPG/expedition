var fs = require('fs');
var Tabletop = require('./tabletop.js');

// Source directory that provides the initial global config info
var src = "./globals_src.js";

// Result directory to store the generated files.
var dest = "../scripts/globals.json";

// ID of the spreadsheet to load
var docID = "1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM";


function parseEncounters(rows) {
  var result = {};
  console.log("Parsing encounters...");
  rows.forEach(function(row) {
    if (row.Comment) {
      return;
    }
    console.log(row.name);
    result[row.name] = {name: row.name, health: parseInt(row.health), tier: parseInt(row.tier), class: row.class};
  });
  return result;
}

function main(rows) {
  var globals = require(src); //Provides dataGlobal variable
  globals.encounters = parseEncounters(rows);
  fs.writeFile(dest, JSON.stringify(globals, null, 2), function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + dest);
    }
  });
}

Tabletop.init({ // jshint ignore:line
    key: docID,
    wanted: ["Encounter"],
    simpleSheet: true,
    callback: main
});

