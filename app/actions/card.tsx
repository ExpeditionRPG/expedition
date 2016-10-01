import {CardName, XMLElement} from '../reducers/StateTypes'
import {CombatPhaseNameType} from '../reducers/QuestTypes'
import {NavigateAction, ReturnAction} from './ActionTypes'

export function toCard(name: CardName): NavigateAction {
  return {type: 'NAVIGATE', to: {name, ts: Date.now()}};
}

export function toCombatPhase(phase: CombatPhaseNameType): NavigateAction {
  return {type: 'NAVIGATE', to: {name: 'QUEST_CARD', ts: Date.now(), phase}};
}

export function toPrevious(before: string = undefined): ReturnAction {
  return {type: 'RETURN', before};
}