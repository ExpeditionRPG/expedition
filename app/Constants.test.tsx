import {REGEX} from './Constants'

describe('Constants', () => {
  describe('Regex', () => {
    describe('ART', () => {
      it('Properly identifies [art]', () => {
        const test = '<p>[fae]</p>';
        expect(test.match(REGEX.ART)).toEqual(['[fae]']);
      });
      it('Passes on non-art text', () => {
        const test = '<p>Test foo</p>';
        expect(test.match(REGEX.ART)).toEqual(null);
      });
    });
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
    describe('ICON', () => {
      it('Properly identifies :icon:', () => {
        const test = '<p>:fae:</p>';
        expect(test.match(REGEX.ICON)).toEqual([':fae:']);
      });
      it('Passes on non-icon text', () => {
        const test = '<p>Test foo</p>';
        expect(test.match(REGEX.ICON)).toEqual(null);
      });
    });
  });
});
