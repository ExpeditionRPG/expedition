const acequire: any = require('brace').acequire;
const { Range } = acequire('ace/range');
import { ENCOUNTERS } from 'app/Encounters';
import { setWordCount } from './actions/Editor';
import REGEX from './Regex';
import { store } from './Store';
const IGNORE = Object.keys(ENCOUNTERS);
// The trailing class is `[^\\s]*`, not `[^\s]*`: this argument is a string
// rather than a regex literal, so a single backslash collapsed to a plain `s`
// and the class read "any character except a lowercase s" instead of "any
// non-whitespace character".
const elementRegexes = new RegExp(
  '(' +
    [REGEX.HTML_TAG, REGEX.TRIGGER, REGEX.ID, REGEX.OP]
      .map((regex: any): string => {
        return regex.toString().match(REGEX.EXTRACT_REGEX)[1];
      })
      .join('|') +
    ')[^\\s]*',
  'gm',
);

export default class Spellcheck {
  private contentsModified = true;
  private dictionary: any;
  private session: any;
  private spellchecking = false;

  constructor(session: any, dictionary: any) {
    this.session = session;
    this.dictionary = dictionary;
  }

  // Cleanup includes:
  // lowercases (for search simplicity, since we aren't touching the editor's text)
  // removes zones we aren't spellchecking (html tags, ids, ops), including anything touching them,
  // for example "the {{singer}}'s mother"
  public static cleanCorpus(text: string): string {
    // load all of the regexes and pull out their contents so that we can merge them + apply flags
    text = text.toLowerCase().replace(elementRegexes, ' ');
    return text;
  }

  // Gets the number of words in the text
  // Most accurage if text has already been cleaned
  public static getWordCount(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  // Return a list of all unique words in the provided text
  // after removing newlines and trimming out empty spaces and non-word characters
  public static getUniqueWords(text: string): string[] {
    return (
      text
        // newlines -> space
        .replace(/\n/g, ' ')
        // split to array of words on spaces
        .split(' ')
        // remove non-word characters
        .map((s: string): string => s.replace(REGEX.NOT_WORD, ''))
        // Drop anything that is not a word. This has to run *after* the strip,
        // not before it: a token like "#" or "--" is non-empty going in and
        // becomes '' coming out, and an '' in this list is fatal downstream --
        // dictionary.check('') is false, so '' joins the misspellings, and
        // /\b(|teh)\b/ then matches the empty string at column 0 of every line,
        // which made spellcheck() bail before adding a single marker for any
        // document. NOT_WORD keeps apostrophes (for "don't"), so require at
        // least one letter rather than just a non-empty string -- a bare "'"
        // would otherwise match inside every contraction.
        .filter((s: string): boolean => /[a-zA-Z]/.test(s))
        // only return the first instance of each word
        .filter(
          (s: string, i: number, arr: string[]): boolean =>
            arr.indexOf(s) === i,
        )
    );
  }

  public onChange() {
    this.contentsModified = true;
  }

  // Spellchecks the instance's Ace session; returns false if it skipped (ie contents not modified), true if it ran
  public spellcheck() {
    if (!this.contentsModified || this.spellchecking) {
      return false;
    }

    this.spellchecking = true;

    try {
      // remove existing spellcheck markers
      for (const k of Object.keys(this.session.getMarkers(true))) {
        this.session.removeMarker(k);
      }
      for (let i = this.session.getDocument().getLength() - 1; i >= 0; i--) {
        this.session.removeGutterDecoration(i, 'misspelled');
      }

      const text = Spellcheck.cleanCorpus(
        this.session.getDocument().getValue(),
      );
      store.dispatch(setWordCount(Spellcheck.getWordCount(text)));
      const words = Spellcheck.getUniqueWords(text);

      // get list of invalid words in corpus (aka not in dictionary or our list of exceptions)
      const misspellings = words.filter((word: string): boolean => {
        return (
          !this.dictionary.check(word) &&
          IGNORE.indexOf(word.toLowerCase()) === -1
        );
      });

      // Nothing to highlight. Bailing here also avoids building /\b()\b/,
      // which matches the empty string everywhere.
      if (misspellings.length === 0) {
        return true;
      }

      // create a regex to find all instances of the known mispelled words in the corpus
      const misspellingsRegex = new RegExp(
        '\\b(' + misspellings.join('|') + ')\\b',
        'g',
      );
      // highlight all instances of all bad words in the document
      // since we need to reference row + column for markers, easiest way is to go row-by-row
      this.session
        .getDocument()
        .getAllLines()
        .forEach((line: string, i: number) => {
          // Before we check for misspellings, remove elements we don't want to check
          line = line.replace(elementRegexes, '');
          // The regex is /g and shared across lines, so start each line at 0.
          misspellingsRegex.lastIndex = 0;
          let match = misspellingsRegex.exec(line);
          if (match) {
            this.session.addGutterDecoration(i, 'misspelled');
          }
          while (match) {
            const range = new Range(
              i,
              match.index,
              i,
              match.index + match[0].length,
            );
            this.session.addMarker(range, 'misspelled', 'typo', true);
            match = misspellingsRegex.exec(line);
          }
        });
    } finally {
      // free up, even if there was an error (more robust)
      this.spellchecking = false;
      this.contentsModified = false;
    }
    return true;
  }
}
