import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import expeditionApp from './reducers/CombinedReducers'

// For dev tools extension
declare var window:any;
declare var require:any;
declare var module:any;

var store: any = null;

export function installStore(createdStore: any) {
  store = createdStore;
}

function createAppStore() {

  let devtools: any = window['devToolsExtension'] ? window['devToolsExtension']() : (f:any)=>f;
  let middleware = applyMiddleware(thunk);

  installStore(middleware(devtools(createStore))(expeditionApp, {}));

  if (module && module.hot) {
    module.hot.accept('./reducers/CombinedReducers', () => {
      let updated = require('./reducers/CombinedReducers').default;
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
