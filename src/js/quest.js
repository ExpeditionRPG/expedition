var locations = [
  "lagoon": {
    "names": ["The Black Lagoon", "the Lagoon", "it"],
    "desc": [
      "a marshland of blight and disease", 
      "where the bones of hundreds of dead travelers form the only solid ground for miles"
    ],
    "environment": ["Forest", "Underground"],
  },
];

var people = [
  "thiefqueen": {
    "names": ["The Thief Queen", "the Queen", "she"],
    "desc": ["her royal quickfingers", "a cultured rogue who is quick to anger"], 
  },
];

var things = [
  "amonrelic": {
    "names": ["The Relic of Amon", "the Relic", "it"],
    "desc": ["the shiny idol", "a golden idol sought by many for its religious history"],
  },
];

var quest = {
  "defeat": {
    "stages": [
      "%P1.names[0]% has chosen your party to collect a bounty on the head of %P2%. %reason%",
      ""
    ],
    "vars": {
      // Spurned lover
      // Owes a debt
      // Killed their something or other
      // 
    }
  }
}


str = str.replace(/%\w+%/g, function(all) {
   return replacements[all] || all;
});