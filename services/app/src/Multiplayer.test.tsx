import {newMockStore} from './Testing';
import {MultiplayerClient} from './Multiplayer';

describe('Multiplayer', () => {

  describe('middleware behavior', () => {
    // Used for broken tests below
    const testArgs = {arg1: 'foo', arg2: 'bar'};
    const testActionFn = (a: {arg1: string, arg2: string}, dispatch?: Redux.Dispatch<any>, getState?: ()=>any) => {
      expect(a).toEqual(testArgs);
      if (dispatch === undefined) {
        throw new Error('dispatch not defined');
      }
      if (getState === undefined) {
        throw new Error('getState not defined');
      }
      dispatch({type: 'test'});
      return {arg1: a.arg1 + 'tated', arg2: a.arg2 + 'tered'};
    };

    describe('on vanilla actions', () => {
      test('passes regular actions through', () => {
        // We'll always need to be able to do this, since "regular"
        // actions are dispatched by the function-based actions
        const store = newMockStore();
        store.dispatch({type: 'test'});
        expect(store.getActions()).toEqual([{type: 'test'}]);
      });
    });

    describe('on actions of type ["name", args]', () => {
      const store = newMockStore();
      const client = store.multiplayerClient;
      client.sendEvent = jasmine.createSpy('sendEvent');
      store.dispatch(["testActionFn", testActionFn, testArgs]);

      test('resolves and calls the function', () => {
        expect(store.getActions()).toEqual([{type: 'test'}]);
      });

      test('broadcasts to remote clients using transformed args', () => {
        expect(client.sendEvent).toHaveBeenCalledWith({
          type: 'ACTION',
          name: 'testActionFn',
          args: JSON.stringify({arg1: 'footated', arg2: 'bartered'})
        });
      });
    });

    describe('on actions of type LOCAL', () => {
      const store = newMockStore();
      const client = store.multiplayerClient;
      client.sendEvent = jasmine.createSpy('sendEvent');
      store.dispatch({type: 'LOCAL', action: (dispatch?: Redux.Dispatch<any>) => {
        return dispatch({type: 'derived'});
      }});

      test('unwraps and forwards inner actions', () => {
        expect(store.getActions()).toEqual([{type: 'derived'}]);
      });

      test('does not dispatch to remote clients', () => {
        expect(client.sendEvent).not.toHaveBeenCalled();
      });
    });

    test.skip('wraps derived actions with LOCAL', () => { /* TODO */ });
  });

  describe('reconnection behavior', () => {
    test.skip('is triggered on connection failure', () => { /* TODO */ });
    test.skip('backs off with random exponential offset', () => { /* TODO */ });
    test.skip('publishes client status when reconnected', () => { /* TODO */ });
    test.skip('requests missed state and dispatches fast-forward actions', () => { /* TODO */ });
  });
});
