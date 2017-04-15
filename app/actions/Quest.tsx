import Redux from 'redux'
import {
  QuestNodeAction,
  ViewQuestAction
} from './ActionTypes'
import {SettingsType, XMLElement} from '../reducers/StateTypes'
import {toCard} from './Card'
import {handleAction} from '../parser/Handlers'
import {QuestDetails, QuestContext} from '../reducers/QuestTypes'
import {ParserNode} from '../parser/Node'
import {initCardTemplate} from '../cardtemplates/Template'

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

  if (tag === 'trigger') {
    let triggerName = node.elem.text().trim();
    if (triggerName === 'end') {
      return dispatch(toCard('QUEST_END'));
    } else {
      throw new Error('invalid trigger ' + triggerName);
    }
  }

  return dispatch(initCardTemplate(node, settings));
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
