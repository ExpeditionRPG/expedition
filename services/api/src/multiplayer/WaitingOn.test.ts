import { resetSessions, setClientStatus } from './Sessions';
import { newMockWebsocket } from './TestData';
import { handleWaitingOnReview, handleWaitingOnTimer } from './WaitingOn';

const CLI1 = 'asdf';
const INST1 = 'ghjk';
const CLI2 = 'zxcv';
const INST2 = 'bnm';
const SESSION = 123;

describe('Multiplayer WaitingOn', () => {
  afterEach(resetSessions);

  describe('handleWaitingOnTimer', () => {
    test('triggers handleCombatTimerStop when all waiting on TIMER', done => {
      setClientStatus(SESSION, CLI1, INST1, null, {
        type: 'STATUS',
        waitingOn: { elapsedMillis: 500, type: 'TIMER' },
      });
      setClientStatus(SESSION, CLI2, INST2, null, {
        type: 'STATUS',
        waitingOn: { elapsedMillis: 800, type: 'TIMER' },
      });
      const commitAndBroadcast = jest.fn().mockReturnValue(Promise.resolve());

      handleWaitingOnTimer(null, SESSION, CLI2, INST2, commitAndBroadcast)
        .then(() => {
          expect(commitAndBroadcast).toHaveBeenCalledWith(
            null,
            SESSION,
            CLI2,
            INST2,
            expect.objectContaining({ name: 'handleCombatTimerStop' }),
          );
          done();
        })
        .catch(done);
    });

    test('does nothing when not all waiting on TIMER', done => {
      setClientStatus(SESSION, CLI1, INST1, null, {
        type: 'STATUS',
        waitingOn: { elapsedMillis: 500, type: 'TIMER' },
      });
      setClientStatus(SESSION, CLI2, INST2, null, {
        type: 'STATUS',
        waitingOn: undefined,
      });
      const commitAndBroadcast = jest.fn().mockReturnValue(Promise.resolve());

      handleWaitingOnTimer(null, SESSION, CLI2, INST2, commitAndBroadcast)
        .then(() => {
          expect(commitAndBroadcast).not.toHaveBeenCalled();
          done();
        })
        .catch(done);
    });

    test('broadcasts error on commit fail', done => {
      const ws1 = newMockWebsocket();
      setClientStatus(SESSION, CLI1, INST1, ws1, {
        type: 'STATUS',
        waitingOn: { elapsedMillis: 500, type: 'TIMER' },
      });
      const ws2 = newMockWebsocket();
      setClientStatus(SESSION, CLI2, INST2, ws2, {
        type: 'STATUS',
        waitingOn: { elapsedMillis: 800, type: 'TIMER' },
      });
      const commitAndBroadcast = () => {
        return new Promise(() => {
          throw new Error('test error');
        });
      };

      handleWaitingOnTimer(null, SESSION, CLI2, INST2, commitAndBroadcast)
        .then(() => {
          expect(ws1.send).toHaveBeenCalled();
          expect(ws1.send.mock.calls[0][0]).toContain('test error');
          done();
        })
        .catch(done);
    });
  });

  describe('handleWaitingOnReview', () => {
    test('exits quest when all waiting on REVIEW', done => {
      setClientStatus(SESSION, CLI1, INST1, null, {
        type: 'STATUS',
        waitingOn: { elapsedMillis: 500, type: 'REVIEW' },
      });
      setClientStatus(SESSION, CLI2, INST2, null, {
        type: 'STATUS',
        waitingOn: { elapsedMillis: 800, type: 'REVIEW' },
      });
      const commitAndBroadcast = jest.fn().mockReturnValue(Promise.resolve());

      handleWaitingOnReview(null, SESSION, CLI2, INST2, commitAndBroadcast)
        .then(() => {
          for (const name of ['exitQuest', 'toPrevious']) {
            expect(commitAndBroadcast).toHaveBeenCalledWith(
              null,
              SESSION,
              CLI2,
              INST2,
              expect.objectContaining({ name }),
            );
          }
          done();
        })
        .catch(done);
    });

    test('does nothing when not all waiting on REVIEW', done => {
      setClientStatus(SESSION, CLI1, INST1, null, {
        type: 'STATUS',
        waitingOn: { elapsedMillis: 500, type: 'REVIEW' },
      });
      setClientStatus(SESSION, CLI2, INST2, null, {
        type: 'STATUS',
        waitingOn: undefined,
      });
      const commitAndBroadcast = jest.fn().mockReturnValue(Promise.resolve());

      handleWaitingOnReview(null, SESSION, CLI2, INST2, commitAndBroadcast)
        .then(() => {
          expect(commitAndBroadcast).not.toHaveBeenCalled();
          done();
        })
        .catch(done);
    });

    test('broadcasts error on commit fail', done => {
      const ws1 = newMockWebsocket();
      setClientStatus(SESSION, CLI1, INST1, ws1, {
        type: 'STATUS',
        waitingOn: { elapsedMillis: 500, type: 'REVIEW' },
      });
      const ws2 = newMockWebsocket();
      setClientStatus(SESSION, CLI2, INST2, ws2, {
        type: 'STATUS',
        waitingOn: { elapsedMillis: 800, type: 'REVIEW' },
      });
      const commitAndBroadcast = () => {
        return new Promise(() => {
          throw new Error('test error');
        });
      };

      handleWaitingOnReview(null, SESSION, CLI2, INST2, commitAndBroadcast)
        .then(() => {
          expect(ws1.send).toHaveBeenCalled();
          expect(ws1.send.mock.calls[0][0]).toContain('test error');
          done();
        })
        .catch(done);
    });
  });
});
