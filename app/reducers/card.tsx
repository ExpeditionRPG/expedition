import {CardState} from './StateTypes'
import {NavigateAction, ReturnAction} from '../actions/ActionTypes'
import {NAVIGATION_DEBOUNCE_MS} from '../constants'

export function card(state: CardState = {name: 'SPLASH_CARD', ts: Date.now()}, action: Redux.Action): CardState {
  switch (action.type) {
    case 'NAVIGATE':
      const to = (action as NavigateAction).to;
      if (to.ts - state.ts < NAVIGATION_DEBOUNCE_MS) {
        return state;
      }
      return to;
    default:
      return state;
  }
}
