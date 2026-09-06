import { BlockList } from './block/BlockList';
import { prettifyMsgs } from './Logger';
import { QDLParser } from './QDLParser';
import { XMLRenderer } from './render/XMLRenderer';
import TestData from './TestData';

const prettifyHTML = (require('html') as any).prettyPrint;

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

  // Left skipped: the check this test is for does not exist yet. It is the
  // outstanding "Ensure all paths end with an 'end' trigger" TODO in
  // XMLRenderer.validate. Today a quest whose only card has no trigger renders
  // cleanly with zero log messages, so there is nothing truthful to assert
  // without first implementing the check.
  test.skip('errors if path not ending in "end"', () => {
    /* TODO */
  });

  test('errors on no input', () => {
    const qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(''));

    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.emptyXML);
    expect(prettifyMsgs(qdl.getFinalizedLogs().error)).toEqual(
      TestData.emptyError,
    );
  });

  // Left skipped for the same reason: this is the outstanding "Ensure there's
  // at least one node that isn't the quest" TODO in XMLRenderer.validate. A
  // lone "#Quest Title" currently renders <quest><roleplay></roleplay></quest>
  // with no errors at all.
  test.skip('errors if only quest block', () => {
    /* TODO */
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
