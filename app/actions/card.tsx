import {CardName, XMLElement, SearchPhase} from '../reducers/StateTypes'
import {CombatPhaseNameType} from '../reducers/QuestTypes'
import {NavigateAction, ReturnAction} from './ActionTypes'

export function toCard(name: CardName, phase: CombatPhaseNameType | SearchPhase = undefined): NavigateAction {
  return {type: 'NAVIGATE', to: {name, ts: Date.now()}, phase};
}

export function toPrevious(name: CardName = undefined, phase: CombatPhaseNameType | SearchPhase = undefined, before: boolean = false): ReturnAction {
  return {type: 'RETURN', to: name, phase, before};
}