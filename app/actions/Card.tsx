import * as Redux from 'redux'
import {CardTransitioningAction, NavigateAction, remoteify} from './ActionTypes'
import {AppStateWithHistory, CardName, CardPhase} from '../reducers/StateTypes'
import {VIBRATION_LONG_MS, VIBRATION_SHORT_MS} from '../Constants'
import {getNavigator} from '../Globals'
import {getStore} from '../Store'

interface ToCardArgs {
  name: CardName;
  phase?: CardPhase;
  overrideDebounce?: boolean;
  noHistory?: boolean;
}
export const toCard = remoteify(function toCard(a: ToCardArgs, dispatch: Redux.Dispatch<any>, getState?: ()=>AppStateWithHistory): ToCardArgs {
  const nav = getNavigator();
  const state = (getState !== undefined) ? getState() : getStore().getState();
  const questId = (state.quest && state.quest.details && state.quest.details.id) || null;
  const vibration = state.settings && state.settings.vibration;
  if (nav && nav.vibrate && vibration) {
    if (a.phase === 'TIMER') {
      nav.vibrate(VIBRATION_LONG_MS);
    } else {
      nav.vibrate(VIBRATION_SHORT_MS);
    }
  }
  if (!a.noHistory) {
    dispatch({type: 'PUSH_HISTORY'});
  }

  const keylist: string[] = [a.name];
  if (a.phase) {
    keylist.push(a.phase);
  }
  const line = state.quest && state.quest.node && state.quest.node.elem.attr('data-line');
  if (line !== undefined) {
    keylist.push('L' + line);
  }

  dispatch({type: 'NAVIGATE', to: {...a, ts: Date.now(), key: keylist.join('|'), questId}, dontUpdateUrl: state.settings && state.settings.simulator} as NavigateAction);
  return a;
});

interface ToPreviousArgs {
  name?: CardName;
  phase?: CardPhase;
  before?: boolean;
  skip?: {name: CardName, phase: CardPhase}[];
}
export const toPrevious = remoteify(function toPrevious(a: ToPreviousArgs, dispatch: Redux.Dispatch<any>): ToPreviousArgs {
  const result = {
    type: 'RETURN',
    to: {
      name: a.name,
      ts: Date.now(),
      phase: a.phase,
    },
    before: Boolean(a.before),
    skip: a.skip,
  };

  dispatch(result);

  return a;
});

export function cardTransitioning(isTransitioning: boolean): CardTransitioningAction {
  return {type: 'CARD_TRANSITIONING', isTransitioning};
}


// TODO: getMultiplayerClient().registerModuleActions(module);
