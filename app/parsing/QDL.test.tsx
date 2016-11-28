/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />

import {QDL} from './QDL'
import {Block} from './BlockList'
import {BlockMsg, BlockMsgHandler} from './BlockMsg'
import {XMLRenderer} from './BlockRenderer'
import TestData from './TestData'

var expect: any = require('expect');

describe('QDL', () => {

  it('calls error callback on error', () => {
    var qdl = new QDL(XMLRenderer);
    var calls = 0;
    qdl.onError(function(msgs: BlockMsg[]) {calls++;});
    qdl.update('');
    expect(calls).toBe(1);
  });

  it('does not call onWarning/onError if no messages', () => {
    var qdl = new QDL(XMLRenderer);
    var called = false;
    // onDebug is called pretty much always
    qdl.onWarning(function(msgs: BlockMsg[]) {called = true;});
    qdl.onError(function(msgs: BlockMsg[]) {called = true;});
    qdl.update(TestData.basicMD);
    expect(called).toBe(false);
  })

  it('shows different cards with different line setting');

});