import Redux from 'redux'
import configureStore  from 'redux-mock-store'
import {installStore} from './Store'
import {RemotePlayClient, remoteify} from './RemotePlay'

describe('RemotePlay', () => {

  let client: any;
  let mockStore: any;
  beforeEach(() => {
    client = new RemotePlayClient();
    mockStore = (initialState: any) => {return configureStore([client.createActionMiddleware()])(initialState)};
  });

  fdescribe('middleware', () => {

    const testArgs = {arg1: 'foo', arg2: 'bar'};
    const testActionFn = (a: {arg1: string, arg2: string}, dispatch?: Redux.Dispatch<any>, dispatchLocal?: Redux.Dispatch<any>, getState?: ()=>any) => {
      expect(a).toEqual(testArgs);
      expect(dispatch).toBeDefined();
      expect(dispatchLocal).toBeDefined();
      expect(getState).toBeDefined();
      dispatch({type: 'test'});
      return {arg1: a.arg1 + 'tated', arg2: a.arg2 + 'tered'};
    };

    it('passes regular actions through', () => {
      // We'll always need to be able to do this, since "regular" actions are dispatched by the function-based actions
      const store = mockStore({});
      store.dispatch({type: 'test'});
      expect(store.getActions()).toEqual([{type: 'test'}]);
    });

    it('calls array-styled functions', () => {
      const store = mockStore({});
      const m = {exports: [testActionFn]};
      client.registerModuleActions(m);
      store.dispatch(m.exports[0](testArgs));
      expect(store.getActions()).toEqual([{type: 'test'}]);
    });

    it('always local-dispatches local actions and their offspring', () => {
      const store = mockStore({});
      client.registerModuleActions({exports: [testActionFn]});
      // TODO:
      //store.dispatch({type: 'REMOTE_PLAY_ACTION', })
    });

    it('broadcasts array-styled functions using transformed args', () => {
      client.sendEvent = jasmine.createSpy('sendEvent');
      const store = mockStore({});
      const m = {exports: [testActionFn]};
      client.registerModuleActions(m);
      store.dispatch(m.exports[0](testArgs));
      expect(client.sendEvent).toHaveBeenCalledWith({type: 'ACTION', name: 'testActionFn', args: {arg1: 'footated', arg2: 'bartered'}});
    });
  });
});
