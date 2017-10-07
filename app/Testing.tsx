import * as Redux from 'redux'
import configureStore from 'redux-mock-store'
import {RemotePlayClient} from './RemotePlay'
import {AppState} from './reducers/StateTypes'

export function newMockStore() {
  const client = new RemotePlayClient();
  const store = configureStore([client.createActionMiddleware()])({});
  return store;
}

export function Reducer<A extends Redux.Action>(reducer: (state: Object, action: A) => Object) {
  const defaultInitialState = reducer(undefined, ({type: '@@INIT'} as any));

  function internalReducerCommands(initialState: Object) {
    const client = new RemotePlayClient();
    const store = configureStore([client.createActionMiddleware()])({});
    return {
      expect: (action: A) => {
        store.dispatch(action);
        let newState = initialState;
        for (const a of store.getActions()) {
          newState = reducer(newState, a);
        }
        return {
          toReturnState: (expected: Object) => {
            expect(newState).toEqual(expected);
          },
          toStayTheSame: () => {
            expect(newState).toBe(initialState);
          },
          toChangeState: (expectedChanges: Object) => {
            expect(newState).toEqual(jasmine.objectContaining(expectedChanges));
          }
        };
      },
      execute: (action: A) => {
        store.dispatch(action);
        let newState = initialState;
        for (const a of store.getActions()) {
          newState = reducer(newState, action);
        }
        return newState;
      }
    };
  }

  return {
    withState: (state: Object) => {
      const initialState = state || defaultInitialState;
      return internalReducerCommands(initialState);
    },
  };
}

export function Action<A>(action: (a: A) => Redux.Action) {
  const client = new RemotePlayClient();
  client.sendEvent = jasmine.createSpy('sendEvent');
  let store = configureStore([client.createActionMiddleware()])({});

  function internalActionCommands() {
    return {
      expect: (a: A) => {
        store.dispatch(action(a));
        return {
          toSendRemote(expected?: Object) {
            if (expected === undefined) {
              expect(client.sendEvent).toHaveBeenCalled();
            } else {
              expect(client.sendEvent).toHaveBeenCalledWith(jasmine.objectContaining({args: JSON.stringify(expected)}));
            }
          },
          toNotSendRemote(expected?: Object) {
            if (expected === undefined) {
              expect(client.sendEvent).not.toHaveBeenCalled();
            } else {
              expect(client.sendEvent).not.toHaveBeenCalledWith(jasmine.objectContaining({args: JSON.stringify(expected)}));
            }
          },
          toDispatch(expected: Object) {
            expect(store.getActions()).toContain(expected);
          }
        }
      },
      execute: (a: A) => {
        store.dispatch(action(a));
        return store.getActions();
      },
    };
  }

  return {
    withState(storeState: Object) {
      store = configureStore([client.createActionMiddleware()])(storeState);
      return internalActionCommands();
    },
    ...internalActionCommands()
  };
}
