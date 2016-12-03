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
import {loadTriggerNode, loadCombatNode, loadRoleplayNode, handleChoice, handleEvent, RoleplayResult, CombatResult} from '../QuestParser'
import {QuestDetails, QuestContext} from '../reducers/QuestTypes'

export function handleCombatTimerStop(elapsedMillis: number): CombatTimerStopAction {
  return {type: 'COMBAT_TIMER_STOP', elapsedMillis};
}

export function initQuest(node: XMLElement, ctx: QuestContext): QuestNodeAction {
  // TODO: Handle quests beginning with combat
  return {type: 'QUEST_NODE', node, result: loadRoleplayNode(node, ctx)};
}

export function initCombat(node: XMLElement, settings: SettingsType, result: CombatResult): InitCombatAction {
  return {type: 'INIT_COMBAT', node, result, numPlayers: settings.numPlayers, difficulty: settings.difficulty};
}

export function choice(settings: SettingsType, node: XMLElement, index: number, ctx: QuestContext) {
  return (dispatch: Redux.Dispatch<any>): any => {
    var nextNode: XMLElement = handleChoice(node, index);
    loadNode(settings, dispatch, nextNode, ctx);
  }
}

export function loadNode(settings: SettingsType, dispatch: Redux.Dispatch<any>, nextNode: XMLElement, ctx: QuestContext) {
  var after: Redux.Action;
  var phase: any = undefined;
  var result: RoleplayResult|CombatResult;
  var tag = nextNode.get(0).tagName.toUpperCase();
  switch (tag) {
    case 'TRIGGER':
      // TODO: allow jumping via GOTO trigger
      let name: string = loadTriggerNode(nextNode).name;
      if (name === 'end') {
        return dispatch(toPrevious('QUEST_START', undefined, true));
      }
      throw new Error('invalid trigger ' + name);
    case 'ROLEPLAY':
      after = {type: 'QUEST_NODE', node: nextNode, result: loadRoleplayNode(nextNode, ctx)} as QuestNodeAction;
      break;
    case 'COMBAT':
      after = initCombat(nextNode, settings, loadCombatNode(nextNode, ctx));
      phase = 'DRAW_ENEMIES';
      break;
    default:
      throw new Error("Unsupported node type " + tag)
  }

  // Every choice has an effect.
  dispatch(after);
  dispatch(toCard('QUEST_CARD', phase));

}

export function event(node: XMLElement, evt: string, ctx: QuestContext) {
  return (dispatch: Redux.Dispatch<any>): any => {
    var nextNode: XMLElement = handleEvent(node, evt, ctx);
    loadNode(null, dispatch, nextNode, ctx);
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

export function adventurerDelta(numPlayers: number, delta: number): AdventurerDeltaAction {
  return {type: 'ADVENTURER_DELTA', delta, numPlayers};
}

// TODO: This should probably go in a "search" actions file.
export function viewQuest(quest: QuestDetails): ViewQuestAction {
  return {type: 'VIEW_QUEST', quest};
}