/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />

import {QDLRenderer} from './QDLRenderer'
import {prettifyMsgs, BlockMsg} from './BlockMsg'
import {XMLRenderer} from './BlockRenderer'
import {Block, BlockList} from './BlockList'
import TestData from './TestData'

var expect: any = require('expect');

var prettifyHTML = (require("html") as any).prettyPrint;

describe('QDLRenderer', () => {

  it('errors on no input', () => {
    var qdl = new QDLRenderer(XMLRenderer);
    qdl.render(new BlockList(''));
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.emptyXML);
    expect(prettifyMsgs(qdl.getFinalizedMsgs()['error'])).toEqual(TestData.emptyError);
  });

  // - Validate quest attributes (use whitelist)
  // - Ensure there's at least one node that isn't the quest
  // - Ensure all paths end with an "end" trigger
  // - Ensure all combat events make sense (currently "win" and "lose")
  // - Ensure all combat enemies are valid (use whitelist)
  // - Validate roleplay attributes (w/ whitelist)
  // - Validate choice attributes (w/ whitelist)
  // - Errors if no combat enemies
  // - Errors if inner combat block w/o event bullet


  it('parses basic QDL to XML', () => {
    var qdl = new QDLRenderer(XMLRenderer);

    qdl.render(new BlockList(TestData.basicMD));
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.basicXML);
    var msgs = qdl.getFinalizedMsgs()
    expect(msgs['error']).toEqual([]);
    expect(msgs['warning']).toEqual([]);
  });
  //it('Handles wiping out intermediate block');
})