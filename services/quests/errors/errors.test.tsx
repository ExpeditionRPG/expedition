import { PlaytestCrawler } from '../src/playtest/PlaytestCrawler';
import { Node } from 'shared/parse/Node';
import { defaultContext } from 'shared/parse/Context';
import { Logger } from 'shared/render/Logger';
import * as assert from 'assert';
import { BlockList } from 'shared/render/block/BlockList';
import { QDLParser } from 'shared/render/QDLParser';
import { XMLRenderer } from 'shared/render/render/XMLRenderer';
import Errors from './errors';

describe('Errors', () => {
  Object.keys(Errors).forEach((key: string) => {
    const err = Errors[key];

    // Valid cases - no error
    err.VALID.forEach((valid: string, index: number) => {
      test(err.NUMBER + ': ' + err.NAME + ' valid case ' + index, () => {
        if (err.TEST_WITH_CRAWLER) {
          const qdl = new QDLParser(XMLRenderer);
          qdl.render(new BlockList(addQuestHeader(valid)));
          const logger = new Logger();
          new PlaytestCrawler().crawlWithLog(
            new Node(qdl.getResult().children().first(), defaultContext()),
            logger,
          );
          const logs = [qdl.getFinalizedLogs(), logger.getFinalizedLogs()];
          expect(
            logs
              .flatMap(m => [...m.error, ...m.warning, ...m.internal])
              .filter(m => m.url === String(err.NUMBER)),
          ).toEqual([]);
          return;
        }
        const qdl = new QDLParser(XMLRenderer);
        let quest = valid;
        if (!err.METADATA_ERROR) {
          quest = addQuestHeader(quest);
        }
        qdl.render(new BlockList(quest));
        const msgs = qdl.getFinalizedLogs();
        expect(msgs.error).toEqual([]);
        expect(msgs.warning).toEqual([]);
        expect(msgs.internal).toEqual([]);
      });
    });

    // Invalid cases - logs the error
    err.INVALID.forEach((invalid: string, index: number) => {
      test(err.NUMBER + ': ' + err.NAME + ' invalid case ' + index, () => {
        if (err.TEST_WITH_CRAWLER) {
          const qdl = new QDLParser(XMLRenderer);
          qdl.render(new BlockList(addQuestHeader(invalid)));
          const logger = new Logger();
          new PlaytestCrawler().crawlWithLog(
            new Node(qdl.getResult().children().first(), defaultContext()),
            logger,
          );
          const logs = [qdl.getFinalizedLogs(), logger.getFinalizedLogs()];
          expect(
            logs.flatMap(m => [...m.error, ...m.warning, ...m.internal]),
          ).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                url: String(err.NUMBER),
                text: expect.any(String),
              }),
            ]),
          );
          return;
        }
        const qdl = new QDLParser(XMLRenderer);
        let quest = invalid;
        if (!err.METADATA_ERROR) {
          quest = addQuestHeader(quest);
        }
        qdl.render(new BlockList(quest));
        const msgs = qdl.getFinalizedLogs();
        // Note the requirement for only one error. Error invalid test cases should be designed
        // such that they don't trigger multiple errors, so as to prevent confusion.
        const errorName =
          err.INVALID_ERRORS && err.INVALID_ERRORS[index] !== null
            ? err.INVALID_ERRORS[index]
            : err.NAME;
        assert.equal(
          msgs.error.length,
          1,
          `Length !== 1, was ${msgs.error.length}: ${msgs.error
            .map(e => e.text)
            .join('...')}`,
        );
        expect(msgs.error[0].url).toEqual(err.NUMBER.toString());
        expect(msgs.error[0].text.toLowerCase()).toEqual(
          errorName.toLowerCase(),
        );
        expect(msgs.warning).toEqual([]);
        expect(msgs.internal).toEqual([]);
      });
    });
  });
});

function addQuestHeader(markdown: string): string {
  return `# Test Quest

${markdown}`;
}
