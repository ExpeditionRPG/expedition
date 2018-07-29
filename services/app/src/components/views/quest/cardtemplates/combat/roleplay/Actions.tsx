import Redux from 'redux';
import * as seedrandom from 'seedrandom';
import {QuestNodeAction, remoteify} from '../../../../../../actions/ActionTypes';
import {audioSet} from '../../../../../../actions/Audio';
import {toCard} from '../../../../../../actions/Card';
import {setMultiplayerStatus} from '../../../../../../actions/Multiplayer';
import {endQuest, loadNode} from '../../../../../../actions/Quest';
import {COMBAT_DIFFICULTY, MUSIC_INTENSITY_MAX, PLAYER_TIME_MULT} from '../../../../../../Constants';
import {PLAYER_DAMAGE_MULT} from '../../../../../../Constants';
import {ENCOUNTERS} from '../../../../../../Encounters';
import {Enemy, Loot} from '../../../../../../reducers/QuestTypes';
import {AppStateWithHistory, DifficultyType, MultiplayerState, SettingsType} from '../../../../../../reducers/StateTypes';
import {getStore} from '../../../../../../Store';
import {numLocalAndMultiplayerAdventurers, numLocalAndMultiplayerPlayers} from '../../MultiplayerPlayerCount';
import {defaultContext} from '../../Template';
import {ParserNode} from '../../TemplateTypes';
import {handleCombatEnd} from '../Actions';
import {CombatAttack, CombatDifficultySettings, CombatState} from '../Types';

function findCombatParent(node: ParserNode) {
  let elem = node && node.elem;
  while (elem !== null && elem.length > 0 && elem.get(0).tagName.toLowerCase() !== 'combat') {
    elem = elem.parent();
  }
  return elem;
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
  const nextNode = a.node.handleAction(a.index);
  const next = a.node.getNext(a.index);
  let nextIsInSameCombat = false;
  if (nextNode && next) {
    const nextParentCombatElem = findCombatParent(nextNode);
    nextIsInSameCombat = (nextParentCombatElem && nextParentCombatElem.length > 0) && parentCombatElem.attr('data-line') === nextParentCombatElem.attr('data-line');

    // Check for and resolve triggers
    const nextIsTrigger = (next && next.getTag() === 'trigger');
    if (nextIsTrigger) {
      const triggerName = next.elem.text().trim().toLowerCase();
      if (triggerName.startsWith('goto') && nextIsInSameCombat) {
        // If we jump to somewhere in the same combat,
        // it's handled like a normal combat RP choice change (below).
      } else if (next.isEnd()) {
        // Treat quest end as normal
        dispatch(endQuest({}));
        return remoteArgs;
      } else {
        // If the trigger exits via the win/lose handlers, go to the appropriate
        // combat end card
        const parentCondition = nextNode.elem.parent().attr('on');
        if (parentCondition === 'win' || parentCondition === 'lose') {
          dispatch(handleCombatEnd({
            maxTier: a.maxTier,
            node: new ParserNode(parentCombatElem, a.node.ctx),
            seed: a.seed,
            settings: a.settings,
            victory: (parentCondition === 'win'),
          }));
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
