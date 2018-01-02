import {Block} from './block/BlockList'
import {LogMessage, Logger, prettifyMsg, prettifyMsgs} from './Logger'

const expect: any = require('expect');

const testBlock: Block = {indent: 0, startLine: 0, lines: ['hello world']};

const testMsgs: LogMessage[] = [
  {type: 'error', text: 'test error', url: 'test', line: 5},
  {type: 'warning', text: 'test warning', url: '404', line: 7},
  {type: 'info', text: 'test debug\nstuff', url: '100', line: 0},
  {type: 'internal', text: 'internal error', url: '505', line: 5},
];

describe('LogMessage', () => {

  describe('Logger', () => {
    it('extends with messages', () => {
      const msg = new Logger();
      msg.extend(testMsgs);
      expect(msg.finalize()).toEqual(testMsgs);
    });

    it('logs error', () => {
      const msg = new Logger();
      msg.err('test error', 'test', 5);
      expect(msg.finalize()).toEqual([testMsgs[0]]);
    });

    it('logs debug (concatenated)', () => {
      const msg = new Logger();
      msg.dbg('test debug');
      msg.dbg('stuff');
      expect(msg.finalize()).toEqual([testMsgs[2]]);
    });

    it('logs warning', () => {
      const msg = new Logger([testBlock]);
      msg.warn('test warning', '404', 7);
      expect(msg.finalize()).toEqual([testMsgs[1]]);
    });

    it('logs internal', () => {
      const msg = new Logger();
      msg.internal('internal error', '505', 5);
      expect(msg.finalize()).toEqual([testMsgs[3]]);
    })
  });

  describe('prettifyMsgs', () => {
    it('prettifies multiple messages', () => {
      expect(prettifyMsgs(testMsgs)).toEqual('ERROR L5:\ntest error\nURL: test\n\nWARNING L7:\ntest warning\nURL: 404\n\nINFO L0:\ntest debug\nstuff\nURL: 100\n\nINTERNAL L5:\ninternal error\nURL: 505');
    });
  });

  describe('prettifyMsg', () => {
    it('prettifies message', () => {
      expect(prettifyMsg(testMsgs[0])).toEqual('ERROR L5:\ntest error\nURL: test');
    });

    it('prettifies message with no line context', () => {
      expect(prettifyMsg(testMsgs[2])).toEqual('INFO L0:\ntest debug\nstuff\nURL: 100');
    });
  });
});

