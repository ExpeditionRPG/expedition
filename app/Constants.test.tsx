import {REGEX} from './Constants'

describe('Constants', () => {
  describe('Regex', () => {
    describe('HTML_TAG', () => {
      it('Returns single-line HTML tags', () => {
        const test = '<p></p>';
        expect(test.match(REGEX.HTML_TAG)).toEqual(['<p>', '</p>']);
      });

      it('Returns multi-line HTML tags', () => {
        const test = `<p>Foo
        </p
        >`;
        expect(test.match(REGEX.HTML_TAG)).toEqual(['<p>', `</p
        >`]);
      });

      it('Does not return non-HTML tags', () => {
        const test = 'Some plaintext';
        expect(test.match(REGEX.HTML_TAG)).toEqual(null);
      });
    });
  });
});
