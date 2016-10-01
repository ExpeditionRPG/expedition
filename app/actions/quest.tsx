import {EventAction, ChoiceAction, InitQuestAction, CombatTimerStopAction} from './ActionTypes'
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

/*
function questResultToAction(result: QuestResult): NavigateAction | ReturnAction {
  if (result.name === 'TRIGGER' && loadTriggerNode(result.node).name === 'end') {
    return {type: 'RETURN', before: 'QUEST_START'};
  }
  return navigateTo(Object.assign({}, result, {entry: 'NEXT'}));
}*/
