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
export const toCard = remoteify(function toCard(a: ToCardArgs, dispatch?: Redux.Dispatch<any>): ToCardArgs {
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

interface ToPreviousArgs {
  name?: CardName;
  phase?: CardPhase;
  before?: boolean;
  skip?: {name: CardName, phase: CardPhase}[];
}
export const toPrevious = remoteify(function toPrevious(a?: ToPreviousArgs, dispatch?: Redux.Dispatch<any>): ToPreviousArgs {
  const result = {
    type: 'RETURN',
    to: {
      name: a.name,
      ts: Date.now(),
      phase: a.phase
    },
    before: Boolean(a.before),
    skip: a.skip
  };

  dispatch(result);

  return result;
});

// TODO: getRemotePlayClient().registerModuleActions(module);
