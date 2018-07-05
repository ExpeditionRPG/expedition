// import Spellcheck from './Spellcheck'
// const Typo: any = require('typo-js');
// const En: any = require('./dictionaries/en_US_combined');
// const dictionary = new Typo('en_US', En.aff, En.dic);
// const spellcheck = new Spellcheck({}, dictionary);
// TODO create fake ace session... that also needs a way to monitor the errors returned

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
    it('catches improper punctuation', () => {
      // const input = 'You(the wizard)are here.No more!You shout.';
    });
    it('allows proper punctuation', () => {
      // const input = 'You (the wizard) are here. No more! You shout.';
    });
    it('does not flag misspelled words inside of triggers or IDs');
    it('does not flag misspelled words inside of triggers or IDs, even if misspelled words exist elsewhere in corpus');
    it('does not flag suffixes touching ops', () => {
      // const input = "The {{singer}}'s mother, now that's not a bug";
      // expected: no spelling errors
    });
  });
});
