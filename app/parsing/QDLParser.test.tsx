/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />

import {QDLParser} from './QDLParser'
import {prettifyMsgs} from './Logger'
import {XMLRenderer} from './render/XMLRenderer'
import {Block, BlockList} from './block/BlockList'
import TestData from './TestData'

var expect: any = require('expect');

var prettifyHTML = (require("html") as any).prettyPrint;

describe('QDLParser', () => {
  it('parses basic QDL to XML', () => {
    var qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.basicMD));
    var msgs = qdl.getFinalizedLogs()

    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.basicXML);
    expect(msgs['error']).toEqual([]);
    expect(msgs['warning']).toEqual([]);
  });

  it('errors on no input', () => {
    var qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(''));

    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.emptyXML);
    expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.emptyError);
  });

  it('errors if no quest header at start', () => {
    var qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.noHeaderMD));

    expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.noHeaderError);
  });

  it('errors if unparseable quest attribute');

  it('errors if unknown quest attribute', () => {
    var qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.badQuestAttrMD));

    expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.badQuestAttrError);
  });

  it('errors if invalid quest attribute', () => {
    var qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.invalidQuestAttrMD));

    expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.invalidQuestAttrError);
  })

  it('errors if missing quest title', () => {
    var qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.invalidQuestAttrMD));

    expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.invalidQuestAttrError);
  });

  it('errors if only quest block', () => {

  });

  it('errors if path not ending in "end"', () => {

  });

  it('errors if invalid combat event', () => {

  });

  it('errors if invalid combat enemy', () => {

  });

  it('errors if missing combat event', () => {

  });

  it('errors if invalid roleplay attribute', () => {

  });

  it('errors if invalid choice attribute', () => {

  });

  it('errors if no combat enemies', () => {

  });

  it('errors if inner combat block with no event bullet', () => {

  });

});