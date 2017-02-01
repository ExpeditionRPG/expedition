import {CardName, XMLElement, SearchPhase} from '../reducers/StateTypes'
import {CombatPhaseNameType} from '../reducers/QuestTypes'
import {NavigateAction, ReturnAction} from './ActionTypes'

export function toCard(name: CardName, phase?: CombatPhaseNameType | SearchPhase, overrideDebounce?: boolean): NavigateAction {
  return {type: 'NAVIGATE', to: {name, ts: Date.now(), phase, overrideDebounce}};
}

export function toPrevious(name?: CardName, phase?: CombatPhaseNameType | SearchPhase, before?: boolean): ReturnAction {
  return {type: 'RETURN', to: {name, ts: Date.now(), phase}, before: Boolean(before)};
}
