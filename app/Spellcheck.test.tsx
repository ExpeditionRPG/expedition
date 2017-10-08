import Spellcheck from './Spellcheck'

// TODO(scott): Find an alternative to file loading for unit
// tests (allows us to continue to do browser-based testing)
//const Fs: any = require('fs');
const Expect: any = require('expect');
//const Typo: any = require('typo-js');

// patch to allow requiring txt files
/*
require.extensions['.txt'] = function (module: any, filename: string) {
  module.exports = Fs.readFileSync(filename, 'utf8');
};

const affData = require('./dictionaries/en_US_aff.txt');
const dicData = require('./dictionaries/en_US_dic.txt');
const dictionary = new Typo('en_US', affData, dicData);
*/

// const spellcheck = new Spellcheck(null, {}, dictionary);
// TODO create fake ace session

describe('Spellcheck', () => {
  describe('Corpus Cleaning', () => {
    it('Keeps valid text', () => {
      // const input = 'Hello, this is valid text';
      // const expected = input;
      // const output = Spellcheck.cleanCorpus(input);
      // expect(output).toEqual(expected);
    });

    it('Removes ops');
    it('Removes ID references');
    it('Removes HTML tags');
  });
  describe('Word Count', () => {
    it('returns correct amount even if multiple spaces between words');
    it('returns correct amount even if ops and other elements present');
  });
  describe('Spellcheck', () => {
    it('allows enemy names');
    it('catches misspelled English words');
    it('catches multiple misspellings of the same word');
    it('does not flag misspelled words inside of triggers or IDs');
    it('does not flag misspelled words inside of triggers or IDs, even if misspelled words exist elsewhere in corpus');
    it('does not flag suffixes touching ops', () => {
      // const input = "The {{singer}}'s mother, now that's not a bug";
      // expected: no spelling errors
    })
  })
});
