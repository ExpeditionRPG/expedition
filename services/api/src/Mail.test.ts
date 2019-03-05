import { send } from './Mail';

describe('mail', () => {
  test('sends simple mail with no bcc', done => {
    const sendMail = opts => {
      expect(opts).toEqual(
        jasmine.objectContaining({
          from: '"Expedition" <expedition@fabricate.io>',
          html: 'test message',
          subject: 'test subject',
          text: 'test message',
          to: 'testto',
        }),
      );
      expect(opts.bcc).not.toBeDefined();
      return Promise.resolve('result data');
    };
    send(['testto'], 'test subject', 'test message', false, false, sendMail)
      .then(result => {
        expect(result).toEqual('result data');
        done();
      })
      .catch(done.fail);
  });

  test('when configured, sends copy via bcc', done => {
    const sendMail = opts => {
      expect(opts.bcc).toEqual('todd@fabricate.io');
      return Promise.resolve(null);
    };
    send(['testto'], 'test subject', 'test message', true, false, sendMail)
      .then(result => {
        done();
      })
      .catch(done.fail);
  });

  test('returns send errors via promise', done => {
    const sendMail = opts => {
      return Promise.reject(new Error('test error'));
    };
    send(['testto'], 'test subject', 'test message', false, false, sendMail)
      .then(result => {
        done.fail('no error thrown');
      })
      .catch(e => {
        expect(e.toString()).toEqual('Error: test error');
        done();
      });
  });

  test('prefixes subject when beta', done => {
    const sendMail = opts => {
      expect(opts.subject).toContain('[BETA]');
      return Promise.resolve(null);
    };
    send(['testto'], 'test subject', 'test message', false, true, sendMail)
      .then(result => {
        done();
      })
      .catch(done.fail);
  });

  test('does not indicate beta when non-beta', done => {
    const sendMail = opts => {
      expect(opts.subject).not.toContain('[BETA]');
      return Promise.resolve(null);
    };
    send(['testto'], 'test subject', 'test message', false, false, sendMail)
      .then(result => {
        done();
      })
      .catch(done.fail);
  });
});
