import Spellcheck from './Spellcheck'
// const Typo: any = require('typo-js');
// const En: any = require('./dictionaries/en_US_combined');
// const dictionary = new Typo('en_US', En.aff, En.dic);
// const spellcheck = new Spellcheck({}, dictionary);
// TODO create fake ace session... that also needs a way to monitor the errors returned

function fakeSession(text?: string) {
  text = text || '';
  return {
    getMarkers: () => {
      return {
        '5': true,
        '6': true,
      };
    },
    getDocument: () => {
      return {
        getLength: jasmine.createSpy('getLength').and.returnValue((text || '').length),
        getValue: jasmine.createSpy('getValue').and.returnValue(text),
        getAllLines: jasmine.createSpy('getAllLines').and.returnValue((text || '').split('\n')),
      };
    },
    removeGutterDecoration: jasmine.createSpy('removeGutterDecoration'),
    addGutterDecoration: jasmine.createSpy('addGutterDecoration'),
    addMarker: jasmine.createSpy('addMarker'),
    removeMarker: jasmine.createSpy('removeMarker'),
  };
}

describe('Spellcheck', () => {
  describe('Corpus Cleaning', () => {
    test('Keeps valid text', () => {
      expect(Spellcheck.cleanCorpus('Hello, this is valid text')).toEqual('hello, this is valid text');
    });

    test.skip('Removes ops', () => { /* TODO */ });
    test.skip('Removes ID references', () => { /* TODO */ });
    test.skip('Removes HTML tags', () => { /* TODO */ });
  });
  describe('Word Count', () => {
    test.skip('returns correct amount even if multiple spaces between words', () => { /* TODO */ });
    test.skip('returns correct amount even if ops and other elements present', () => { /* TODO */ });
  });
  describe('Spellcheck', () => {
    test.skip('allows enemy names', () => { /* TODO */ });
    test.skip('catches misspelled English words', () => { /* TODO */ });
    test.skip('catches multiple misspellings of the same word', () => { /* TODO */ });
    test.skip('catches improper punctuation', () => {
      // const input = 'You(the wizard)are here.No more!You shout.';
    });
    test.skip('allows proper punctuation', () => {
      // const input = 'You (the wizard) are here. No more! You shout.';
    });
    test.skip('does not flag misspelled words inside of triggers or IDs', () => { /* TODO */ });
    test.skip('does not flag misspelled words inside of triggers or IDs, even if misspelled words exist elsewhere in corpus', () => { /* TODO */ });
    test.skip('does not flag suffixes touching ops', () => {
      // const input = "The {{singer}}'s mother, now that's not a bug";
      // expected: no spelling errors
    });
    test('clears old spelling markers', () => {
      const session = fakeSession();
      const sp = new Spellcheck(session, null);
      sp.spellcheck();
      expect(session.removeMarker).toHaveBeenCalledWith('5');
      expect(session.removeMarker).toHaveBeenCalledWith('6');
    });
  });
});
