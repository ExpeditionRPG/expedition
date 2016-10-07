import {
  QuestNodeAction,
  InitCombatAction,
  CombatTimerStopAction,
  CombatDefeatAction,
  CombatVictoryAction,
  TierSumDeltaAction,
  AdventurerDeltaAction,
  ViewQuestAction
} from './ActionTypes'
import {XMLElement, SettingsType} from '../reducers/StateTypes'
import {toCard, toPrevious} from './card'
import {loadTriggerNode, loadCombatNode, handleChoice, handleEvent} from '../QuestParser'
import {QuestDetails} from '../reducers/QuestTypes'

export function handleCombatTimerStop(elapsedMillis: number): CombatTimerStopAction {
  return {type: 'COMBAT_TIMER_STOP', elapsedMillis};
}

export function initQuest(node: XMLElement): QuestNodeAction {
  return {type: 'QUEST_NODE', node};
}

export function initCombat(node: XMLElement, settings: SettingsType): InitCombatAction {
  return {type: 'INIT_COMBAT', node, numPlayers: settings.numPlayers, difficulty: settings.difficulty};
}

export function choice(settings: SettingsType, node: XMLElement, index: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    var nextNode: XMLElement = handleChoice(node, index);
    console.log(nextNode.tagName);
    var after: Redux.Action;
    switch (nextNode.tagName.toUpperCase()) {
      case 'TRIGGER':
        let name: string = loadTriggerNode(nextNode).name;
        if (name === 'end') {
          return dispatch(toPrevious('QUEST_START', true));
        }
        throw new Error('invalid trigger ' + name);
      case 'COMBAT':
        after = initCombat(nextNode, settings);
        break;
      default:
        after = {type: 'QUEST_NODE', node: nextNode} as QuestNodeAction;
    }
    // Every choice has an effect.
    dispatch(toCard('QUEST_CARD'));
    dispatch(after);
  }
}

export function event(node: XMLElement, evt: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    var nextNode: XMLElement = handleEvent(node, evt);
    dispatch(toCard('QUEST_CARD', undefined));
    dispatch({type: 'QUEST_NODE', node: nextNode});
  }
}

export function combatDefeat(): CombatDefeatAction {
  return {type: 'COMBAT_DEFEAT'};
}

export function combatVictory(numPlayers: number, maxTier: number): CombatVictoryAction {
  return {type: 'COMBAT_VICTORY', numPlayers, maxTier};
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