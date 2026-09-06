import { setServerStatus } from '../actions/ServerStatus';
import { Reducer } from '../Testing';
import { initialServerStatusState, serverstatus } from './ServerStatus';
import { ServerStatusState } from './StateTypes';

const CLOSED_ANNOUNCEMENT = { link: '', message: '', open: false };

describe('ServerStatus reducer', () => {
  describe('initial state', () => {
    test('is returned when state is undefined', () => {
      expect(serverstatus(undefined, { type: '@@INIT' })).toEqual(
        initialServerStatusState,
      );
    });

    test('starts with a closed announcement and an out-of-date app', () => {
      expect(serverstatus(undefined, { type: '@@INIT' })).toEqual({
        announcement: CLOSED_ANNOUNCEMENT,
        isLatestAppVersion: false,
      });
    });
  });

  describe('unknown actions', () => {
    test('returns the exact same state object', () => {
      const state: ServerStatusState = {
        announcement: { link: 'l', message: 'm', open: true },
        isLatestAppVersion: true,
      };
      expect(serverstatus(state, { type: 'NOT_A_SERVER_STATUS_ACTION' })).toBe(
        state,
      );
    });
  });

  describe('SERVER_STATUS_SET', () => {
    test('marks the app as up to date', () => {
      expect(
        serverstatus(
          initialServerStatusState,
          setServerStatus({ isLatestAppVersion: true }),
        ),
      ).toEqual({
        announcement: CLOSED_ANNOUNCEMENT,
        isLatestAppVersion: true,
      });
    });

    test('opens an announcement with a message and link', () => {
      const announcement = {
        open: true,
        message: 'New version available',
        link: 'https://example.com',
      };
      expect(
        serverstatus(
          initialServerStatusState,
          setServerStatus({ announcement, isLatestAppVersion: false }),
        ),
      ).toEqual({
        announcement,
        isLatestAppVersion: false,
      });
    });

    test('records the server being offline', () => {
      const next = serverstatus(
        initialServerStatusState,
        setServerStatus({
          announcement: {
            open: true,
            message: 'Please try again in a few minutes.',
          },
          isLatestAppVersion: false,
          serverOffline: true,
        }),
      );
      expect(next.serverOffline).toEqual(true);
      expect(next.announcement.open).toEqual(true);
    });

    test('resets keys absent from the delta back to their defaults', () => {
      // This reducer deliberately rebuilds from initial state rather than
      // merging onto the previous state, so a successful poll clears a stale
      // announcement instead of leaving it stuck open.
      const stale: ServerStatusState = {
        announcement: { link: 'l', message: 'server down', open: true },
        isLatestAppVersion: false,
        serverOffline: true,
      };
      expect(
        serverstatus(stale, setServerStatus({ isLatestAppVersion: true })),
      ).toEqual({
        announcement: CLOSED_ANNOUNCEMENT,
        isLatestAppVersion: true,
      });
    });

    test('clears serverOffline once the server responds again', () => {
      const offline = serverstatus(
        initialServerStatusState,
        setServerStatus({ serverOffline: true }),
      );
      expect(offline.serverOffline).toEqual(true);
      expect(
        serverstatus(offline, setServerStatus({ isLatestAppVersion: true }))
          .serverOffline,
      ).toBeUndefined();
    });

    test('does not mutate the previous state', () => {
      const state: ServerStatusState = {
        announcement: { link: '', message: '', open: true },
        isLatestAppVersion: false,
      };
      const next = serverstatus(
        state,
        setServerStatus({ isLatestAppVersion: true }),
      );
      expect(state.isLatestAppVersion).toEqual(false);
      expect(state.announcement.open).toEqual(true);
      expect(next).not.toBe(state);
    });

    test('leaves the exported initial state constant untouched', () => {
      serverstatus(
        initialServerStatusState,
        setServerStatus({
          announcement: { link: 'l', message: 'm', open: true },
          isLatestAppVersion: true,
        }),
      );
      expect(initialServerStatusState).toEqual({
        announcement: CLOSED_ANNOUNCEMENT,
        isLatestAppVersion: false,
      });
    });

    test('applies through a dispatched setServerStatus action', () => {
      Reducer(serverstatus)
        .withState({ ...initialServerStatusState })
        .expect(setServerStatus({ isLatestAppVersion: true }))
        .toReturnState({
          announcement: CLOSED_ANNOUNCEMENT,
          isLatestAppVersion: true,
        });
    });
  });
});
