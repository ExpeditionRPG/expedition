import Redux from 'redux'
import {CardState} from './StateTypes'
import {NavigateAction} from '../actions/ActionTypes'
import {NAVIGATION_DEBOUNCE_MS} from '../Constants'

const historyApi = (typeof history.pushState !== 'undefined');

// ts: 0 solves an obscure bug (instead of Date.now()) where rapidly triggering navigations with undefined states
// (specifically from the editor) wouldn't work b/c their ts diffs were < DEBOUNCE
export function card(state: CardState = {name: 'SPLASH_CARD', ts: 0}, action: Redux.Action): CardState {
  console.log(action);
  switch (action.type) {
    case 'NAVIGATE':
      const navigateAction = (action as NavigateAction);
      if (historyApi) {
        history.pushState(null, '', window.location.hash || '#');
      }
      const to = navigateAction.to;
      if (to.ts - state.ts < NAVIGATION_DEBOUNCE_MS && !to.overrideDebounce) {
        return state;
      }
      return to;
    default:
      return state;
  }
}
