import {newMockStore} from '../../Testing';
import {remoteify, clearMultiplayerActions} from '../../actions/ActionTypes';
import {configure, shallow} from 'enzyme';
import * as React from 'react';
import MultiplayerClient, {Props} from './MultiplayerClient';
import {initialMultiplayer} from '../../reducers/Multiplayer';
import {local} from '../../actions/Multiplayer';
import Adapter from 'enzyme-adapter-react-16';
import {initialSettings} from '../../reducers/Settings';
configure({ adapter: new Adapter() });

describe('Multiplayer', () => {

  function fakeConnection() {
    return {
      registerEventRouter: jasmine.createSpy('registerEventRouter'),
      getClientKey: jasmine.createSpy('getClientKey'),
      sendEvent: jasmine.createSpy('sendEvent'),
      hasInFlight: jasmine.createSpy('hasInFlight'),
      getClientAndInstance: jasmine.createSpy('getClientAndInstance').and.returnValue([123,456]),
      committedEvent: jasmine.createSpy('committedEvent'),
      rejectedEvent: jasmine.createSpy('rejectedEvent'),
      removeFromQueue: jasmine.createSpy('removeFromQueue'),
      publish: jasmine.createSpy('publish'),
    };
  }

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
      onAction: (a) => {store.dispatch(local(a));},
      disableAudio: jasmine.createSpy('disableAudio'),
      onLoadChange: jasmine.createSpy('onLoadChange'),
      loadAudio: jasmine.createSpy('loadAudio'),
      timestamp: 0,
      ...overrides,
    };
    return {store, props, a: shallow(<MultiplayerClient {...(props as any as Props)} />, undefined)};
  }

  describe('routeEvent', () => {
    afterEach(() => {
      clearMultiplayerActions();
    });
    test.skip('does not dispatch INTERACTION events', () => { /* TODO */ });
    test.skip('shows a snackbar on ERROR events', () => { /* TODO */ });
    test.skip('safely handles unknown events', () => { /* TODO */ });
    test.skip('rejects COMMIT when no matching inflight action', () => { /* TODO */ });
    test.skip('rejects REJECT when no matching inflight action', () => { /* TODO */ });
    test('resolves and dispatches ACTION events', () => {
      let called = false;
      const testAction = remoteify(function testAction(args: {n: number}) {
        called = true;
      });
      const {a} = setup();
      a.instance().handleEvent({
        id: 1,
        event: {
          type: 'ACTION',
          name: 'testAction',
          args: JSON.stringify({n: 1})
        },
      } as MultiplayerEvent);
      expect(called).toEqual(true);
    });
    test('rejects ACTIONs when id is not an increment', () => {
      let called = false;
      const testAction = remoteify(function testAction(args: {n: number}) {
        called = true;
      });
      const {a} = setup();
      a.instance().handleEvent({
        id: 2,
        event: {
          type: 'ACTION',
          name: 'testAction',
          args: JSON.stringify({n: 1})
        },
      } as MultiplayerEvent);
      expect(called).toEqual(false);
    });
    test('handles MULTI_EVENT', (done) => {
      // Update the commit ID when the action is executed
      const {props, a} = setup();
      const testAction = remoteify(function testAction(args: {n: number}) {
        a.setProps({commitID: args.n});
      });
      a.instance().handleEvent({
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
      } as MultiplayerEvent).then(() => {
        expect(props.onMultiEventStart).toHaveBeenCalled();
        expect(props.onMultiEventComplete).toHaveBeenCalled();
        expect(props.conn.committedEvent.calls.mostRecent().args).toEqual([3]);
        done()
      }).catch(done.fail);
    });
  });
});
