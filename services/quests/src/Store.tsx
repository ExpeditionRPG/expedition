import { getMultiplayerConnection } from 'app/multiplayer/Connection';
import { createMiddleware } from 'app/multiplayer/Middleware';
import { installStore as installAppStore } from 'app/Store';
import Redux, { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import questIDEApp from './reducers/CombinedReducers';

// For dev tools extension
declare let window: any;
declare let require: any;
declare let module: any;

// This code re-routes the getState() method passed to the app's redux middleware,
// correctly scoping it only to the ".preview" param where it expects the app's state to live.
const appMiddleware = createMiddleware(getMultiplayerConnection());
const adjustedAppMiddleware = ({ dispatch }: Redux.MiddlewareAPI<any>) => {
  return appMiddleware({
    dispatch,
    getState: () => {
      return store.getState().preview || {};
    },
  });
};

// from https://github.com/zalmoxisus/redux-devtools-extension#13-use-redux-devtools-extension-package-from-npm
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const initialState = { preview: {} };
const middleware = [thunk, adjustedAppMiddleware];
export const store: Redux.Store<any> = createStore(
  questIDEApp,
  initialState,
  composeEnhancers(applyMiddleware(...middleware)),
);

// We override getState() on the installed store for the embedded app, scoping it
// only to the ".preview" param where it expects the app's state to live.
installAppStore({
  dispatch: store.dispatch,
  getState() {
    return store.getState().preview || {};
  },
  replaceReducer: store.replaceReducer,
  subscribe: store.subscribe,
});

if (module && module.hot) {
  module.hot.accept('./reducers/CombinedReducers', () => {
    const updated = require('./reducers/CombinedReducers').default;
    store.replaceReducer(updated);
  });
}
