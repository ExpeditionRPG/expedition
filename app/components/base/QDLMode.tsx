var brace = require('brace') as any;
var oop = brace.acequire("ace/lib/oop") as any;
var TextMode = (brace.acequire("ace/mode/text") as any).Mode;
var MatchingBraceOutdent = (brace.acequire("ace/mode/matching_brace_outdent") as any).MatchingBraceOutdent;

var MarkdownHighlightRules = (brace.acequire("ace/mode/markdown_highlight_rules") as any).MarkdownHighlightRules;
var QDLHighlightRules: any = function() {
  this.$rules = new MarkdownHighlightRules().getRules();

  let listblock = this.$rules["listblock"];
  for (let r in listblock) {
    if (listblock[r].token == "empty_line") {
      listblock[r].regex = /^\s*$/; // Match empty lines and whitespace too
      break;
    }
  }

  let start = this.$rules["start"];
  for (let s in start) {
    if (start[s].token === "markup.list") {
      start[s].regex = "^\\s*(?:[*+-]|\\d+\\.)\\s+";
      break;
    }
  }
};
oop.inherits(QDLHighlightRules, MarkdownHighlightRules);

export var QDLMode: any = function() {
    // set everything up
    this.HighlightRules = QDLHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    // TODO: Code folding
    //this.foldingRules = new MyNewFoldMode();

};
oop.inherits(QDLMode, TextMode);

(function() {
    // configure comment start/end characters
    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};

    this.getNextLineIndent = function(state: any, line: any, tab: any) {
      var indent = this.$getIndent(line);

      // Add some space right after a choice.
      if (line.trim().startsWith("* ")) {
        // TODO: Figure out why whitespace is required before newline to have correct syntax highlighting
        return " \n" + indent + "  ";
      }
      return indent;
    };

    this.checkOutdent = function(state: any, line: any, input: any) {
      return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state: any, doc: any, row: any) {
      return this.$outdent.autoOutdent(doc, row);
    };

    // TODO: create worker for live syntax checking/validation

}).call(QDLMode.prototype);