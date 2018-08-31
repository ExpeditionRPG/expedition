import {QuestNodeAction, remoteify} from 'app/actions/ActionTypes';
import {audioSet} from 'app/actions/Audio';
import {toCard} from 'app/actions/Card';
import {choice, endQuest, loadNode} from 'app/actions/Quest';
import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import Redux from 'redux';
import {findCombatParent, handleCombatEnd} from '../combat/Actions';
import {ParserNode} from '../TemplateTypes';

export function initRoleplay(node: ParserNode, custom?: boolean) {
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
  const parentCombatElem = findCombatParent(a.node);

  // If there's no parent combat element, we've made a mistake somewhere and shouldn't even be in combat.
  // Handle the action and load the node as if it were a regular choice.
  if (parentCombatElem === null) {
    console.log('No parent combat element - handling as regular choice');
    dispatch(choice({node: a.node, index: a.index}));
    return remoteArgs;
  }

  const nextNode = a.node.handleAction(a.index);
  const next = a.node.getNext(a.index);
  let nextIsInSameCombat = false;
  if (nextNode && next) {
    const nextParentCombatElem = findCombatParent(nextNode);
    if (nextParentCombatElem !== null) {
      nextIsInSameCombat = nextParentCombatElem.length > 0 && parentCombatElem.attr('data-line') === nextParentCombatElem.attr('data-line');
    }

    // Check for and resolve triggers
    const nextIsTrigger = (next && next.getTag() === 'trigger');
    if (nextIsTrigger) {
      const triggerName = next.elem.text().trim().toLowerCase();
      if (triggerName === 'win' || triggerName === 'lose') {
        // If the trigger exits via the win/lose handlers, go to the appropriate
        // combat end card
        const victory = triggerName === 'win';
        dispatch(handleCombatEnd({
          maxTier: a.maxTier,
          node: new ParserNode(parentCombatElem, a.node.ctx),
          seed: a.seed,
          settings: a.settings,
          victory,
        }));
        return remoteArgs;
      } else if (triggerName.startsWith('goto') && nextIsInSameCombat) {
        // If we jump to somewhere in the same combat,
        // it's handled like a normal combat RP choice change (below).
      } else if (next.isEnd()) {
        // Treat quest end as normal, also stopping combat audio.
        dispatch(endQuest({}));
        dispatch(audioSet({intensity: 0}));
        return remoteArgs;
      } else {
        // Otherwise, treat like a typical event trigger.
        // Make sure we stop combat audio since we're exiting this combat.
        dispatch(loadNode(nextNode));
        dispatch(audioSet({intensity: 0}));
        return remoteArgs;
      }
    }
  }

  if (nextIsInSameCombat) {
    // Continue in-combat roleplay with the next node.
    dispatch({type: 'PUSH_HISTORY'});
    dispatch({type: 'QUEST_NODE', node: nextNode} as QuestNodeAction);
    dispatch(toCard({name: 'QUEST_CARD', phase: 'MID_COMBAT_ROLEPLAY', overrideDebounce: true, noHistory: true}));
  } else {
    // If the next node is out of this combat, that means we've dropped off the end of the
    // interestitial roleplay. Go back to combat resolution phase.
    dispatch({type: 'PUSH_HISTORY'});
    dispatch({type: 'QUEST_NODE', node: new ParserNode(parentCombatElem, a.node.ctx)} as QuestNodeAction);
    dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_ABILITIES', overrideDebounce: true, noHistory: true}));
  }
  return remoteArgs;
});
