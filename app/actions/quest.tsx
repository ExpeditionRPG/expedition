import Redux from 'redux'
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
import {SettingsType, XMLElement} from '../reducers/StateTypes'
import {toCard, toPrevious} from './card'
import {loadTriggerNode, loadCombatNode, loadRoleplayNode, handleChoice, handleEvent, RoleplayResult, CombatResult} from '../QuestParser'
import {QuestDetails, QuestContext} from '../reducers/QuestTypes'


export function handleCombatTimerStop(elapsedMillis: number, settings: SettingsType): CombatTimerStopAction {
  return {type: 'COMBAT_TIMER_STOP', elapsedMillis, settings};
}

export function initQuest(id: string, questNode: XMLElement, ctx: QuestContext): QuestNodeAction {
  const firstNode = questNode.children().eq(0);
  const details = {
    id: id,
    title: questNode.attr('title'),
    summary: questNode.attr('summary'),
    author: questNode.attr('author'),
    email: questNode.attr('email'),
    url: questNode.attr('url'),
    minPlayers: questNode.attr('minPlayers'),
    maxPlayers: questNode.attr('maxPlayers'),
    minTimeMinutes: questNode.attr('minTimeMinutes'),
    maxTimeMinutes: questNode.attr('maxTimeMinutes'),
  };
  return {type: 'QUEST_NODE', node: firstNode, result: loadRoleplayNode(firstNode, ctx), details};
}

export function initCombat(node: XMLElement, settings: SettingsType, result: CombatResult): InitCombatAction {
  return {type: 'INIT_COMBAT', node, result, numPlayers: settings.numPlayers, difficulty: settings.difficulty};
}

export function choice(settings: SettingsType, node: XMLElement, index: number, ctx: QuestContext) {
  return (dispatch: Redux.Dispatch<any>): any => {
    var nextNode: XMLElement = handleChoice(node, index, ctx);
    loadNode(settings, dispatch, nextNode, ctx);
  }
}

export function loadNode(settings: SettingsType, dispatch: Redux.Dispatch<any>, node: XMLElement, ctx: QuestContext) {
  var after: Redux.Action;
  var phase: any = undefined;
  var tag = node.get(0).tagName.toUpperCase();
  switch (tag) {
    case 'TRIGGER':
      var trigger = loadTriggerNode(node);
      if (trigger.name === 'end') {
        dispatch(toCard('QUEST_END'));
        return;
      } else if (trigger.name === 'goto') {
        loadNode(settings, dispatch, trigger.node, ctx);
        return;
      } else {
        throw new Error('invalid trigger ' + trigger.name);
      }
    case 'ROLEPLAY':
      var result = loadRoleplayNode(node, ctx);
      after = {type: 'QUEST_NODE', node, result} as QuestNodeAction;
      break;
    case 'COMBAT':
      after = initCombat(node, settings, loadCombatNode(node, ctx));
      phase = 'DRAW_ENEMIES';
      break;
    default:
      throw new Error('Unsupported node type ' + tag);
  }

  // Every choice has an effect.
  dispatch(toCard('QUEST_CARD', phase));

  // We set the quest state *after* the toCard() dispatch to prevent
  // the history from grabbing the quest state before navigating.
  // This bug manifests as toPrevious() sliding back to the same card
  // content.
  dispatch(after);
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
