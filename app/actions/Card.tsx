import * as Redux from 'redux'
import {NavigateAction, ReturnAction, remoteify} from './ActionTypes'
import {AppStateWithHistory, CardName, CardPhase, CardState} from '../reducers/StateTypes'
import {VIBRATION_LONG_MS, VIBRATION_SHORT_MS} from '../Constants'
import {getNavigator} from '../Globals'
import {getStore} from '../Store'
import {getRemotePlayClient} from '../RemotePlay'

interface ToCardArgs {
  name: CardName;
  phase?: CardPhase;
  overrideDebounce?: boolean;
}
export const toCardBase = remoteify(function toCardBase(a: ToCardArgs, dispatch?: Redux.Dispatch<any>): ToCardArgs {
  const state: AppStateWithHistory = getStore().getState();
  const nav = getNavigator();
  if (nav && nav.vibrate && state.settings.vibration) {
    if (a.phase === 'TIMER') {
      nav.vibrate(VIBRATION_LONG_MS);
    } else {
      nav.vibrate(VIBRATION_SHORT_MS);
    }
  }
  dispatch({type: 'NAVIGATE', to: {...a, ts: Date.now()}} as NavigateAction);

  return a;
});

// TODO: Remove once everything is migrated to new fn({args}) format
export function toCard(name: CardName, phase?: CardPhase, overrideDebounce?: boolean) {
  return toCardBase({name, phase, overrideDebounce});
}

export function toPrevious(name?: CardName, phase?: CardPhase, before?: boolean, skip?: {name: CardName, phase: CardPhase}[]): ReturnAction {
  return {type: 'RETURN', to: {name, ts: Date.now(), phase}, before: Boolean(before), skip};
}

// TODO: getRemotePlayClient().registerModuleActions(module);
