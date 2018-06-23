const acequire: any = (require('brace') as any).acequire;
const {Range} = acequire('ace/range');
import REGEX from './Regex'
import {store} from './Store'
import {setWordCount} from './actions/Editor'
import {ENCOUNTERS} from 'app/Encounters'
const IGNORE = Object.keys(ENCOUNTERS);
const elementRegexes = new RegExp('(' + [REGEX.HTML_TAG, REGEX.TRIGGER, REGEX.ID, REGEX.OP].map((regex: any): string => {
  return regex.toString().match(REGEX.EXTRACT_REGEX)[1];
}).join('|') + ')[^\s]*', 'gm');

export default class Spellcheck {
  private contentsModified = true;
  private dictionary: any;
  private markersPresent: any[] = [];
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
  static cleanCorpus(text: string): string {
    // load all of the regexes and pull out their contents so that we can merge them + apply flags
    text = text.toLowerCase().replace(elementRegexes, ' ');
    return text;
  }

  // Gets the number of words in the text
  // Most accurage if text has already been cleaned
  static getWordCount(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  // Return a list of all unique words in the provided text
  // after removing newlines and trimming out empty spaces and non-word characters
  static getUniqueWords(text: string): string[] {
    return text
      .replace(/\n/g, ' ') // newlines -> space
      .split(' ') // split to array of words on spaces
      .filter((s: string): boolean => { return (Boolean(s) && s.length > 0); }) // remove empty strings
      .map((s: string): string => { return s.replace(REGEX.NOT_WORD, ''); }) // remove non-word characters
      .filter((s: string, i: number, arr: string[]): boolean => { return arr.indexOf(s) === i; }); // only return the first instance of each word
  }

  onChange() {
    this.contentsModified = true;
  }

  // Spellchecks the instance's Ace session; returns false if it skipped (ie contents not modified), true if it ran
  spellcheck() {
    if (!this.contentsModified || this.spellchecking) {
      return false;
    }

    this.spellchecking = true;
    const start = Date.now();

    try {
      // remove existing spellcheck markers
      for (const i in this.markersPresent) {
        this.session.removeMarker(this.markersPresent[i]);
      }
      this.markersPresent = [];
      for (let i = this.session.getDocument().getLength() - 1; i >= 0; i--) {
        this.session.removeGutterDecoration(i, 'misspelled');
      }

      const text = Spellcheck.cleanCorpus(this.session.getDocument().getValue());
      store.dispatch(setWordCount(Spellcheck.getWordCount(text)));
      const words = Spellcheck.getUniqueWords(text);

      // get list of invalid words in corpus (aka not in dictionary or our list of exceptions)
      const misspellings = words.filter((word: string): boolean => {
        return (!this.dictionary.check(word) && IGNORE.indexOf(word.toLowerCase()) === -1);
      });

      // create a regex to find all instances of the known mispelled words in the corpus
      const misspellingsRegex = new RegExp('\\b(' + misspellings.join('|') + ')\\b', 'g');
      // highlight all instances of all bad words in the document
      // since we need to reference row + column for markers, easiest way is to go row-by-row
      this.session.getDocument().getAllLines().forEach((line: string, i: number) => {
        // Before we check for misspellings, remove elements we don't want to check
        line = line.replace(elementRegexes, '');
        let match = misspellingsRegex.exec(line);
        if (match && match[0] !== '') { this.session.addGutterDecoration(i, 'misspelled'); }
        while (match && match[0] !== '') {
          const range = new Range(i, match.index, i, match.index + match[0].length);
          this.markersPresent[this.markersPresent.length] = this.session.addMarker(range, 'misspelled', 'typo', true);
          match = misspellingsRegex.exec(line);
        }
      });
    } finally { // free up, even if there was an error (more robust)
      this.spellchecking = false;
      this.contentsModified = false;
      console.log('Spellcheck took ' + (Date.now() - start) + 'ms');
      return true;
    }
  }
}
