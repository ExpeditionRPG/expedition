/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />

import {Block, BlockList} from './BlockList'
import TestData from './TestData'

var expect: any = require('expect');

describe('BlockList', () => {
  it('parses empty string', () => {
    var map = new BlockList('');
    console.log(map);
  });

  it('parses single block');

  it('parses multiple blocks');
});