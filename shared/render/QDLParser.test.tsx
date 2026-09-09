import { BlockList } from './block/BlockList';
import { prettifyMsgs } from './Logger';
import { QDLParser } from './QDLParser';
import { XMLRenderer } from './render/XMLRenderer';
import TestData from './TestData';

const prettifyHTML = require('html').prettyPrint;

describe('QDLParser', () => {
  test('parses basic QDL to XML', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.basicMD));
    const msgs = qdl.getFinalizedLogs();

    expect(msgs.error).toEqual([]);
    expect(msgs.warning).toEqual([]);
    expect(msgs.internal).toEqual([]);
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.basicXML);
  });

  test('parses QDL to XML with lots of conditionals', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.conditionalsMD));
    const msgs = qdl.getFinalizedLogs();

    expect(msgs.error).toEqual([]);
    expect(msgs.warning).toEqual([]);
    expect(msgs.internal).toEqual([]);
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(
      TestData.conditionalsXML,
    );
  });

  test('parses QDL to XML with lots of comments', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.commentsMD));
    const msgs = qdl.getFinalizedLogs();

    expect(msgs.error).toEqual([]);
    expect(msgs.warning).toEqual([]);
    expect(msgs.internal).toEqual([]);
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(
      TestData.commentsXML,
    );
  });

  test('parses QDL to XML with lots of indentations', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.indentsMD));
    const msgs = qdl.getFinalizedLogs();

    expect(msgs.error).toEqual([]);
    expect(msgs.warning).toEqual([]);
    expect(msgs.internal).toEqual([]);
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(
      TestData.indentsXML,
    );
  });

  // Incomplete drafts are renderable in the editor; graph termination validation
  // is not part of the parser's current contract.
  test('renders an unfinished draft without inventing an end trigger', () => {
    const qdl = new QDLParser(XMLRenderer);
    qdl.render(new BlockList('#Draft\n\n_Opening_\n\nKeep writing.'));
    expect(qdl.getResult().find('roleplay').text()).toContain('Keep writing.');
    expect(qdl.getResult().find('trigger')).toHaveLength(0);
    expect(qdl.getFinalizedLogs().error).toEqual([]);
  });

  test('errors on no input', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(''));

    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.emptyXML);
    expect(prettifyMsgs(qdl.getFinalizedLogs().error)).toEqual(
      TestData.emptyError,
    );
  });

  test('renders a quest-header-only draft with an editable empty roleplay card', () => {
    const qdl = new QDLParser(XMLRenderer);
    qdl.render(new BlockList('#Draft'));
    expect(qdl.getResult().attr('title')).toBe('Draft');
    expect(qdl.getResult().find('roleplay')).toHaveLength(1);
    expect(qdl.getResult().find('roleplay').text()).toBe('');
  });

  test('errors on an unparseable line directly under the quest header', () => {
    const qdl = new QDLParser(XMLRenderer);

    // Lines immediately following "#Title" are quest attributes ("key: value").
    // A second header there is not a second quest - it is a bad attribute line.
    qdl.render(new BlockList('#Quest Title\n#Another Quest Title\n'));

    expect(prettifyHTML(qdl.getResult().toString())).toEqual(
      TestData.strayQuestHeaderLineXML,
    );
    expect(prettifyMsgs(qdl.getFinalizedLogs().error)).toEqual(
      TestData.strayQuestHeaderLineError,
    );
  });

  test('errors if no quest header at start', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.noHeaderMD));

    expect(prettifyMsgs(qdl.getFinalizedLogs().error)).toEqual(
      TestData.noHeaderError,
    );
  });

  test('treats trigger as singular block, always', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.triggerWithNoAfterHeader));
    const msgs = qdl.getFinalizedLogs();

    expect(msgs.error).toEqual([]);
    expect(msgs.warning).toEqual([]);
    expect(msgs.internal).toEqual([]);
    expect(prettifyHTML(qdl.getResult().toString())).toEqual(
      TestData.triggerWithNoAfterHeaderXML,
    );
  });
});
