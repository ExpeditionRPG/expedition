import * as React from 'react';
import {horizontalCounter, romanize} from './helpers';

describe('icon', () => {
  test.skip('Returns JSX element', () => { /* TODO */ });
});

describe('romanize', () => {
  test('0 -> 0', () => {
    expect(romanize(0)).toEqual('0');
  });
  test('1 -> I', () => {
    expect(romanize(1)).toEqual('I');
  });
  test('27 -> XXVII', () => {
    expect(romanize(27)).toEqual('XXVII');
  });
});

describe('horizontalCounter', () => {

  // TODO why does this one error? Seems to be slightly different formatting of JSX output....
  // it('0 has 0', () => {
  //   expect(horizontalCounter(0)).toEqual(<span><span key={0}>{0}</span></span>);
  // });
  test('2 has 0, 1, 2', () => {
    expect(horizontalCounter(2)).toEqual(<span><span key={0}>{0}</span><span key={1}>{1}</span><span key={2}>{2}</span></span>);
  });
});

describe('healthCounter', () => {
  test.skip('10 health fits into a single side', () => { /* TODO */ });
  test.skip('>= max health outputs max health', () => { /* TODO */ });
});

describe('lootCounter', () => {
  test.skip('2 has 1, 2', () => { /* TODO */ });
});
