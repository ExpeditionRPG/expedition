import Config from './config';
import { send, sendVia } from './Mail';

describe('mail', () => {
  test('sends simple mail with no bcc', done => {
    const sendMail = opts => {
      expect(opts).toEqual(
        expect.objectContaining({
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
    sendVia(sendMail, ['testto'], 'test subject', 'test message', false, false)
      .then(result => {
        expect(result).toEqual('result data');
        done();
      })
      .catch(done);
  });

  test('when configured, sends copy via bcc', done => {
    const sendMail = opts => {
      expect(opts.bcc).toEqual('todd@fabricate.io');
      return Promise.resolve(null);
    };
    sendVia(sendMail, ['testto'], 'test subject', 'test message', true, false)
      .then(result => {
        done();
      })
      .catch(done);
  });

  test('returns send errors via promise', done => {
    const sendMail = opts => {
      return Promise.reject(new Error('test error'));
    };
    sendVia(sendMail, ['testto'], 'test subject', 'test message', false, false)
      .then(result => {
        done(new Error('no error thrown'));
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
    sendVia(sendMail, ['testto'], 'test subject', 'test message', false, true)
      .then(result => {
        done();
      })
      .catch(done);
  });

  test('does not indicate beta when non-beta', done => {
    const sendMail = opts => {
      expect(opts.subject).not.toContain('[BETA]');
      return Promise.resolve(null);
    };
    sendVia(sendMail, ['testto'], 'test subject', 'test message', false, false)
      .then(result => {
        done();
      })
      .catch(done);
  });
});

test('development mail is mocked without SMTP credentials', async () => {
  const originalGet = Config.get.bind(Config);
  const get = jest
    .spyOn(Config, 'get')
    .mockImplementation(key => (key === 'NODE_ENV' ? 'dev' : originalGet(key)));
  try {
    await expect(
      send(['nobody@example.com'], 'test', 'mock only', false, false),
    ).resolves.toEqual({ response: '' });
  } finally {
    get.mockRestore();
  }
});
