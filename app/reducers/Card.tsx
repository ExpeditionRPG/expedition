import Redux from 'redux'
import {CardState} from './StateTypes'
import {CardTransitioningAction, NavigateAction} from '../actions/ActionTypes'
import {NAVIGATION_DEBOUNCE_MS} from '../Constants'

const historyApi = (typeof history.pushState !== 'undefined');

// ts: 0 solves an obscure bug (instead of Date.now()) where rapidly triggering navigations with undefined states
// (specifically from the editor) wouldn't work b/c their ts diffs were < DEBOUNCE
export function card(state: CardState = {name: 'SPLASH_CARD', phase: null, ts: 0}, action: Redux.Action): CardState {
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
    case 'CARD_TRANSITIONING':
      return {...state, transitioning: (action as CardTransitioningAction).isTransitioning};
    default:
      return state;
  }
}
