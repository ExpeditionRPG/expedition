import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
import {generateIconElements} from './Render';

describe('Render', () => {
  describe('generateIconElements', () => {
    // NOTE: Since we're dangerously setting inner html, we can't
    // use enzyme in a more principled way (e.g. finding the img element,
    // ensuring it exists, that the class is set appropriately and the src attr is
    // properly set).
    it('makes half-size svg for [art] tags', () => {
      const result = shallow(generateIconElements('[art]', 'light')).html();
      expect(result).toContain('artHalf');
      expect(result).toContain('art.svg');
    });
    it('makes full-size svg for [art_full] tags', () => {
      const result = shallow(generateIconElements('[art_full]', 'light')).html();
      expect(result).toContain('artFull');
      expect(result).toContain('art.svg');
    });
    it('makes half-size png for [art_png] tags', () => {
      const result = shallow(generateIconElements('[art_png]', 'light')).html();
      expect(result).toContain('artHalf');
      expect(result).toContain('art.png');
    });
    it('makes full-size png for [art_png_full] tags', () => {
      const result = shallow(generateIconElements('[art_png_full]', 'light')).html();
      expect(result).toContain('artFull');
      expect(result).toContain('art.png');
    });
    it('makes inline icon for :icon:', () => {
      const result = shallow(generateIconElements(':icon:', 'light')).html();
      expect(result).toContain('inline_icon');
      expect(result).toContain('icon_small.svg');
    });
    it('makes inline white icon for :icon_white: when theme is dark', () => {
      const result = shallow(generateIconElements(':icon_white:', 'dark')).html();
      expect(result).toContain('inline_icon');
      expect(result).toContain('icon_white_small.svg');
    });
  });

  describe('numberToWord', () => {
    it('Converts numbers to words');
    it('Passes through numbers it does not recognize');
  });

  describe('capitalizeFirstLetter', () => {
    it('capitalizes the first letter');
    it('safely handles empty string');
  });
});
