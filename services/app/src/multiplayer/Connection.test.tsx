import {newMockStore} from './Testing';
import {Connection} from './Connection';

describe('Connection', () => {
  describe('reconnection behavior', () => {
    test.skip('is triggered on connection failure', () => { /* TODO */ });
    test.skip('backs off with random exponential offset', () => { /* TODO */ });
    test.skip('publishes client status when reconnected', () => { /* TODO */ });
    test.skip('requests missed state and dispatches fast-forward actions', () => { /* TODO */ });
  });
});
