import {EventAction, ChoiceAction, InitQuestAction, CombatTimerStopAction, CombatDefeatAction, CombatVictoryAction, TierSumDeltaAction, AdventurerDeltaAction} from './ActionTypes'
import {XMLElement} from '../reducers/StateTypes'

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

/*
function questResultToAction(result: QuestResult): NavigateAction | ReturnAction {
  if (result.name === 'TRIGGER' && loadTriggerNode(result.node).name === 'end') {
    return {type: 'RETURN', before: 'QUEST_START'};
  }
  return navigateTo(Object.assign({}, result, {entry: 'NEXT'}));
}*/
