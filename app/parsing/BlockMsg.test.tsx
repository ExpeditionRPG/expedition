/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />

import {BlockMsg, BlockMsgHandler, prettifyMsg, prettifyMsgs} from './BlockMsg'
import TestData from './TestData'

var expect: any = require('expect');

describe('BlockMsg', () => {

  describe('BlockMsgHandler', () => {
    it('extends with messages');

    it('logs error');

    it('logs debug (concatenated)');

    it('logs warning');
  });

  describe('prettifyMsgs', () => {
    it('prettifies multiple messages');
  });

  describe('prettifyMsg', () => {
    it('prettifies message');

    it('prettifies message without URL');

    it('prettifies message with no line context');
  });
});

