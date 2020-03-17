import {configure, mount as enzymeMount, render as enzymeRender} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import {Provider} from 'react-redux';
import * as Redux from 'redux';
import configureStore from 'redux-mock-store';
import {loggedOutUser} from 'shared/auth/UserState';
import {Connection, setMultiplayerConnection} from './multiplayer/Connection';
import {createMiddleware} from './multiplayer/Middleware';
import combinedReducers from './reducers/CombinedReducers';
import {AppStateWithHistory} from './reducers/StateTypes';

configure({ adapter: new Adapter() });

export function newMockStoreWithInitializedState() {
  return newMockStore(combinedReducers({} as any, {type: '@@INIT'}));
}

interface MockStore extends Redux.Store {
  clearActions: () => void;
  getActions: any;
}

export function newMockStore(state: object, client= new Connection(() => Promise.resolve(false))): MockStore {
  // Since this is a testing function, we play it a bit loose with the state type.
  const store = configureStore<AppStateWithHistory>([createMiddleware(client)])(state as any as AppStateWithHistory);
  (store as any).multiplayerClient = client;
  setMultiplayerConnection(client);
  return store;
}

// Put stuff here that is assumed to always exist (like settings)
const defaultGlobalState = {
  settings: {numLocalPlayers: 1},
} as any as AppStateWithHistory;

export function Reducer<A extends Redux.Action>(reducer: (state: object|undefined, action: A) => object) {
  const defaultInitialState = reducer(undefined, ({type: '@@INIT'} as any));

  function internalReducerCommands(initialState: object) {
    const client = new Connection();
    const store = configureStore<AppStateWithHistory>([createMiddleware(client)])(defaultGlobalState);
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

export function Action<A>(action: (...a: any[]) => Redux.Action, baseState?: object, client= new Connection()) {
  client.sendEvent = jasmine.createSpy('sendEvent');
  setMultiplayerConnection(client);
  let store = configureStore<AppStateWithHistory>([createMiddleware(client)])((baseState as any as AppStateWithHistory) ||  defaultGlobalState);

  function internalActionCommands() {
    return {
      execute: (...a: any[]) => {
        const v = store.dispatch(action(...a));
        if (v && v instanceof Promise) {
          return v.then(() => store.getActions()) as any;
        }
        return store.getActions() as any;
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
      store = configureStore<AppStateWithHistory>([createMiddleware(client)])(storeState as AppStateWithHistory);
      return internalActionCommands();
    },
    ...internalActionCommands(),
  };
}

const BASE_ENZYME_STATE = {
  saved: {list: []},
  userQuests: {history: {}},
  user: loggedOutUser,
};
export function render(e: JSX.Element, state: Partial<AppStateWithHistory> = {}) {
  const store = newMockStore({...BASE_ENZYME_STATE, ...state});
  const root = enzymeRender(<Provider store={store}>{e}</Provider>, undefined /*renderOptions*/);
  return root; // No need to get child elements, as provider does not render as an element.
}
const unmounts: Array<() => void> = [];
export function mountRoot(e: JSX.Element, state: Partial<AppStateWithHistory> = {}) {
  const store = newMockStore({...BASE_ENZYME_STATE, ...state});
  const root = enzymeMount(<Provider store={store}>{e}</Provider>, undefined /*renderOptions*/);
  unmounts.push(() => root.unmount());
  return root;
}
export function mount(e: JSX.Element, state: Partial<AppStateWithHistory> = {}) {
  return mountRoot(e, state).childAt(0);
}
export function unmountAll() {
  while (unmounts.length > 0) {
    const um = unmounts.shift();
    if (!um) {
      return;
    }
    um();
  }
}
