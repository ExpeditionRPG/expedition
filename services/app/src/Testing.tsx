import * as Redux from 'redux';
import configureStore from 'redux-mock-store';
import {MultiplayerClient} from './Multiplayer';
import combinedReducers from './reducers/CombinedReducers';
import {AppStateWithHistory} from './reducers/StateTypes';

export function newMockStoreWithInitializedState() {
  return newMockStore(combinedReducers({} as any, {type: '@@INIT'}));
}

interface MockStore extends Redux.Store {
  clearActions: () => void;
  getActions: any;
}

export function newMockStore(state: object): MockStore {
  const client = new MultiplayerClient();
  // Since this is a testing function, we play it a bit loose with the state type.
  const store = configureStore<AppStateWithHistory>([client.createActionMiddleware()])(state as any as AppStateWithHistory);
  return store;
}

// Put stuff here that is assumed to always exist (like settings)
const defaultGlobalState = {
  settings: {numPlayers: 1},
} as any as AppStateWithHistory;

export function Reducer<A extends Redux.Action>(reducer: (state: Object|undefined, action: A) => Object) {
  const defaultInitialState = reducer(undefined, ({type: '@@INIT'} as any));

  function internalReducerCommands(initialState: Object) {
    const client = new MultiplayerClient();
    const store = configureStore<AppStateWithHistory>([client.createActionMiddleware()])(defaultGlobalState);
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
          },
        };
      },
      execute: (action: A) => {
        store.dispatch(action);
        let newState = initialState;
        for (const a of store.getActions()) {
          newState = reducer(newState, a);
        }
        return newState;
      },
    };
  }

  return {
    withState: (state: Object) => {
      const initialState = state || defaultInitialState;
      return internalReducerCommands(initialState);
    },
  };
}

export function Action<A>(action: (a: A) => Redux.Action, baseState?: Object) {
  const client = new MultiplayerClient();
  client.sendEvent = jasmine.createSpy('sendEvent');
  let store = configureStore<AppStateWithHistory>([client.createActionMiddleware()])((baseState as any as AppStateWithHistory) ||  defaultGlobalState);

  function internalActionCommands() {
    return {
      expect: (a: A) => {
        store.dispatch(action(a));
        return {
          toSendMultiplayer(expected?: Object) {
            if (expected === undefined) {
              expect(client.sendEvent).toHaveBeenCalled();
            } else {
              expect(client.sendEvent).toHaveBeenCalledWith(jasmine.objectContaining({args: JSON.stringify(expected)}));
            }
          },
          toNotSendMultiplayer(expected?: Object) {
            if (expected === undefined) {
              expect(client.sendEvent).not.toHaveBeenCalled();
            } else {
              expect(client.sendEvent).not.toHaveBeenCalledWith(jasmine.objectContaining({args: JSON.stringify(expected)}));
            }
          },
          toDispatch(expected: Object) {
            expect(store.getActions()).toContain(expected);
          },
        };
      },
      execute: (a: A) => {
        store.dispatch(action(a));
        return store.getActions();
      },
    };
  }

  return {
    withState(storeState: Object) {
      store = configureStore<AppStateWithHistory>([client.createActionMiddleware()])(storeState as AppStateWithHistory);
      return internalActionCommands();
    },
    ...internalActionCommands(),
  };
}
