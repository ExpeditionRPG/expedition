import Spellcheck from './spellcheck'

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
  describe('Spellcheck', () => {
    it('Allows enemy names');
    it('Catches misspelled English words');
    it('Catches multiple misspellings of the same word');
  })
});
