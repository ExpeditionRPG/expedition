import {NavigateAction, ReturnAction} from './ActionTypes'
import {AppStateWithHistory, CardName, SearchPhase, XMLElement} from '../reducers/StateTypes'
import {CombatPhaseNameType} from '../reducers/QuestTypes'
import {VIBRATION_LONG_MS, VIBRATION_SHORT_MS} from '../constants'
import {getStore} from '../store'

declare var navigator:any;


export function toCard(name: CardName, phase?: CombatPhaseNameType | SearchPhase, overrideDebounce?: boolean): NavigateAction {
  let state: AppStateWithHistory = getStore().getState();
  if (navigator.vibrate && state.settings.vibration) {
    if (phase === 'TIMER') {
      navigator.vibrate(VIBRATION_LONG_MS);
    } else {
      navigator.vibrate(VIBRATION_SHORT_MS);
    }
  }
  return {type: 'NAVIGATE', to: {name, ts: Date.now(), phase, overrideDebounce}};
}

export function toPrevious(name?: CardName, phase?: CombatPhaseNameType | SearchPhase, before?: boolean): ReturnAction {
  return {type: 'RETURN', to: {name, ts: Date.now(), phase}, before: Boolean(before)};
}
