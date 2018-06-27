import Redux, {applyMiddleware, compose, createStore} from 'redux';
import thunk from 'redux-thunk';
import adminApp from './reducers/CombinedReducers';

declare var window: any;
declare var require: any;
declare var module: any;

export let store: Redux.Store<any>;

// from https://github.com/zalmoxisus/redux-devtools-extension#13-use-redux-devtools-extension-package-from-npm
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const initialState = {};
const middleware = [thunk];
store = createStore(adminApp, initialState, composeEnhancers(applyMiddleware(...middleware)));

// We override getState() on the installed store for the embedded app, scoping it
// only to the ".preview" param where it expects the app's state to live.

if (module && module.hot) {
  module.hot.accept('./reducers/CombinedReducers', () => {
    const updated = require('./reducers/CombinedReducers').default;
    store.replaceReducer(updated);
  });
}
