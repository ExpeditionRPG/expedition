import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import questIDEApp from './reducers/CombinedReducers'
import {installStore} from 'expedition-app/app/store'

// For dev tools extension
declare var window:any;
declare var require:any;
declare var module:any;

let devtools: any = window['devToolsExtension'] ? window['devToolsExtension']() : (f:any)=>f;
let middleware = applyMiddleware(thunk);

export const store: any = middleware(devtools(createStore))(questIDEApp, {preview: {}});
installStore({
  getState: function() {
    return store.getState().preview || {};
  },
  subscribe: store.subscribe,
  dispatch: store.dispatch,
  replaceReducer: store.replaceReducer,
});

if (module && module.hot) {
  module.hot.accept('./reducers/CombinedReducers', () => {
    let updated = require('./reducers/CombinedReducers').default;
    store.replaceReducer(updated);
  });
}