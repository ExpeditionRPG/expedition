import {EventAction, ChoiceAction, InitQuestAction, CombatTimerStopAction, CombatDefeatAction, CombatVictoryAction, TierSumDeltaAction, AdventurerDeltaAction, ViewQuestAction} from './ActionTypes'
import {XMLElement} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'

export function handleCombatTimerStop(elapsedMillis: number): CombatTimerStopAction {
  return {type: 'COMBAT_TIMER_STOP', elapsedMillis};
}

export function initQuest(node: XMLElement): InitQuestAction {
  return {type: 'INIT_QUEST', node};
}

export function handleChoice(choice: number): ChoiceAction {
  return {type: 'CHOICE', choice};
}

export function handleEvent(event: string): EventAction {
  return {type: 'EVENT', event};
}

export function combatDefeat(): CombatDefeatAction {
  return {type: 'COMBAT_DEFEAT'};
}

export function combatVictory(): CombatVictoryAction {
  return {type: 'COMBAT_VICTORY'};
}

export function tierSumDelta(delta: number): TierSumDeltaAction {
  return {type: 'TIER_SUM_DELTA', delta};
}

export function adventurerDelta(delta: number): AdventurerDeltaAction {
  return {type: 'ADVENTURER_DELTA', delta};
}

// TODO: This should probably go in a "search" actions file.
export function viewQuest(quest: QuestDetails): ViewQuestAction {
  return {type: 'VIEW_QUEST', quest};
}