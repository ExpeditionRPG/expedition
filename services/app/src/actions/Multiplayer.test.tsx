import {Action} from '../Testing';
import {syncMultiplayer, loadMultiplayer, multiplayerNewSession, setMultiplayerStatus, multiplayerConnect} from './Multiplayer';
import {MULTIPLAYER_SETTINGS} from '../Constants';

// Need to polyfill headers in jest environment
global.Headers = ()=>{}

const mockResponse = (status, statusText, response) => {
  return {
    ok: (status === 200),
    status: status,
    statusText: statusText,
    headers: {
      'Content-type': 'application/json'
    },
    json: () => response,
  };
};

describe('Multiplayer actions', () => {
  let oldFetch: any;
  beforeEach(() => {
    oldFetch = window.fetch;
  });
  afterEach(() => {
    window.fetch = oldFetch;
  });

  describe('multiplayerDisconnect', () => {
    test.skip('empty', () => { /* Simple enough, no tests needed */});
  });

  describe('multiplayerNewSession', () => {
    test('creates and connects to a new session', (done) => {
      const handlers = (uri: string) => {
        switch (uri) {
          case MULTIPLAYER_SETTINGS.newSessionURI:
            return Promise.resolve(mockResponse(200, null, {secret: '1234'}));
          case MULTIPLAYER_SETTINGS.connectURI:
            return Promise.resolve(mockResponse(200, null, {session: 'testsession'}));
          default:
            return Promise.reject('no response for URI ' + uri);
        }
      };
      const fakeClient = {
        configure: jasmine.createSpy('configure');
        connect: jasmine.createSpy('connect');
      };
      Action(multiplayerNewSession, {}).execute({id: 'asdf'}, fakeClient, handlers).then((actions) => {
        expect(fakeClient.connect).toHaveBeenCalledWith('testsession', '1234');
        done();
      }).catch(done.fail);

    });
    test('catches and logs web errors', (done) => {
      const handler = () => Promise.reject('nah');
      Action(multiplayerNewSession, {}).execute({id: 'asdf'}, null, handler).then((actions) => {
        expect(actions[0]).toEqual(jasmine.objectContaining({type: 'SNACKBAR_OPEN'}));
        done();
      }).catch(done.fail);
    });
  });

  describe('multiplayerConnect', () => {
    test('connects to a session', (done) => {
      const fakeClient = {
        configure: jasmine.createSpy('configure');
        connect: jasmine.createSpy('connect');
      };
      const handler = () => Promise.resolve(mockResponse(200, null, {session: 'testsession'}));
      Action(multiplayerConnect, {}).execute({id: 'asdf'}, '1234', fakeClient, handler).then((actions) => {
        expect(fakeClient.connect).toHaveBeenCalledWith('testsession', '1234');
        done();
      }).catch(done.fail);
    });
    test('catches and indicates web errors', (done) => {
      const handler = () => Promise.reject('nah');
      Action(multiplayerConnect, {}).execute({id: 'asdf'}, '1234', null, handler).then((actions) => {
        expect(actions[0]).toEqual(jasmine.objectContaining({type: 'SNACKBAR_OPEN'}));
        done();
      }).catch(done.fail);
    });
  });

  describe('loadMultiplayer', () => {
    test('fetches past sessions by user id', (done) => {
      const testHistory: MultiplayerSessionMeta[] = [
        {
          id: 1,
          secret: '1234',
          questTitle: 'Test Quest',
          peerCount: 5,
          lastAction: '{}',
        },
      ];
      const handler = () => Promise.resolve(mockResponse(200, null, {history: testHistory}));
      Action(loadMultiplayer, {}).execute({id: 'asdf'}, handler).then((actions) => {
        expect(actions[0]).toEqual(jasmine.objectContaining({history: testHistory}));
        done();
      }).catch(done.fail);
    });
    test('ignores web errors', (done) => {
      const handler = () => Promise.reject('nah');
      Action(loadMultiplayer, {}).execute({id: 'asdf'}, handler).then((actions) => {
        expect(actions[1]).toEqual(jasmine.objectContaining({type: 'NAVIGATE'}));
        done();
      }).catch(done.fail);
    });
  });

  describe('setMultiplayerStatus', () => {
    const fakeClient = {
      sendStatus: jasmine.createSpy('sendStatus'),
      getID: () => '123',
      getInstance: () => '456',
    };
    const s = {type: 'STATUS', line: 5};
    const actions = Action(setMultiplayerStatus, {}).execute(s, fakeClient);

    test('sends socket status', () => {
      expect(fakeClient.sendStatus).toHaveBeenCalledWith(s);
    })
    test('dispatches status', () => {
      expect(actions[0]).toEqual(jasmine.objectContaining({status: s}));
    });
  });

  describe('syncMultiplayer', () => {
    const fakeClient = {
      sync: jasmine.createSpy('sync'),
    };
    test('syncs the client', () => {
      Action(syncMultiplayer, {}).execute(fakeClient);
      expect(fakeClient.sync).toHaveBeenCalledTimes(1);
    });
  });
});
