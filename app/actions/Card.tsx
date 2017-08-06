import {NavigateAction, ReturnAction} from './ActionTypes'
import {AppStateWithHistory, CardName, CardPhase, CardState} from '../reducers/StateTypes'
import {VIBRATION_LONG_MS, VIBRATION_SHORT_MS} from '../Constants'
import {getNavigator} from '../Globals'
import {getStore} from '../Store'

export function toCard(name: CardName, phase?: CardPhase, overrideDebounce?: boolean): NavigateAction {
  const state: AppStateWithHistory = getStore().getState();
  const nav = getNavigator();
  if (nav && nav.vibrate && state.settings.vibration) {
    if (phase === 'TIMER') {
      nav.vibrate(VIBRATION_LONG_MS);
    } else {
      nav.vibrate(VIBRATION_SHORT_MS);
    }
  }
  return {type: 'NAVIGATE', to: {name, ts: Date.now(), phase, overrideDebounce}};
}

export function toPrevious(name?: CardName, phase?: CardPhase, before?: boolean, skip?: {name: CardName, phase: CardPhase}[]): ReturnAction {
  return {type: 'RETURN', to: {name, ts: Date.now(), phase}, before: Boolean(before), skip};
}
