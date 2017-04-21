import { createStore, applyMiddleware } from 'redux'
// import expeditionApp from './reducers/CombinedReducers'

var store: any = null;


export function getStore() {
  if (store !== null) {
    return store;
  }
  store = createStore();
  return store;
}
