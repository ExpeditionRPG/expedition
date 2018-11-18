import * as Redux from 'redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import combinedReducers from './reducers/CombinedReducers';
import {AppState} from './reducers/StateTypes';

export function newMockStoreWithInitializedState() {
  return newMockStore(combinedReducers({} as any, {type: '@@INIT'}));
}

interface MockStore extends Redux.Store {
  clearActions: () => void;
  getActions: any;
}

export function newMockStore(state: object): MockStore {
  // Since this is a testing function, we play it a bit loose with the state type.
  return configureStore<AppState>([thunk])(state as any as AppState);
}

// Put stuff here that is assumed to always exist (like settings)
const defaultGlobalState = {
  settings: {numLocalPlayers: 1},
} as any as AppState;

export function Reducer<A extends Redux.Action>(reducer: (state: object|undefined, action: A) => object) {
  const defaultInitialState = reducer(undefined, ({type: '@@INIT'} as any));

  function internalReducerCommands(initialState: object) {
    const store = configureStore<AppState>([thunk])(defaultGlobalState);
    return {
      execute: (action: A) => {
        store.dispatch(action);
        let newState = initialState;
        for (const a of store.getActions()) {
          newState = reducer(newState, a);
        }
        return newState;
      },
      expect: (action: A) => {
        store.dispatch(action);
        let newState = initialState;
        for (const a of store.getActions()) {
          newState = reducer(newState, a);
        }
        return {
          toChangeState: (expectedChanges: object) => {
            expect(newState).toEqual(jasmine.objectContaining(expectedChanges));
          },
          toReturnState: (expected: object) => {
            expect(newState).toEqual(expected);
          },
          toStayTheSame: () => {
            expect(newState).toBe(initialState);
          },
        };
      },
    };
  }

  return {
    withState: (state: object) => {
      const initialState = state || defaultInitialState;
      return internalReducerCommands(initialState);
    },
  };
}

export function Action<A>(action: (...a: any[]) => Redux.Action, baseState?: object) {
  let store = configureStore<AppState>([thunk])((baseState as any as AppState) ||  defaultGlobalState);

  function internalActionCommands() {
    return {
      execute: (...a: any[]) => {
        const v = store.dispatch(action(...a));
        if (v && v instanceof Promise) {
          return v.then(() => store.getActions());
        }
        return store.getActions();
      },
      expect: (...a: any[]) => {
        store.dispatch(action(...a));
        return {
          toDispatch(expected: object) {
            expect(store.getActions()).toContainEqual(expected);
          },
        };
      },
    };
  }

  return {
    withState(storeState: object) {
      store = configureStore<AppState>([thunk])(storeState as AppState);
      return internalActionCommands();
    },
    ...internalActionCommands(),
  };
}
