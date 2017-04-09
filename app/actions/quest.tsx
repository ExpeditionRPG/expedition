import Redux from 'redux'
import {
  QuestNodeAction,
  ViewQuestAction
} from './ActionTypes'
import {SettingsType, XMLElement} from '../reducers/StateTypes'
import {toCard} from './card'
import {handleAction} from '../parser/Handlers'
import {QuestDetails, QuestContext} from '../reducers/QuestTypes'
import {ParserNode} from '../parser/Node'
import {initCombat} from './cardtemplates/combat'

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
  return {type: 'QUEST_NODE', node: new ParserNode(firstNode, ctx), details};
}

export function choice(settings: SettingsType, node: ParserNode, index: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    loadNode(settings, dispatch, handleAction(node, index));
  }
}

export function loadNode(settings: SettingsType, dispatch: Redux.Dispatch<any>, node: ParserNode) {
  var tag = node.getTag();
  switch (tag) {
    case 'trigger':
      let triggerName = node.elem.text().trim();
      if (triggerName === 'end') {
        dispatch(toCard('QUEST_END'));
        return;
      } else {
        throw new Error('invalid trigger ' + triggerName);
      }
    case 'roleplay':
      // Every choice has an effect.
      dispatch(toCard('QUEST_CARD', null));

      // We set the quest state *after* the toCard() dispatch to prevent
      // the history from grabbing the quest state before navigating.
      // This bug manifests as toPrevious() sliding back to the same card
      // content.
      dispatch({type: 'QUEST_NODE', node} as QuestNodeAction);
      break;
    case 'combat':
      dispatch(initCombat(node, settings));
      break;
    default:
      throw new Error('Unsupported node type ' + tag);
  }
}

export function event(node: ParserNode, evt: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    var nextNode = handleAction(node, evt);
    loadNode(null, dispatch, nextNode);
  }
}

// TODO: This should probably go in a "search" actions file.
export function viewQuest(quest: QuestDetails): ViewQuestAction {
  return {type: 'VIEW_QUEST', quest};
}
