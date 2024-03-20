import * as createRavenMiddleware from 'raven-for-redux';
import Redux, {applyMiddleware, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import {getMultiplayerConnection} from './multiplayer/Connection';
import {createMiddleware} from './multiplayer/Middleware';
import expeditionApp from './reducers/CombinedReducers';
import {AppStateWithHistory} from './reducers/StateTypes';

declare const require: any;
declare const module: any;

let store: Redux.Store<AppStateWithHistory>;

export function installStore(createdStore: Redux.Store<AppStateWithHistory>) {
  store = createdStore;
}

export function createAppStore(raven: any = null) {
  const middleware = [createMiddleware(getMultiplayerConnection())];
  if (raven) {
    middleware.push(createRavenMiddleware(raven, {
      stateTransformer: (state: AppStateWithHistory): AppStateWithHistory => {
        // raven-for-redux loops indefinitely when attempting to serialize recursive objects,
        // unlike vanilla JS serialization which detects cycles. We filter out ParserNode objects
        // which may contain these self-references.
        return {
          ...state,
          _history: ('hidden' as any),
          quest: {...state.quest, node: ('hidden' as any)},
        };
      },
    }));
  }
  const composeEnhancers = composeWithDevTools({
    actionsBlacklist: ['MULTIPLAYER_CLIENT_STATUS'],
  });
  installStore(createStore(expeditionApp,  composeEnhancers(applyMiddleware(...middleware))));

  if (module && module.hot) {
    module.hot.accept('./reducers/CombinedReducers', () => {
      const updated = require('./reducers/CombinedReducers').default;
      store.replaceReducer(updated);
    });
  }
}

export function getStore() {
  if (store !== undefined) {
    return store;
  }
  createAppStore();
  return store;
}
