import Redux, { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import adminApp from './reducers/CombinedReducers';

declare let window: any;
declare let require: any;
declare let module: any;

// from https://github.com/zalmoxisus/redux-devtools-extension#13-use-redux-devtools-extension-package-from-npm
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = [thunk];
// No preloaded state: combinedReduce() normalises a falsy state to `{}` itself
// (`state = state || {}`), so `createStore(r, {}, e)` and `createStore(r, e)`
// produce the same first state. redux 4.2 tightened `PreloadedState<S>` to
// require every key of S, so `{}` no longer type-checks.
export const store: Redux.Store<any> = createStore(
  adminApp,
  composeEnhancers(applyMiddleware(...middleware)),
);

// We override getState() on the installed store for the embedded app, scoping it
// only to the ".preview" param where it expects the app's state to live.

if (module && module.hot) {
  module.hot.accept('./reducers/CombinedReducers', () => {
    const updated = require('./reducers/CombinedReducers').default;
    store.replaceReducer(updated);
  });
}
