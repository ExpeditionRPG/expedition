import {QDLParser} from 'expedition-qdl/lib/render/QDLParser'
import {prettifyMsgs} from 'expedition-qdl/lib/render/Logger'
import {BlockList} from 'expedition-qdl/lib/render/block/BlockList'
import {XMLRenderer} from 'expedition-qdl/lib/render/render/XMLRenderer'

const Errors: any = require('./errors');
const expect: any = require('expect');


describe('Errors', () => {
  Object.keys(Errors).forEach((key: string, index: number) => {
    const err = Errors[key];

    it(err.NUMBER + ': ' + err.NAME, () => {
      // Valid cases - no error
      err.VALID.forEach((valid: string) => {
        const qdl = new QDLParser(XMLRenderer);
        let quest = valid;
        if (!err.METADATA_ERROR) { quest = addQuestHeader(quest); }
        qdl.render(new BlockList(quest));
        const msgs = qdl.getFinalizedLogs();
        expect(msgs['error']).toEqual([], quest);
        expect(msgs['warning']).toEqual([], quest);
        expect(msgs['internal']).toEqual([], quest);
      });

      // Invalid cases - logs the error
      err.INVALID.forEach((invalid: string, index: number) => {
        const qdl = new QDLParser(XMLRenderer);
        let quest = invalid;
        if (!err.METADATA_ERROR) { quest = addQuestHeader(quest); }
        qdl.render(new BlockList(quest));
        const msgs = qdl.getFinalizedLogs();
        // Note the requirement for only one error. Error invalid test cases should be designed
        // such that they don't trigger multiple errors, so as to prevent confusion.
        const errorDescription = JSON.stringify(msgs['error']) + '\n' + invalid
        expect(msgs['error'].length).toEqual(1, errorDescription);
        expect(msgs['error'][0].url).toEqual(err.NUMBER.toString(), errorDescription);
        if (err.INVALID_ERRORS && err.INVALID_ERRORS[index] != null) {
          expect(msgs['error'][0].text).toEqual(err.INVALID_ERRORS[index], errorDescription);
        } else {
          expect(msgs['error'][0].text).toEqual(err.NAME, errorDescription);
        }
        expect(msgs['warning']).toEqual([], errorDescription);
        expect(msgs['internal']).toEqual([], errorDescription);
      });
    });
  });
});


function addQuestHeader(markdown: string): string {
  return `# Test Quest
Summary: A quest that'll test ya
Author: Test McTesterson
minplayers: 1
maxplayers: 6
mintimeminutes: 1
maxtimeminutes: 10

${markdown}`;
};
