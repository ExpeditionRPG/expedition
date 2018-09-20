import configureStore from 'redux-mock-store';
import {MultiplayerClient} from './Multiplayer';

describe('Multiplayer', () => {
  let client: any;
  let mockStore: any;
  beforeEach(() => {
    client = new MultiplayerClient();
    mockStore = (initialState: any) => configureStore([client.createActionMiddleware()])(initialState);
  });

  describe('middleware behavior', () => {
    // Used for broken tests below
    // const testArgs = {arg1: 'foo', arg2: 'bar'};
    // const testActionFn = (a: {arg1: string, arg2: string}, dispatch?: Redux.Dispatch<any>, dispatchLocal?: Redux.Dispatch<any>, getState?: ()=>any) => {
    //   expect(a).toEqual(testArgs);
    //   if (dispatch === undefined) {
    //     throw new Error('dispatch not defined');
    //   }
    //   if (dispatchLocal === undefined) {
    //     throw new Error('dispatchLocal not defined');
    //   }
    //   if (getState === undefined) {
    //     throw new Error('getState not defined');
    //   }
    //   dispatch({type: 'test'});
    //   return {arg1: a.arg1 + 'tated', arg2: a.arg2 + 'tered'};
    // };

    describe('on vanilla actions', () => {
      test('passes regular actions through', () => {
        // We'll always need to be able to do this, since "regular" actions are dispatched by the function-based actions
        const store = mockStore({});
        store.dispatch({type: 'test'});
        expect(store.getActions()).toEqual([{type: 'test'}]);
      });
    });

    describe('on actions of type ["name", args]', () => {
      test('resolves and calls the function', () => {
        // TODO(scott): Fix this test
        /*
        const store = mockStore({});
        const m = {exports: [testActionFn]};
        client.registerModuleActions(m);
        store.dispatch(m.exports[0](testArgs));
        expect(store.getActions()).toEqual([{type: 'test'}]);
        */
      });

      test('broadcasts to remote clients using transformed args', () => {
        // TODO(scott): Fix this test
        /*
        client.sendEvent = jasmine.createSpy('sendEvent');
        const store = mockStore({});
        const m = {exports: [testActionFn]};
        client.registerModuleActions(m);
        store.dispatch(m.exports[0](testArgs));
        expect(client.sendEvent).toHaveBeenCalledWith({type: 'ACTION', name: 'testActionFn', args: {arg1: 'footated', arg2: 'bartered'}});
        */
      });
    });

    describe('on actions of type LOCAL', () => {
      test.skip('wraps derived actions with LOCAL', () => { /* TODO */ });
      test.skip('does not dispatch to remote clients', () => { /* TODO */ });
    });
  });

  describe('reconnection behavior', () => {
    test.skip('is triggered on connection failure', () => { /* TODO */ });
    test.skip('backs off with random exponential offset', () => { /* TODO */ });
    test.skip('publishes client status when reconnected', () => { /* TODO */ });
    test.skip('requests missed state and dispatches fast-forward actions', () => { /* TODO */ });
  });

  describe('dispatch behavior', () => {
    test.skip('uses the next event ID in the series', () => { /* TODO */ });
  });

  describe('routeEvent', () => {
    test.skip('does not dispatch INTERACTION events', () => { /* TODO */ });
    test.skip('resolves and dispatches ACTION events', () => { /* TODO */ });
    test.skip('shows a snackbar on ERROR events', () => { /* TODO */ });
    test.skip('safely handles unknown events', () => { /* TODO */ });
    test.skip('rejects COMMIT when no matching inflight action', () => { /* TODO */ });
    test.skip('rejects REJECT when no matching inflight action', () => { /* TODO */ });
    test.skip('rejects ACTIONs when id is not an increment', () => { /* TODO */ });
  });
});
