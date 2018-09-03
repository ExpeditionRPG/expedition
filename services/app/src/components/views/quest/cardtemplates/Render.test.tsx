import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
import {generateIconElements} from './Render';

describe('Render', () => {
  describe('generateIconElements', () => {
    // NOTE: Since we're dangerously setting inner html, we can't
    // use enzyme in a more principled way (e.g. finding the img element,
    // ensuring it exists, that the class is set appropriately and the src attr is
    // properly set).
    test('makes half-size svg for [art] tags', () => {
      const result = shallow(generateIconElements('[art]', 'light')).html();
      expect(result).toContain('artHalf');
      expect(result).toContain('art.svg');
    });
    test('makes full-size svg for [art_full] tags', () => {
      const result = shallow(generateIconElements('[art_full]', 'light')).html();
      expect(result).toContain('artFull');
      expect(result).toContain('art.svg');
    });
    test('makes half-size png for [art_png] tags', () => {
      const result = shallow(generateIconElements('[art_png]', 'light')).html();
      expect(result).toContain('artHalf');
      expect(result).toContain('art.png');
    });
    test('makes full-size png for [art_png_full] tags', () => {
      const result = shallow(generateIconElements('[art_png_full]', 'light')).html();
      expect(result).toContain('artFull');
      expect(result).toContain('art.png');
    });
    test('makes inline icon for :icon:', () => {
      const result = shallow(generateIconElements(':icon:', 'light')).html();
      expect(result).toContain('inline_icon');
      expect(result).toContain('icon_small.svg');
    });
    test('makes inline white icon for :icon_white: when theme is dark', () => {
      const result = shallow(generateIconElements(':icon_white:', 'dark')).html();
      expect(result).toContain('inline_icon');
      expect(result).toContain('icon_white_small.svg');
    });
  });

  describe('numberToWord', () => {
    test.skip('Converts numbers to words', () => { /* TODO */ });
    test.skip('Passes through numbers it does not recognize', () => { /* TODO */ });
  });

  describe('capitalizeFirstLetter', () => {
    test.skip('capitalizes the first letter', () => { /* TODO */ });
    test.skip('safely handles empty string', () => { /* TODO */ });
  });
});
