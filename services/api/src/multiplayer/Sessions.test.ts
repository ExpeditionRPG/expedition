import {resetSessions, getSession, initSessionClient, setClientStatus, rmSessionClient} from './Sessions';
import {newMockWebsocket} from './TestData';
import {toClientKey} from 'shared/multiplayer/Session';

const CLI = "asdf";
const INST = "ghjk";
const KEY = toClientKey(CLI, INST);

describe('Multiplayer Sessions', () => {
  afterEach(resetSessions);

  describe('getSession', () => {
    test('gets a session', () => {
      initSessionClient(123, CLI, INST, null);
      expect(getSession(123)).not.toEqual(null);
    });
    test('returns null if no match', () => {
      expect(getSession(123)).toEqual(null);
    });
  });

  describe('initSessionClient', () => {
    test('initializes a client within a session', () => {
      const socket = newMockWebsocket();
      initSessionClient(123, CLI, INST, socket);
      expect(getSession(123)[KEY]).toEqual(jasmine.objectContaining({socket}));
    });
  });

  describe('setClientStatus', () => {
    test('sets the status for a client', () => {
      const status = {type: 'STATUS', name: 'test'};
      initSessionClient(123, CLI, INST, null);
      setClientStatus(123, CLI, INST, null, status);
      expect(getSession(123)[KEY]).toEqual(jasmine.objectContaining({status}));
    });

    test('inits client if not present in session map', () => {
      const status = {type: 'STATUS', name: 'test'};
      setClientStatus(123, CLI, INST, null, status);
      expect(getSession(123)[KEY]).toEqual(jasmine.objectContaining({status}));
    });
  });

  describe('rmSessionClient', () => {
    test('removes a client from a session', () => {
      initSessionClient(123, CLI, INST, null);
      rmSessionClient(123, CLI, INST);
      expect(getSession(123)[KEY]).not.toBeDefined();
    });
    test('does nothing if client does not exist in session', () => {
      initSessionClient(123, CLI, 'differentinstance', null);
      rmSessionClient(123, CLI, INST);
      expect(getSession(123)[KEY]).not.toBeDefined();
    });
  });

});
