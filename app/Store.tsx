import Redux, {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import questIDEApp from './reducers/CombinedReducers'
import {installStore as installAppStore} from 'expedition-app/app/Store'
import {getRemotePlayClient} from 'expedition-app/app/RemotePlay'

// For dev tools extension
declare var window:any;
declare var require:any;
declare var module:any;

export let store: Redux.Store<any>;

// This code re-routes the getState() method passed to the app's redux middleware,
// correctly scoping it only to the ".preview" param where it expects the app's state to live.
const appMiddleware = getRemotePlayClient().createActionMiddleware();
const adjustedAppMiddleware = ({dispatch, getState}: Redux.MiddlewareAPI<any>) => {
  return appMiddleware({
    dispatch,
    getState: () => {
      return store.getState().preview || {};
    }
  });
};

// from https://github.com/zalmoxisus/redux-devtools-extension#13-use-redux-devtools-extension-package-from-npm
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const initialState = {preview: {}};
const middleware = [thunk, adjustedAppMiddleware];
store = createStore(questIDEApp, initialState, composeEnhancers(applyMiddleware(...middleware)));

// We override getState() on the installed store for the embedded app, scoping it
// only to the ".preview" param where it expects the app's state to live.
installAppStore({
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
