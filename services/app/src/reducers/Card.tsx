import Redux from 'redux';
import {NavigateAction} from '../actions/ActionTypes';
import {NAV_CARD_STORAGE_KEY, NAVIGATION_DEBOUNCE_MS} from '../Constants';
import {getHistoryApi} from '../Globals';
import {getStorageString} from '../LocalStorage';
import {CardName, CardState} from './StateTypes';

export const initialCardState = {
  key: '',
  name: 'SPLASH_CARD' as CardName,
  phase: null,
  questId: '',
  ts: 0,
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
    case 'QUEST_EXIT':
      getHistoryApi().pushState(null, '', '#');
      return {
        ...initialCardState,
        name: getStorageString(NAV_CARD_STORAGE_KEY, 'TUTORIAL_QUESTS') as CardName,
      };
    default:
      return state;
  }
}
