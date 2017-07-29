import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import expeditionApp from './reducers/CombinedReducers'

// For dev tools extension
declare var window:any;
declare var require:any;
declare var module:any;

let store: any = null;

export function installStore(createdStore: any) {
  store = createdStore;
}

function createAppStore() {

  const devtools: any = window['devToolsExtension'] ? window['devToolsExtension']() : (f:any)=>f;
  const middleware = applyMiddleware(thunk);

  installStore(middleware(devtools(createStore))(expeditionApp, {}));

  if (module && module.hot) {
    module.hot.accept('./reducers/CombinedReducers', () => {
      const updated = require('./reducers/CombinedReducers').default;
      store.replaceReducer(updated);
    });
  }
}

export function getStore() {
  if (store !== null) {
    return store;
  }
  createAppStore();
  return store;
}
