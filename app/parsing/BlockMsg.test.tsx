/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />

import {Block} from './BlockList'
import {BlockMsg, BlockMsgHandler, prettifyMsg, prettifyMsgs} from './BlockMsg'
import TestData from './TestData'

var expect: any = require('expect');

const testBlock: Block = {indent: 0, startLine: 0, lines: ['hello world']};

const testMsgs: BlockMsg[] = [
  {blockGroup: [], type: 'error', text: 'test error', url: 'test', line: 5},
  {blockGroup: [testBlock], type: 'warning', text: 'test warning', url: '404'},
  {blockGroup: [], type: 'debug', text: 'test debug\nstuff', url: '404'},
];

describe('BlockMsg', () => {

  describe('BlockMsgHandler', () => {
    it('extends with messages', () => {
      var msg = new BlockMsgHandler();
      msg.extend(testMsgs);
      expect(msg.finalize()).toEqual(testMsgs);
    });

    it('logs error', () => {
      var msg = new BlockMsgHandler();
      msg.err('test error', 'test', 5);
      expect(msg.finalize()).toEqual([testMsgs[0]]);
    });

    it('logs debug (concatenated)', () => {
      var msg = new BlockMsgHandler();
      msg.dbg('test debug');
      msg.dbg('stuff');
      expect(msg.finalize()).toEqual([testMsgs[2]]);
    });

    it('logs warning', () => {
      var msg = new BlockMsgHandler([testBlock]);
      msg.warn('test warning', '404');
      expect(msg.finalize()).toEqual([testMsgs[1]]);
    });
  });

  describe('prettifyMsgs', () => {
    it('prettifies multiple messages', () => {
      expect(prettifyMsgs(testMsgs)).toEqual("ERROR L5 (0 blocks):\ntest error\nURL: test\n\nWARNING L0 (1 blocks):\ntest warning\nURL: 404\n\nDEBUG Lnone (0 blocks):\ntest debug\nstuff\nURL: 404");
    });
  });

  describe('prettifyMsg', () => {
    it('prettifies message', () => {
      expect(prettifyMsg(testMsgs[0])).toEqual("ERROR L5 (0 blocks):\ntest error\nURL: test");
    });

    it('prettifies message with no line context', () => {
      expect(prettifyMsg(testMsgs[2])).toEqual("DEBUG Lnone (0 blocks):\ntest debug\nstuff\nURL: 404");
    });
  });
});

