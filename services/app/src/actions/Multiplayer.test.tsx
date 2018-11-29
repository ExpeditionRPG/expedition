import {Action, newMockStore} from '../Testing';
import {remoteify, clearMultiplayerActions} from '../multiplayer/Remoteify';
import {initialMultiplayer} from '../reducers/Multiplayer';
import {initialSettings} from '../reducers/Settings';
import {
  syncMultiplayer,
  loadMultiplayer,
  multiplayerNewSession,
  setMultiplayerStatus,
  multiplayerConnect,
  handleEvent,
  sendStatus,
  sendEvent,
  subscribeToEvents,
  unsubscribeFromEvents
} from './Multiplayer';
import {MULTIPLAYER_SETTINGS} from '../Constants';
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes';
import {defaultContext} from '../components/views/quest/cardtemplates/Template';

var cheerio = require('cheerio');

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
    subscribe: jasmine.createSpy('subscribe'),
    unsubscribe: jasmine.createSpy('unsubscribe'),
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
    test('empty', () => { /* Simple enough, no tests needed */});
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
    const doTest = () => {
      const c = fakeConnection();
      const s = {type: 'STATUS', line: 5};
      const actions = Action(setMultiplayerStatus, {multiplayer}).execute(s, c);
      return {c, s, actions};
    }

    test('sends socket status', () => {
      const {c} = doTest();
      expect(c.sendEvent).toHaveBeenCalledTimes(1);
    });

    test('dispatches status', () => {
      const {s, actions} = doTest();
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
    const node = new ParserNode(cheerio.load('<roleplay data-line="123"></roleplay>')('roleplay'), defaultContext());
    const cid = 2;

    const doTest = (client?: string, instance?: string, extras?: any, storeData?: any) => {
      const c = fakeConnection();
      const store = newMockStore({multiplayer, quest: {node}, commitID: cid, ...storeData});
      const result = store.dispatch(sendStatus(client, instance, extras, c));
      return {c, actions: store.getActions()};
    }

    test('sends line number, commit id, and other state vars', () => {
      const {c} = doTest();
      expect(c.sendEvent).toHaveBeenCalledWith({
        connected: true,
        lastEventID: cid,
        line: 123,
        numLocalPlayers: 1,
        type: 'STATUS',
        waitingOn: undefined
      }, cid);
    });
    test('overrides defaults when partial status passed', () => {
      const {c} = doTest(undefined, undefined, {waitingOn: 'something'});
      expect(c.sendEvent).toHaveBeenCalledWith(jasmine.objectContaining({waitingOn: 'something'}), cid);
    });
    test('dispatches status', () => {
      const {c, actions} = doTest();
      expect(actions).toContainEqual(jasmine.objectContaining({type: 'MULTIPLAYER_CLIENT_STATUS'}));
    });
    test('publishes locally', () => {
      const {c, actions} = doTest();
      expect(c.publish).toHaveBeenCalledTimes(1);
    });
    test('sends to remote clients if self-status', () => {
      const {c, actions} = doTest();
      expect(c.sendEvent).toHaveBeenCalledTimes(1);
    });
    test('does not send to remote clients if not self status', () => {
      const {c, actions} = doTest("nnn", "mmm");
      expect(c.sendEvent).not.toHaveBeenCalled();
    });
    test('persists waitingOn from store if not specified', () => {
      // This has failed multiple times for various reasons, so it's worthwhile to test it here.
      const {c, actions} = doTest(undefined, undefined, undefined, {
        multiplayer: {
          ...multiplayer,
          clientStatus: {
            "abc|def": {type: 'STATUS', connected: true, waitingOn: 'something'}, // Disconnected clients are not counted
          },
        },
      });
      expect(c.sendEvent).toHaveBeenCalledWith(jasmine.objectContaining({waitingOn: 'something'}), cid);
    });
  });

  describe('sendEvent', () => {
    const e = {};
    test('sends event via remote client', () => {
      const c = fakeConnection();
      const store = newMockStore();
      store.dispatch(sendEvent(e, 0, c));
      expect(c.sendEvent).toHaveBeenCalledTimes(1);
    });
    test('uses state commitID if not passed', () => {
      const c = fakeConnection();
      const store = newMockStore({commitID: 2});
      store.dispatch(sendEvent(e, undefined, c));
      expect(c.sendEvent).toHaveBeenCalledWith(e, 2);
    });
  });

  describe('subscribeToEvents/unsubscribeFromEvents/registerHandler', () => {
    test('empty', () => { /* Passthrough functions - nothing needed to test. */ });
  });

  describe('rejectEvent', () => {
    test('empty', () => { /* Simple - no need to test. */ });
  })

  describe('handleEvent', () => {
    afterEach(() => {
      clearMultiplayerActions();
    });
    test('handles status events from other clients', (done) => {
      let called = false;
      const store = newMockStore({multiplayer});
      store.dispatch(handleEvent({
        client: "abc", // same client
        instance: "mmm", // different instance
        id: 1,
        event: {
          type: 'STATUS',
          id: 2,
          event: "TOUCH_END",
          positions: {},
        },
      }, false, 0, multiplayer, fakeConnection())).then((result) => {
        expect(store.getActions()).toContainEqual(jasmine.objectContaining({client: 'abc', instance: 'mmm'}));
        done();
      }).catch(done.fail);
    });
    test('does not dispatch INTERACTION events', (done) => {
      let called = false;
      const store = newMockStore({multiplayer});
      store.dispatch(handleEvent({
        id: 1,
        event: {
          type: 'INTERACTION',
          id: 2,
          event: "TOUCH_END",
          positions: {},
        },
      }, false, 0, multiplayer, fakeConnection())).then((result) => {
        expect(store.getActions()).toEqual([]);
        done();
      }).catch(done.fail);
    });

    test('safely handles unknown events', (done) => {
      let called = false;
      const store = newMockStore({multiplayer});
      store.dispatch(handleEvent({
        id: 1,
        event: {type: 'BAD'},
      }, false, 0, multiplayer, fakeConnection())).then((result) => {
        expect(store.getActions()).toContainEqual(jasmine.objectContaining({type: 'MULTIPLAYER_COMMIT'}));
        done();
      }).catch(done.fail);
    });

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
        expect(c.publish).toHaveBeenCalledWith(jasmine.objectContaining({event: jasmine.objectContaining({type: "STATUS"})}));
        done();
      }).catch(done.fail);
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
