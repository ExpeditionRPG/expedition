import Spellcheck from './Spellcheck';
const Typo: any = require('typo-js');
const En: any = require('./dictionaries/en_US_combined');
// Built once: parsing the ~700KB en_US dictionary is the expensive part, and
// Typo instances are stateless as far as check() is concerned.
const dictionary = new Typo('en_US', En.aff, En.dic);

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
        getLength: jest.fn().mockReturnValue(text.length),
        getValue: jest.fn().mockReturnValue(text),
        getAllLines: jest.fn().mockReturnValue(text.split('\n')),
      };
    },
    removeGutterDecoration: jest.fn(),
    addGutterDecoration: jest.fn(),
    addMarker: jest.fn(),
    removeMarker: jest.fn(),
  };
}

describe('Spellcheck', () => {
  describe('Corpus Cleaning', () => {
    test('Keeps valid text', () => {
      expect(Spellcheck.cleanCorpus('Hello, this is valid text')).toEqual(
        'hello, this is valid text',
      );
    });

    test.skip('Removes ops', () => {
      /* TODO */
    });
    test.skip('Removes ID references', () => {
      /* TODO */
    });
    test.skip('Removes HTML tags', () => {
      /* TODO */
    });
  });
  describe('Word Count', () => {
    test.skip('returns correct amount even if multiple spaces between words', () => {
      /* TODO */
    });
    test.skip('returns correct amount even if ops and other elements present', () => {
      /* TODO */
    });
  });
  describe('getUniqueWords', () => {
    // The empty string is what broke the whole feature: getUniqueWords used to
    // filter empties *before* stripping non-word characters, so "#" survived
    // the filter and came out as ''. dictionary.check('') is false, so '' went
    // into the misspellings list, and /\b(|teh)\b/ matches the empty string at
    // column 0 of every line -- which made the marker loop bail immediately and
    // no document ever got a marker.
    test('never returns an empty string', () => {
      expect(Spellcheck.getUniqueWords('a # b -- c')).toEqual(['a', 'b', 'c']);
    });

    test('strips punctuation but keeps apostrophes', () => {
      expect(Spellcheck.getUniqueWords("don't stop, now!")).toEqual([
        "don't",
        'stop',
        'now',
      ]);
    });

    test('drops tokens with no letters at all', () => {
      // A bare "'" is a legal NOT_WORD survivor, and /\b(')\b/ would match the
      // apostrophe inside every contraction in the document.
      expect(Spellcheck.getUniqueWords("' 42 ---")).toEqual([]);
    });

    test('returns each word once', () => {
      expect(Spellcheck.getUniqueWords('cat dog cat')).toEqual(['cat', 'dog']);
    });
  });

  describe('Spellcheck', () => {
    test.skip('allows enemy names', () => {
      // Currently unreachable: IGNORE is Object.keys(ENCOUNTERS), which are
      // multi-word lowercase names ('arcane devourer'), while getUniqueWords
      // yields single tokens. Reported separately.
    });
    // Every one of these documents contains a standalone punctuation token (a
    // markdown bullet, an em-dash) because that is exactly what used to break
    // the feature: such a token strips down to '' and poisons the misspellings
    // regex. On the unfixed code these three tests produce no markers at all.
    test('catches misspelled English words', () => {
      const session = fakeSession('* teh quick brown fox');
      const sp = new Spellcheck(session, dictionary);
      expect(sp.spellcheck()).toEqual(true);

      expect(session.addGutterDecoration).toHaveBeenCalledWith(0, 'misspelled');
      expect(session.addMarker).toHaveBeenCalledTimes(1);
      const [range, clazz, type, inFront] = session.addMarker.mock.calls[0];
      expect(clazz).toEqual('misspelled');
      expect(type).toEqual('typo');
      expect(inFront).toEqual(true);
      // "teh" is on row 0, columns 2-5.
      expect(range.start.row).toEqual(0);
      expect(range.start.column).toEqual(2);
      expect(range.end.row).toEqual(0);
      expect(range.end.column).toEqual(5);
    });

    test('does not flag correctly spelled words', () => {
      const session = fakeSession(
        'the quick brown fox jumps over the lazy dog',
      );
      const sp = new Spellcheck(session, dictionary);
      expect(sp.spellcheck()).toEqual(true);

      expect(session.addMarker).not.toHaveBeenCalled();
      expect(session.addGutterDecoration).not.toHaveBeenCalled();
    });

    test('does not flag a line that is only punctuation', () => {
      // The exact shape that used to poison the misspellings list.
      const session = fakeSession('the wizard (a man) is here. # -- !');
      const sp = new Spellcheck(session, dictionary);
      expect(sp.spellcheck()).toEqual(true);

      expect(session.addMarker).not.toHaveBeenCalled();
      expect(session.addGutterDecoration).not.toHaveBeenCalled();
    });

    test('catches multiple misspellings of the same word', () => {
      const session = fakeSession('- teh cat sat on teh mat');
      const sp = new Spellcheck(session, dictionary);
      expect(sp.spellcheck()).toEqual(true);

      expect(session.addGutterDecoration).toHaveBeenCalledTimes(1);
      expect(session.addMarker).toHaveBeenCalledTimes(2);
      const columns = session.addMarker.mock.calls.map(
        (c: any[]) => c[0].start.column,
      );
      expect(columns).toEqual([2, 17]);
    });

    test('marks misspellings on every line, not just the first', () => {
      const session = fakeSession(
        '* a good line\n* another teh line\n* fine again',
      );
      const sp = new Spellcheck(session, dictionary);
      expect(sp.spellcheck()).toEqual(true);

      expect(session.addGutterDecoration).toHaveBeenCalledTimes(1);
      expect(session.addGutterDecoration).toHaveBeenCalledWith(1, 'misspelled');
      expect(session.addMarker).toHaveBeenCalledTimes(1);
      expect(session.addMarker.mock.calls[0][0].start.row).toEqual(1);
    });
    test.skip('catches improper punctuation', () => {
      // const input = 'You(the wizard)are here.No more!You shout.';
    });
    test.skip('allows proper punctuation', () => {
      // const input = 'You (the wizard) are here. No more! You shout.';
    });
    test.skip('does not flag misspelled words inside of triggers or IDs', () => {
      /* TODO */
    });
    test.skip('does not flag misspelled words inside of triggers or IDs, even if misspelled words exist elsewhere in corpus', () => {
      /* TODO */
    });
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
