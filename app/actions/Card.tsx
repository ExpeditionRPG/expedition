import {NavigateAction, ReturnAction, ActionFnArgs, RemoteDispatch} from './ActionTypes'
import {AppStateWithHistory, CardName, CardPhase, CardState} from '../reducers/StateTypes'
import {VIBRATION_LONG_MS, VIBRATION_SHORT_MS} from '../Constants'
import {getNavigator} from '../Globals'
import {getStore} from '../Store'
import {getRemotePlayClient, remoteify} from '../RemotePlay'

interface ToCardArgs extends ActionFnArgs {
  name: CardName;
  phase?: CardPhase;
  overrideDebounce?: boolean;
}

export const toCardBase = remoteify(function toCardBase(a: ToCardArgs, dispatch?: RemoteDispatch): ToCardArgs {
  console.log('toCarding');
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

export function toCard(name: CardName, phase?: CardPhase, overrideDebounce?: boolean) {
  return toCardBase({name, phase, overrideDebounce});
}

export function toPrevious(name?: CardName, phase?: CardPhase, before?: boolean, skip?: {name: CardName, phase: CardPhase}[]): ReturnAction {
  return {type: 'RETURN', to: {name, ts: Date.now(), phase}, before: Boolean(before), skip};
}

getRemotePlayClient().registerModuleActions(module);
