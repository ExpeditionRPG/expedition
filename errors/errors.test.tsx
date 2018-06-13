import {QDLParser} from 'expedition-qdl/lib/render/QDLParser'
import {BlockList} from 'expedition-qdl/lib/render/block/BlockList'
import {XMLRenderer} from 'expedition-qdl/lib/render/render/XMLRenderer'
import Errors from './errors'
const expect: any = require('expect');

describe('Errors', () => {
  Object.keys(Errors).forEach((key: string, index: number) => {
    const err = Errors[key];

    it(err.NUMBER + ': ' + err.NAME, () => {
      // Valid cases - no error
      err.VALID.forEach((valid: string) => {
        if (err.TEST_WITH_CRAWLER) {
          return; // TODO actually test
        }
        const qdl = new QDLParser(XMLRenderer);
        let quest = valid;
        if (!err.METADATA_ERROR) { quest = addQuestHeader(quest); }
        qdl.render(new BlockList(quest));
        const msgs = qdl.getFinalizedLogs();
        expect(msgs['error']).toEqual([]);
        expect(msgs['warning']).toEqual([]);
        expect(msgs['internal']).toEqual([]);
      });

      // Invalid cases - logs the error
      err.INVALID.forEach((invalid: string, index: number) => {
        if (err.TEST_WITH_CRAWLER) {
          return; // TODO actually test
        }
        const qdl = new QDLParser(XMLRenderer);
        let quest = invalid;
        if (!err.METADATA_ERROR) { quest = addQuestHeader(quest); }
        qdl.render(new BlockList(quest));
        const msgs = qdl.getFinalizedLogs();
        // Note the requirement for only one error. Error invalid test cases should be designed
        // such that they don't trigger multiple errors, so as to prevent confusion.
        const errorName = (err.INVALID_ERRORS && err.INVALID_ERRORS[index] !== null) ? err.INVALID_ERRORS[index] : err.NAME;
        expect(msgs['error'].length).toEqual(1, `Length !== 1, was ${msgs['error'].length}: ${msgs['error'].map((err) => { return err.text; }).join('...')}`);
        expect(msgs['error'][0].url).toEqual(err.NUMBER.toString());
        expect(msgs['error'][0].text.toLowerCase()).toEqual(errorName.toLowerCase());
        expect(msgs['warning']).toEqual([]);
        expect(msgs['internal']).toEqual([]);
      });
    });
  });
});


function addQuestHeader(markdown: string): string {
  return `# Test Quest

${markdown}`;
};
