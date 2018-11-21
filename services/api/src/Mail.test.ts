import {send} from './Mail';

describe('mail', () => {
  test('sends simple mail with no bcc', (done) => {
    const sendMail = (opts, cb) => {
      expect(opts).toEqual(jasmine.objectContaining({
        from: "\"Expedition\" <expedition@fabricate.io>",
        html: "test message",
        subject: "test subject",
        text: "test message",
        to: "testto"
      }));
      expect(opts.bcc).not.toBeDefined();
      cb(null, 'result data');
    };
    send(['testto'], 'test subject', 'test message', false, sendMail)
      .then((result) => {
        expect(result).toEqual('result data');
        done();
      }).catch(done.fail);
  });

  test('when configured, sends copy via bcc',  (done) => {
    const sendMail = (opts, cb) => {
      expect(opts.bcc).toEqual('todd@fabricate.io');
      cb(null, null);
    };
    send(['testto'], 'test subject', 'test message', true, sendMail)
      .then((result) => {
        done();
      }).catch(done.fail);
  });

  test('returns send errors via promise', (done) => {
    const sendMail = (opts, cb) => {
      cb(new Error('test error'), null);
    };
    send(['testto'], 'test subject', 'test message', false, sendMail)
      .then((result) => {
        done.fail('no error thrown');
      }).catch((e) => {
        expect(e.toString()).toEqual('Error: test error');
        done();
      });
  });
});
