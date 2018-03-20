import Redux from 'redux'
import {createStore, applyMiddleware} from 'redux'
import expeditionApp from './reducers/CombinedReducers'
import {AppStateWithHistory} from './reducers/StateTypes'
import {getRemotePlayClient} from './RemotePlay'
import { composeWithDevTools } from 'redux-devtools-extension'

// For dev tools extension
declare var window:any;
declare var require:any;
declare var module:any;

let store: Redux.Store<AppStateWithHistory>;

export function installStore(createdStore: Redux.Store<AppStateWithHistory>) {
  store = createdStore;
}

function createAppStore() {

  const devtools: any = window['devToolsExtension'] ? window['devToolsExtension']() : (f:any)=>f;
  const middleware = [getRemotePlayClient().createActionMiddleware()];

  const composeEnhancers = composeWithDevTools({
    actionsBlacklist: ['REMOTE_PLAY_CLIENT_STATUS', 'CARD_TRANSITIONING'],
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
