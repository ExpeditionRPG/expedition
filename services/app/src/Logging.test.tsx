import {logEvent} from './Logging';

describe('Console buffer', () => {
  test.skip('logs the start of console', () => { /* TODO */ });
  test.skip('logs the most recent console event', () => { /* TODO */ });
  test.skip('omits middle logs', () => { /* TODO */ });
});

describe('logEvent', () => {
    test.skip('logs to google analytics if GA set up', () => { /* TODO */ }); // $10
    test.skip('works if no args passed', () => { /* TODO */ });
    test.skip('works if lots of args passed', () => { /* TODO */ });
    test('does not break when GA not set up', () => {
      expect(() => logEvent('category', 'action', {})).not.toThrow();
    });
  });
