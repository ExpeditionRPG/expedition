import {QuestNodeAction} from 'app/actions/ActionTypes';
import {audioSet} from 'app/actions/Audio';
import {toCard} from 'app/actions/Card';
import {endQuest, loadNode} from 'app/actions/Quest';
import {remoteify} from 'app/multiplayer/Remoteify';
import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import Redux from 'redux';
import {findCombatParent, handleCombatEnd} from '../combat/Actions';
import {ParserNode} from '../TemplateTypes';

export function initRoleplay(node: ParserNode) {
  return (dispatch: Redux.Dispatch<any>): any => {
    // We set the quest state *after* updating the history to prevent
    // the history from grabbing the quest state before navigating.
    // This bug manifests as toPrevious() sliding back to the same card
    // content.
    dispatch({type: 'PUSH_HISTORY'});
    dispatch({type: 'QUEST_NODE', node} as QuestNodeAction);
    dispatch(toCard({name: 'QUEST_CARD', phase: 'ROLEPLAY', noHistory: true}));
  };
}

type evalState = 'END'|'ENDROUND'|'ENDCOMBAT'|'VICTORY'|'DEFEAT';

function combatContainsNode(combatElem: Cheerio, node: ParserNode) {
  const nodeParent = findCombatParent(node);
  if (nodeParent !== null && combatElem !== null) {
    return nodeParent.length > 0 && combatElem.attr('data-line') === nodeParent.attr('data-line');
  }
  return false;
}

export function getNextMidCombatNode(node: ParserNode, index: number): {nextNode: ParserNode, state: evalState|null} {
  const parentCombatElem = findCombatParent(node);
  const nextNode = node.handleAction(index);

  // If there's no parent combat element, we've made a mistake somewhere and shouldn't even be in combat.
  // Handle the action and load the node as if it were a regular choice.
  if (parentCombatElem === null) {
    console.log('No parent combat element - handling as regular choice');
    if (nextNode === null) {
      throw new Error('Could not find next node');
    }
    return {nextNode, state: 'ENDCOMBAT'};
  }

  const next = node.getNext(index);
  let nextIsInSameCombat = false;
  if (nextNode && next) {
    nextIsInSameCombat = combatContainsNode(parentCombatElem, nextNode);

    // Check for and resolve triggers
    const nextIsTrigger = (next && next.getTag() === 'trigger');
    if (nextIsTrigger) {
      const triggerName = next.elem.text().trim().toLowerCase();
      if (triggerName === 'win' || triggerName === 'lose') {
        // If the trigger exits via the win/lose handlers, go to the appropriate
        // combat end card
        return {
          nextNode: new ParserNode(parentCombatElem, node.ctx, index),
          state: (triggerName === 'win') ? 'VICTORY' : 'DEFEAT',
        };
      } else if (triggerName.startsWith('goto') && nextIsInSameCombat) {
        // If we jump to somewhere in the same combat,
        // it's handled like a normal combat RP choice change (below).
      } else if (next.isEnd()) {
        // Treat quest end as normal, also stopping combat audio.
        return {nextNode: node, state: 'END'};
      } else {
        // Otherwise, treat like a typical event trigger.
        // Make sure we stop combat audio since we're exiting this combat.
        return {nextNode, state: 'ENDCOMBAT'};
      }
    }
  }

  if (nextNode && nextIsInSameCombat) {
    // Continue in-combat roleplay with the next node.
    return {nextNode, state: null};
  } else {
    // If the next node is out of this combat, that means we've dropped off the end of the
    // interestitial roleplay. Go back to combat resolution phase.
    return {nextNode: new ParserNode(parentCombatElem, node.ctx, index), state: 'ENDROUND'};
  }
}

interface MidCombatChoiceArgs {
  index: number;
  maxTier: number;
  node?: ParserNode;
  seed: string;
  settings?: SettingsType;
}
export const midCombatChoice = remoteify(function midCombatChoice(a: MidCombatChoiceArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): MidCombatChoiceArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }

  const remoteArgs: MidCombatChoiceArgs = {index: a.index, seed: a.seed, maxTier: a.maxTier};
  const {nextNode, state} = getNextMidCombatNode(a.node, a.index);
  switch (state) {
    case 'ENDCOMBAT':
      dispatch(loadNode(nextNode));
      dispatch(audioSet({intensity: 0}));
      break;
    case 'VICTORY':
    case 'DEFEAT':
      dispatch(handleCombatEnd({
        maxTier: a.maxTier,
        node: nextNode,
        seed: a.seed,
        settings: a.settings,
        victory: (state === 'VICTORY'),
      }));
      break;
    case 'END':
      dispatch(endQuest({}));
      dispatch(audioSet({intensity: 0}));
      break;
    case 'ENDROUND':
      dispatch({type: 'PUSH_HISTORY'});
      dispatch({type: 'QUEST_NODE', node: nextNode} as QuestNodeAction);
      dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_ABILITIES', overrideDebounce: true, noHistory: true}));
      break;
    default: // in-combat roleplay continues
      dispatch({type: 'PUSH_HISTORY'});
      dispatch({type: 'QUEST_NODE', node: nextNode} as QuestNodeAction);
      dispatch(toCard({name: 'QUEST_CARD', phase: 'MID_COMBAT_ROLEPLAY', overrideDebounce: true, noHistory: true}));
      break;
  }
  return remoteArgs;
});
