import Redux, {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import questIDEApp from './reducers/CombinedReducers'
import {installStore} from 'expedition-app/app/Store'
import {getRemotePlayClient} from 'expedition-app/app/RemotePlay'

// For dev tools extension
declare var window:any;
declare var require:any;
declare var module:any;

// from https://github.com/zalmoxisus/redux-devtools-extension#13-use-redux-devtools-extension-package-from-npm
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const initialState = {preview: {}};
const middleware = [thunk, getRemotePlayClient().createActionMiddleware()];
export const store: any = createStore(questIDEApp, initialState, composeEnhancers(applyMiddleware(...middleware)));

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
