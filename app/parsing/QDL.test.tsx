/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />

import {QDL} from './QDL'
import {Block} from './BlockList'
import {BlockMsg, BlockMsgHandler} from './BlockMsg'
import {BlockRenderer} from './BlockRenderer'

var expect: any = require('expect');

class DummyRenderer {
  static toRoleplay(blocks: Block[], msg: BlockMsgHandler) {}
  static toCombat(blocks: Block[], msg: BlockMsgHandler) {}
  static toTrigger(blocks: Block[], msg: BlockMsgHandler) {}
  static toQuest(blocks: Block[], msg: BlockMsgHandler) {}
  static finalize(blocks: Block[], msg: BlockMsgHandler) {}
}

class DummyRendererWithMsgs extends DummyRenderer {
  static toRoleplay(blocks: Block[], msg: BlockMsgHandler) {
    console.log("HERP");
    msg.err('test', '404');
    msg.warn('test', '404');
  }
}

describe('QDL', () => {
  it('calls all callbacks', () => {
    var qdl = new QDL(DummyRendererWithMsgs);
    var calls = 0;
    qdl.onDebug(function(msgs: BlockMsg[]) {calls++;});
    qdl.onWarning(function(msgs: BlockMsg[]) {calls++;});
    qdl.onError(function(msgs: BlockMsg[]) {calls++;});
    qdl.onXML(function(xml: any) {calls++;});
    qdl.onCard(function(card: any) {calls++;});
    qdl.update('');
    expect(calls).toBe(5);
  });

  it('does not call onWarning/onError if no messages', () => {
    var qdl = new QDL(DummyRenderer);
    var called = false;
    // onDebug is called pretty much always
    qdl.onWarning(function(msgs: BlockMsg[]) {called = true;});
    qdl.onError(function(msgs: BlockMsg[]) {called = true;});
    qdl.update('');
    expect(called).toBe(false);
  })

  it('shows different cards with different line setting');
});