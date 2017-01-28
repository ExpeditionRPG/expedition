/// <reference path="../../../typings/expect/expect.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../typings/custom/require.d.ts" />

import {sanitizeStyles} from './Renderer'

var expect: any = require('expect');


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
      const input = '**1***2*~~3~~';
      const output = sanitizeStyles(input);
      const expected = '<b>1</b><i>2</i><del>3</del>';
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
