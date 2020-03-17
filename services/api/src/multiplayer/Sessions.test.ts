import { toClientKey } from 'shared/multiplayer/Session';
import {
  getSession,
  initSessionClient,
  resetSessions,
  rmSessionClient,
  setClientStatus,
} from './Sessions';
import { newMockWebsocket } from './TestData';

const CLI = 'asdf';
const INST = 'ghjk';
const KEY = toClientKey(CLI, INST);

describe('Multiplayer Sessions', () => {
  afterEach(resetSessions);

  describe('getSession', () => {
    test('gets a session', () => {
      initSessionClient(123, CLI, INST, null as any);
      expect(getSession(123)).not.toEqual(null);
    });
    test('returns null if no match', () => {
      expect(getSession(123)).toEqual(null);
    });
  });

  describe('initSessionClient', () => {
    test('initializes a client within a session', () => {
      const socket = newMockWebsocket();
      initSessionClient(123, CLI, INST, socket as any);
      expect((getSession(123) || {})[KEY]).toEqual(
        jasmine.objectContaining({ socket }),
      );
    });
  });

  describe('setClientStatus', () => {
    test('sets the status for a client', () => {
      const status: any = { type: 'STATUS', name: 'test' };
      initSessionClient(123, CLI, INST, null as any);
      setClientStatus(123, CLI, INST, null as any, status);
      expect((getSession(123) || {})[KEY]).toEqual(
        jasmine.objectContaining({ status }),
      );
    });

    test('inits client if not present in session map', () => {
      const status: any = { type: 'STATUS', name: 'test' };
      setClientStatus(123, CLI, INST, null as any, status);
      expect((getSession(123) || {})[KEY]).toEqual(
        jasmine.objectContaining({ status }),
      );
    });
  });

  describe('rmSessionClient', () => {
    test('removes a client from a session', () => {
      initSessionClient(123, CLI, INST, null as any);
      rmSessionClient(123, CLI, INST);
      expect((getSession(123) || {})[KEY]).not.toBeDefined();
    });
    test('does nothing if client does not exist in session', () => {
      initSessionClient(123, CLI, 'differentinstance', null as any);
      rmSessionClient(123, CLI, INST);
      expect((getSession(123) || {})[KEY]).not.toBeDefined();
    });
  });
});
