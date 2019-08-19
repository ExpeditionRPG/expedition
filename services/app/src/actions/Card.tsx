import * as Redux from 'redux';
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes';
import {NAV_CARD_STORAGE_KEY, VIBRATION_LONG_MS, VIBRATION_SHORT_MS} from '../Constants';
import {getNavigator} from '../Globals';
import {getStorageString} from '../LocalStorage';
import {remoteify} from '../multiplayer/Remoteify';
import {AppStateWithHistory, CardName} from '../reducers/StateTypes';
import {getStore} from '../Store';
import {NavigateAction} from './ActionTypes';

export interface ToCardArgs {
  keySuffix?: string;
  name: CardName;
  noHistory?: boolean;
  overrideDebounce?: boolean;
  vibrateLong?: boolean;
}
export const toCard = remoteify(function toCard(a: ToCardArgs, dispatch: Redux.Dispatch<any>, getState?: () => AppStateWithHistory): ToCardArgs {
  const nav = getNavigator();
  const state = (getState !== undefined) ? getState() : getStore().getState();
  const questId = (state.quest && state.quest.details && state.quest.details.id) || null;
  const vibration = state.settings && state.settings.vibration;

  if (nav && nav.vibrate && vibration) {
    nav.vibrate((a.vibrateLong) ? VIBRATION_LONG_MS : VIBRATION_SHORT_MS);
  }

  if (!a.noHistory) {
    dispatch({type: 'PUSH_HISTORY'});
  }

  const keylist: string[] = [a.name];
  if (state.quest && state.quest.node) { // In tests, quest.node may not be set up
    const line = state.quest.node.elem.attr('data-line');
    if (line !== undefined) {
      keylist.push('L' + line);
    }
    keylist.push(state.quest.node.ctx.templates.combat.phase);
    keylist.push(state.quest.node.ctx.templates.decision.phase);
  }
  if (a.keySuffix) {
    keylist.push(a.keySuffix);
  }

  dispatch({type: 'NAVIGATE', to: {...a, ts: Date.now(), key: keylist.join('|'), questId}, dontUpdateUrl: state.settings && state.settings.simulator} as NavigateAction);
  return a;
});

interface ToPreviousArgs {
  before?: boolean;
  matchFn?: (c: CardName, n: ParserNode) => boolean;
}
export const toPrevious = remoteify(function toPrevious(a: ToPreviousArgs, dispatch: Redux.Dispatch<any>): ToPreviousArgs {
  dispatch({
    before: Boolean(a.before),
    matchFn: a.matchFn,
    type: 'RETURN',
  });

  return a;
});

interface ToNavCardArgs {
  name?: CardName;
}
export const toNavCard = remoteify(function toNavCard(a: ToNavCardArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): ToNavCardArgs {
  const name = a.name || getStorageString(NAV_CARD_STORAGE_KEY, 'TUTORIAL_QUESTS') as CardName;
  dispatch(toCard({name}));
  return {name};
});
