import { initSessionClient, resetSessions, setClientStatus } from './Sessions';
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

describe('wait resolution epochs', () => {
  afterEach(resetSessions);
  function ready(type: 'TIMER' | 'REVIEW', lastEventID = 4) {
    const status: any = {
      type: 'STATUS',
      lastEventID,
      waitingOn: type === 'TIMER' ? { type, elapsedMillis: 500 } : { type },
    };
    setClientStatus(SESSION, CLI1, INST1, newMockWebsocket(), status);
    return status;
  }
  test.each(['TIMER', 'REVIEW'] as const)(
    'deduplicates concurrent and reconnected %s status, then resolves the next epoch',
    async type => {
      const status = ready(type);
      const fn =
        type === 'TIMER' ? handleWaitingOnTimer : handleWaitingOnReview;
      const commit = jest.fn().mockResolvedValue(undefined);
      await Promise.all([
        fn(null, SESSION, CLI1, INST1, commit),
        fn(null, SESSION, CLI1, INST1, commit),
      ]);
      const count = type === 'TIMER' ? 1 : 2;
      expect(commit).toHaveBeenCalledTimes(count);
      initSessionClient(SESSION, CLI1, INST1, newMockWebsocket());
      setClientStatus(SESSION, CLI1, INST1, newMockWebsocket(), status);
      await fn(null, SESSION, CLI1, INST1, commit);
      expect(commit).toHaveBeenCalledTimes(count);
      ready(type, 5);
      await fn(null, SESSION, CLI1, INST1, commit);
      expect(commit).toHaveBeenCalledTimes(2 * count);
      resetSessions();
      ready(type, 4);
      await fn(null, SESSION, CLI1, INST1, commit);
      expect(commit).toHaveBeenCalledTimes(3 * count);
    },
  );
  test('does not mix readiness from different committed rounds', async () => {
    ready('TIMER', 4);
    setClientStatus(SESSION, CLI2, INST2, newMockWebsocket(), {
      type: 'STATUS',
      lastEventID: 3,
      waitingOn: { type: 'TIMER', elapsedMillis: 100 },
    });
    const commit = jest.fn().mockResolvedValue(undefined);
    await handleWaitingOnTimer(null, SESSION, CLI1, INST1, commit);
    expect(commit).not.toHaveBeenCalled();
  });
  test('releases a failed resolution so readiness can retry', async () => {
    ready('TIMER');
    const commit = jest
      .fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValue(undefined);
    await handleWaitingOnTimer(null, SESSION, CLI1, INST1, commit);
    await handleWaitingOnTimer(null, SESSION, CLI1, INST1, commit);
    expect(commit).toHaveBeenCalledTimes(2);
  });
  test('does not resolve an empty session', async () => {
    const commit = jest.fn().mockResolvedValue(undefined);
    await handleWaitingOnTimer(null, 999, CLI1, INST1, commit);
    await handleWaitingOnReview(null, 999, CLI1, INST1, commit);
    expect(commit).not.toHaveBeenCalled();
  });
});
