import {combinedRegex, REGEX} from 'shared/Regex';
const acequire: any = (require('brace') as any).acequire;
const oop = acequire('ace/lib/oop') as any;
const {Range} = acequire('ace/range');
const TextMode = (acequire('ace/mode/text') as any).Mode;
const MatchingBraceOutdent = (acequire('ace/mode/matching_brace_outdent') as any).MatchingBraceOutdent;
const MarkdownHighlightRules = (acequire('ace/mode/markdown_highlight_rules') as any).MarkdownHighlightRules;

// designed with https://ace.c9.io/tool/mode_creator.html
const QDLHighlightRules: any = function() {
  this.$rules = new MarkdownHighlightRules().getRules();

  const listblock = this.$rules.listblock;
  for (const r in listblock) {
    if (listblock[r].token === 'empty_line') {
      listblock[r].regex = /^\s*$/; // Match empty lines and whitespace too
      break;
    }
  }

  // Override Markdown defaults for a better QDL experience
  // token names are separated by .'s; they're all applied as class ace_[token] to matching elements
  this.$rules.start = [
    /* tslint:disable:object-literal-sort-keys */
    {
      token: 'comment', // faded and italic
      regex: /^\s*(\/\/.*)|(\/\*.*\*\/)/,
    },
    {
      token: 'variable', // blue
      regex: combinedRegex([
        REGEX.OP,
        REGEX.TRIGGER,
        REGEX.ID,
      ]),
    },
    {
      token: 'heading', // red
      regex: /^\s*((> .*)|(_.*_))/,
    },
    {
      token: 'list', // yellow
      regex: /^\s*[*+-]\s+.*/,
    },
    {
      token: 'string', // green
      regex: combinedRegex([
        REGEX.ART,
        REGEX.ICON,
        REGEX.BOLD_ASTERISKS,
        REGEX.BOLD_UNDERSCORES,
        REGEX.ITALIC_ASTERISKS,
        REGEX.ITALIC_UNDERSCORES,
        REGEX.STRIKETHROUGH,
      ]),
    },
    {
      defaultToken: 'text.xml',
    },
    /* tslint:enable */
  ];
};
oop.inherits(QDLHighlightRules, MarkdownHighlightRules);

class QDLFoldMode {
  // least to most important; which is to say that folds end on lines of equal or greater importance
  // will fold all less important lines inside of them (ie titles will fold cards, but choices will stop at cards)
  public static foldingStartMarkers = [
    /(^\s*)(\* .*)/, // * choices
    /(^\s*)(_.*_)/, // _cards_
    /(^\s*)(# .*)/, // # titles
  ];
  public static foldingStartMarker = new RegExp(QDLFoldMode.foldingStartMarkers.map((x: any) => x.source).join('|'));

  private static getIndent(line: string): number {
    let indent = 0;
    while (line[indent] === ' ') {
      indent++;
    }
    return indent;
  }

  private static getImportance(line: string): number {
    // check against most important marker first (see foldingStartMarkers)
    for (let i = QDLFoldMode.foldingStartMarkers.length - 1; i >= 0; i--) {
      if (line.match(QDLFoldMode.foldingStartMarkers[i])) {
        return i;
      }
    }
    return -1;
  }

  public getFoldWidget(session: any, foldStyle: any, row: number): string {
      const line = session.getLine(row);
      return QDLFoldMode.foldingStartMarker.test(line) ? 'start' : '';
  }

  public getFoldWidgetRange(session: any, foldStyle: any, row: number): any {

      let line = session.getLine(row);

      if (!line.match(QDLFoldMode.foldingStartMarker)) {
        return;
      }

      const startRow = row;
      const startColumn = line.length;
      const maxRow = session.getLength();
      const startIndent = QDLFoldMode.getIndent(line);
      const startImportance = QDLFoldMode.getImportance(line);
      let endRow = maxRow;

      for (row += 1; row < maxRow; row++) {
        line = session.getLine(row);
        if (QDLFoldMode.getIndent(line) <= startIndent && QDLFoldMode.getImportance(line) >= startImportance) {
          endRow = row - 1;
          break;
        }
      }

      return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
  }
}

export const QDLMode: any = function() {
  // set everything up
  this.HighlightRules = QDLHighlightRules;
  this.$outdent = new MatchingBraceOutdent();
  this.foldingRules = new QDLFoldMode();
};
oop.inherits(QDLMode, TextMode);

(function() {
  // configure comment start/end characters
  this.lineCommentStart = '//';
  this.blockComment = {start: '/*', end: '*/'};

  this.getNextLineIndent = function(state: any, line: any, tab: any) {
    const indent = this.$getIndent(line);

    // Add some space right after a choice.
    if (line.trim().startsWith('* ')) {
      // TODO: Figure out why whitespace is required before newline to have correct syntax highlighting
      return ' \n' + indent + '  ';
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
