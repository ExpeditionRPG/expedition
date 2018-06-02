import {logEvent} from './Logging'

describe('Console buffer', () => {
  it('logs the start of console');
  it('logs the most recent console event');
  it('omits middle logs');
});

describe('logEvent', () => {
    it('logs to google analytics if GA set up'); // $10
    it('works if no args passed');
    it('works if lots of args passed');
    it('does not break when GA not set up', () => {
      expect(() => logEvent('event', {})).not.toThrow();
    });
  });
