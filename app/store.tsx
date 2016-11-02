import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import expeditionApp from './reducers/CombinedReducers'

// For dev tools extension
declare var window:any;
declare var require:any;
declare var module:any;

let devtools: any = window['devToolsExtension'] ? window['devToolsExtension']() : (f:any)=>f;
let middleware = applyMiddleware(thunk);

export const store: any = middleware(devtools(createStore))(expeditionApp, {});
console.log(store);

if (module && module.hot) {
  module.hot.accept('./reducers/CombinedReducers', () => {
    let updated = require('./reducers/CombinedReducers').default;
    store.replaceReducer(updated);
  });
}
