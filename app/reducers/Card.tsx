import Redux from 'redux'
import {CardState, CardName} from './StateTypes'
import {NavigateAction} from '../actions/ActionTypes'
import {NAVIGATION_DEBOUNCE_MS} from '../Constants'
import {getHistoryApi} from '../Globals'

export const initialCardState = {
  name: 'SPLASH_CARD' as CardName,
  phase: null,
  key: '',
  ts: 0,
  questId: ''
};

// ts: 0 solves an obscure bug (instead of Date.now()) where rapidly triggering navigations with undefined states
// (specifically from the editor) wouldn't work b/c their ts diffs were < DEBOUNCE
export function card(state: CardState = initialCardState, action: Redux.Action): CardState {
  switch (action.type) {
    case 'NAVIGATE':
      const to = (action as NavigateAction).to;
      if (!(action as NavigateAction).dontUpdateUrl) {
        getHistoryApi().pushState(null, '', '#' + (to.questId || ''));
      }
      if (to.key === state.key && to.ts - state.ts < NAVIGATION_DEBOUNCE_MS && !to.overrideDebounce) {
        return state;
      }
      return to;
    default:
      return state;
  }
}
