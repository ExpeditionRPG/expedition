import {Action, newMockStore} from '../Testing';
import {remoteify, clearMultiplayerActions} from '../multiplayer/Remoteify';
import {initialMultiplayer} from '../reducers/Multiplayer';
import {initialSettings} from '../reducers/Settings';
import {syncMultiplayer, loadMultiplayer, multiplayerNewSession, setMultiplayerStatus, multiplayerConnect, handleEvent} from './Multiplayer';
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

function fakeConnection() {
  return {
    registerEventRouter: jasmine.createSpy('registerEventRouter'),
    getClientKey: jasmine.createSpy('getClientKey'),
    sendEvent: jasmine.createSpy('sendEvent'),
    hasInFlight: jasmine.createSpy('hasInFlight'),
    getClientAndInstance: jasmine.createSpy('getClientAndInstance').and.returnValue([123,456]),
    committedEvent: jasmine.createSpy('committedEvent'),
    rejectedEvent: jasmine.createSpy('rejectedEvent'),
    publish: jasmine.createSpy('publish'),
    sync: jasmine.createSpy('sync'),
  };
}

// Fake "connected" multiplayer state
const multiplayer = {
  ...initialMultiplayer,
  connected: true,
  client: "abc",
  instance: "def",
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
      Action(multiplayerNewSession, {multiplayer}).execute({id: 'asdf'}, fakeClient, handlers).then((actions) => {
        expect(fakeClient.connect).toHaveBeenCalledWith('testsession', '1234');
        done();
      }).catch(done.fail);

    });
    test('catches and logs web errors', (done) => {
      const handler = () => Promise.reject('nah');
      Action(multiplayerNewSession, {multiplayer}).execute({id: 'asdf'}, null, handler).then((actions) => {
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
      Action(multiplayerConnect, {multiplayer}).execute({id: 'asdf'}, '1234', fakeClient, handler).then((actions) => {
        expect(fakeClient.connect).toHaveBeenCalledWith('testsession', '1234');
        done();
      }).catch(done.fail);
    });
    test('catches and indicates web errors', (done) => {
      const handler = () => Promise.reject('nah');
      Action(multiplayerConnect, {multiplayer}).execute({id: 'asdf'}, '1234', null, handler).then((actions) => {
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
      Action(loadMultiplayer, {multiplayer}).execute({id: 'asdf'}, handler).then((actions) => {
        expect(actions[0]).toEqual(jasmine.objectContaining({history: testHistory}));
        done();
      }).catch(done.fail);
    });
    test('ignores web errors', (done) => {
      const handler = () => Promise.reject('nah');
      Action(loadMultiplayer, {multiplayer}).execute({id: 'asdf'}, handler).then((actions) => {
        expect(actions[1]).toEqual(jasmine.objectContaining({type: 'NAVIGATE'}));
        done();
      }).catch(done.fail);
    });
  });

  describe('setMultiplayerStatus', () => {
    const c = fakeConnection();
    const s = {type: 'STATUS', line: 5};
    const actions = Action(setMultiplayerStatus, {multiplayer}).execute(s, c);

    test('sends socket status', () => {
      expect(c.sendEvent).toHaveBeenCalledTimes(1);
    })
    test('dispatches status', () => {
      expect(actions[0]).toEqual(jasmine.objectContaining({status: jasmine.objectContaining(s)}));
    });
  });

  describe('syncMultiplayer', () => {
    test('syncs the client', () => {
      const c = fakeConnection();
      Action(syncMultiplayer, {multiplayer}).execute(c);
      expect(c.sync).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendStatus', () => {
    test.skip('sends line number, commit id, and other state vars', () => { /* TODO */ });
    test.skip('overrides defaults when partial status passed', () => { /* TODO */ });
    test.skip('dispatches status', () => { /* TODO */ });
    test.skip('publishes locally', () => { /* TODO */ });
    test.skip('sends to remote clients if self-status', () => { /* TODO */ });
    test.skip('does not send to remote clients if not self status', () => { /* TODO */ });
  });

  describe('sendEvent', () => {
    test.skip('uses state commitID if not passed', () => { /* TODO */ });
    test.skip('sends event via remote client', () => { /* TODO */ });
  });

  describe('subscribeToEvents', () => {
    test.skip('subscribes handler to remote events', () => { /* TODO */ });
  });

  describe('unsubscribeFromEvents', () => {
    test.skip('unsubscribes handler from remote events', () => { /* TODO */ });
  });

  describe('registerHandler', () => {
    test.skip('registers a connection handler', () => { /* TODO */ });
  });

  describe('rejectEvent', () => {
    test.skip('dispatches the rejection', () => { /* TODO */ });
  })

  describe('handleEvent', () => {



    /*
    function setup(overrides: Partial<Props> = {}): Env {
      const store = newMockStore();
      const props: Props = {
        conn: fakeConnection(),
        commitID: 0,
        line: 0,
        multiplayer: initialMultiplayer,
        settings: initialSettings,
        onMultiEventStart: jasmine.createSpy('onMultiEventStart'),
        onMultiEventComplete: jasmine.createSpy('onMultiEventComplete'),
        onStatus: jasmine.createSpy('onStatus'),
        onAction: (a) => {return store.dispatch(local(a));},
        disableAudio: jasmine.createSpy('disableAudio'),
        onLoadChange: jasmine.createSpy('onLoadChange'),
        loadAudio: jasmine.createSpy('loadAudio'),
        timestamp: 0,
        ...overrides,
      };
      return {store, props, a: shallow(<MultiplayerClient {...(props as any as Props)} />, undefined)};
    }
    */

    afterEach(() => {
      clearMultiplayerActions();
    });

    test.skip('does not dispatch INTERACTION events', () => { /* TODO */ });
    test.skip('logs ERROR events', () => { /* TODO */ });
    test.skip('safely handles unknown events', () => { /* TODO */ });

    test('resolves and dispatches ACTION events', () => {
      let called = false;
      function testAction(args: {n: number}) {called = true;}
      remoteify(testAction);
      const result = Action(handleEvent, {multiplayer}).execute({
        id: 1,
        event: {
          type: 'ACTION',
          name: 'testAction',
          args: JSON.stringify({n: 1})
        },
      }, false, 0, multiplayer, fakeConnection());
      expect(called).toEqual(true);
    });
    test('rejects ACTIONs and sends status when id is not an increment', (done) => {
      const c = fakeConnection();
      Action(handleEvent, {multiplayer}).execute({
        id: 2,
        event: {
          type: 'ACTION',
          name: 'testAction',
          args: JSON.stringify({n: 1})
        },
      }, false, 0, multiplayer, c).then((result) => {
        done.fail('did not fail');
      }).catch(() => {
        expect(c.publish).toHaveBeenCalledWith(jasmine.objectContaining({event: jasmine.objectContaining({type: "STATUS"})}));
        done();
      });
    });
    test('handles MULTI_EVENT', (done) => {
      // Update the commit ID when the action is executed
      let calls = 0;
      const testAction = remoteify(function testAction(args: {n: number}) {calls++;});
      Action(handleEvent, {multiplayer}).execute({
        id: 1,
        event: {
          type: 'MULTI_EVENT',
          lastId: 3,
          events: [
            JSON.stringify({id: 1, event: {type: 'ACTION', name: 'testAction', args: JSON.stringify({n: 1})}}),
            JSON.stringify({id: 2, event: {type: 'ACTION', name: 'testAction', args: JSON.stringify({n: 2})}}),
            JSON.stringify({id: 3, event: {type: 'ACTION', name: 'testAction', args: JSON.stringify({n: 3})}}),
          ],
        } as MultiEvent,
      }, false, 0, multiplayer, fakeConnection()).then((results) => {
        expect(results[0].type).toEqual("MULTIPLAYER_MULTI_EVENT_START");
        expect(calls).toEqual(3);
        expect(results[results.length-1].type).toEqual("MULTIPLAYER_MULTI_EVENT");
        done();
      }).catch(done.fail);
    });
    test('handles MULTI_EVENT with async events', (done) => {
      // Update the commit ID when the action is executed
      let actions = 0;
      const asyncAction = remoteify(function asyncAction(args: {n: number}) {
        return {
          promise: new Promise((f, r) => {
            setTimeout(() => {
              actions++;
              f();
            }, 200);
          }),
        };
      });
      Action(handleEvent, {multiplayer}).execute({
        id: 1,
        event: {
          type: 'MULTI_EVENT',
          lastId: 3,
          events: [
            JSON.stringify({id: 1, event: {type: 'ACTION', name: 'asyncAction', args: JSON.stringify({n: 1})}}),
            JSON.stringify({id: 2, event: {type: 'ACTION', name: 'asyncAction', args: JSON.stringify({n: 2})}}),
            JSON.stringify({id: 3, event: {type: 'ACTION', name: 'asyncAction', args: JSON.stringify({n: 3})}}),
          ],
        } as MultiEvent,
      }, false, 0, multiplayer, fakeConnection()).then(() => {
        expect(actions).toEqual(3);
        done();
      }).catch(done.fail);
    });
  });
});
