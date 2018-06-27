import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import app from './reducers/CombinedReducers';

// For dev tools extension
declare const window: any;
declare const require: any;
declare const module: any;

let store: any = null;

function installStore(createdStore: any) {
  store = createdStore;
}

function createAppStore() {

  const devtools: any = window.devToolsExtension ? window.devToolsExtension() : (f: any) => f;
  const middleware = applyMiddleware(thunk);

  installStore(middleware(devtools(createStore))(app, {}));

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
