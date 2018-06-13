import {sanitizeStyles} from './Renderer'

const expect: any = require('expect');

describe('Renderer', () => {

  describe('sanitizeStyles', () => {
    it('keeps whitelist <strong>, <em> and <del>', () => {
      const input = '<strong>1</strong><b>1</b><em>2</em><i>2</i><del>3</del>';
      const output = sanitizeStyles(input);
      const expected = '<b>1</b><b>1</b><i>2</i><i>2</i><del>3</del>';
      expect(output).toEqual(expected);
    });
    it('removes all other HTML tags, including whitelists with attributes', () => {
      const input = '<strong style="foo">1</strong><div>2</div><img/>3';
      const output = sanitizeStyles(input);
      const expected = '123';
      expect(output).toEqual(expected);
    });
    it('does not remove HTML-like text', () => {
      const input = 'Roll < 9 to continue\nRoll > 10 to win';
      const output = sanitizeStyles(input);
      const expected = input;
      expect(output).toEqual(expected);
    });
    it('turns markdown styles into HTML tags', () => {
      const input = '**1**__1__*2*_2_~~3~~';
      const output = sanitizeStyles(input);
      const expected = '<b>1</b><b>1</b><i>2</i><i>2</i><del>3</del>';
      expect(output).toEqual(expected);
    });
    it('turns turns two separate markdown styles into two separate tags', () => {
      const input = '_i1_ teddy bears are cute _i2_';
      const output = sanitizeStyles(input);
      const expected = '<i>i1</i> teddy bears are cute <i>i2</i>';
      expect(output).toEqual(expected);
    });
    it('turns turns two separate HTML styles into two separate tags', () => {
      const input = '<i>i1</i> teddy bears are cute <i>i2</i>';
      const output = sanitizeStyles(input);
      const expected = '<i>i1</i> teddy bears are cute <i>i2</i>';
      expect(output).toEqual(expected);
    });
    it('does not stylize inside of ops', () => {
      const input = '{{_.run()}}_1_{{_.stop()}}{_text in curlies_}';
      const output = sanitizeStyles(input);
      const expected = '{{_.run()}}<i>1</i>{{_.stop()}}{<i>text in curlies</i>}';
      expect(output).toEqual(expected);
    });
    it('stylizes around ops', () => {
      const input = '_{{_.run()}}_';
      const output = sanitizeStyles(input);
      const expected = '<i>{{_.run()}}</i>';
      expect(output).toEqual(expected);
    });
    it('preserves the contents of multiple ops', () => {
      const input = '_{{_.run()}} {{_.two()}}_';
      const output = sanitizeStyles(input);
      const expected = '<i>{{_.run()}} {{_.two()}}</i>';
      expect(output).toEqual(expected);
    });
    it('stylizes around ops and text', () => {
      const input = '_text{{_.run()}}text_';
      const output = sanitizeStyles(input);
      const expected = '<i>text{{_.run()}}text</i>';
      expect(output).toEqual(expected);
    });
    it('stylizes around ops, ignoring quoted closing brackets in ops string', () => {
      const input = '_text{{foo = "a}}a" & _.run()}}text_';
      const output = sanitizeStyles(input);
      const expected = '<i>text{{foo = "a}}a" & _.run()}}text</i>';
      expect(output).toEqual(expected);
    });
    it('stylizes around ops, ignoring dictionaries in ops string', () => {
      const input = '_text{{var = {a: {b: "5}}"}} & _.run()}}text_';
      const output = sanitizeStyles(input);
      const expected = '<i>text{{var = {a: {b: "5}}"}} & _.run()}}text</i>';
      expect(output).toEqual(expected);
    });
    it('stylizes around ops, ignoring escaped characters', () => {
      const input = '_text{{foo = "\\"}}a" & _.run()}}text_';
      const output = sanitizeStyles(input);
      const expected = '<i>text{{foo = "\\"}}a" & _.run()}}text</i>';
      expect(output).toEqual(expected);
    });
    it('stylizes around mangled ops', () => {
      // This op doesn't have a chance of parsing correctly, but
      // that's no reason to break styling.
      const input = '_text{{ { & _.run()}}text_';
      const output = sanitizeStyles(input);
      const expected = '<i>text{{ { & _.run()}}text</i>';
      expect(output).toEqual(expected);
    })
    it('properly handles _ inside of [art_file_full]', () => {
      const input = '[art_file_full]';
      const output = sanitizeStyles(input);
      const expected = input;
      expect(output).toEqual(expected);
    });
    it('properly handles multiple [art] and :icon:', () => {
      const input = 'Text containing many :roll: and [art_file_full] and :roll_white_small: and [art_white]';
      const output = sanitizeStyles(input);
      const expected = input;
      expect(output).toEqual(expected);
    });
    it('collapses nested styles', () => {
      const input = '<strong><strong>1</strong></strong><em><em>2</em></em><del><del>3</del></del>';
      const output = sanitizeStyles(input);
      const expected = '<b>1</b><i>2</i><del>3</del>';
      expect(output).toEqual(expected);
    });
  });
});
