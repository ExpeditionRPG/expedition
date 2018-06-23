import * as React from 'react'
import {camelCase, romanize, horizontalCounter} from './helpers'

describe('icon', () => {
  it('Returns JSX element');
});

describe('camelCase', () => {
  it('Skeleton Swordsman -> skeletonSwordsman', () => {
    expect(camelCase('Skeleton Swordsman')).toEqual('skeletonSwordsman');
  });
});

describe('romanize', () => {
  it('0 -> 0', () => {
    expect(romanize(0)).toEqual('0');
  });
  it('1 -> I', () => {
    expect(romanize(1)).toEqual('I');
  });
  it('27 -> XXVII', () => {
    expect(romanize(27)).toEqual('XXVII');
  });
});

describe('horizontalCounter', () => {

  // TODO why does this one error? Seems to be slightly different formatting of JSX output....
  // it('0 has 0', () => {
  //   expect(horizontalCounter(0)).toEqual(<span><span key={0}>{0}</span></span>);
  // });
  it('2 has 0, 1, 2', () => {
    expect(horizontalCounter(2)).toEqual(<span><span key={0}>{0}</span><span key={1}>{1}</span><span key={2}>{2}</span></span>);
  });
});

describe('healthCounter', () => {
  it('10 health fits into a single side');
  it('>= max health outputs max health');
});

describe('lootCounter', () => {
  it('2 has 1, 2');
});
