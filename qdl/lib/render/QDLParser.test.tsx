import {QDLParser} from './QDLParser'
import {prettifyMsgs} from './Logger'
import {XMLRenderer} from './render/XMLRenderer'
import {BlockList} from './block/BlockList'
import TestData from './TestData'

const expect: any = require('expect');
const prettifyHTML = (require('html') as any).prettyPrint;


describe('QDLParser', () => {
  it('parses basic QDL to XML', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.basicMD));
    const msgs = qdl.getFinalizedLogs();

    expect(msgs['error']).toEqual([]);
    expect(msgs['warning']).toEqual([]);
    expect(msgs['internal']).toEqual([]);
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.basicXML);
  });

  it('parses QDL to XML with lots of conditionals', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.conditionalsMD));
    const msgs = qdl.getFinalizedLogs();

    expect(msgs['error']).toEqual([]);
    expect(msgs['warning']).toEqual([]);
    expect(msgs['internal']).toEqual([]);
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.conditionalsXML);
  });

  it('parses QDL to XML with lots of comments', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.commentsMD));
    const msgs = qdl.getFinalizedLogs();

    expect(msgs['error']).toEqual([]);
    expect(msgs['warning']).toEqual([]);
    expect(msgs['internal']).toEqual([]);
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.commentsXML);
  });

  it('parses QDL to XML with lots of indentations', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.indentsMD));
    const msgs = qdl.getFinalizedLogs();

    expect(msgs['error']).toEqual([]);
    expect(msgs['warning']).toEqual([]);
    expect(msgs['internal']).toEqual([]);
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.indentsXML);
  });

  it('errors if path not ending in "end"');

  it('errors on no input', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(''));

    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.emptyXML);
    expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.emptyError);
  });

  it('errors if only quest block');

  it('errors if no quest header at start', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.noHeaderMD));

    expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.noHeaderError);
  });

  it('treats trigger as singular block, always', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.triggerWithNoAfterHeader));
    const msgs = qdl.getFinalizedLogs();

    expect(msgs['error']).toEqual([]);
    expect(msgs['warning']).toEqual([]);
    expect(msgs['internal']).toEqual([]);
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.triggerWithNoAfterHeaderXML);
  });
});
