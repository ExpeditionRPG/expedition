import Redux from 'redux'
import {CardState} from './StateTypes'
import {NavigateAction} from '../actions/ActionTypes'
import {NAVIGATION_DEBOUNCE_MS} from '../Constants'

// ts: 0 solves an obscure bug (instead of Date.now()) where rapidly triggering navigations with undefined states
// (specifically from the editor) wouldn't work b/c their ts diffs were < DEBOUNCE
export function card(state: CardState = {name: 'SPLASH_CARD', ts: 0}, action: Redux.Action): CardState {
  switch (action.type) {
    case 'NAVIGATE':
      const to = (action as NavigateAction).to;
      if (to.ts - state.ts < NAVIGATION_DEBOUNCE_MS && !to.overrideDebounce) {
        return state;
      }
      return to;
    default:
      return state;
  }
}
