import Redux from 'redux'
import {
  QuestNodeAction,
  ViewQuestAction
} from './ActionTypes'
import {SettingsType} from '../reducers/StateTypes'
import {toCard} from './Card'
import {handleAction} from '../parser/Handlers'
import {QuestDetails, QuestContext} from '../reducers/QuestTypes'
import {ParserNode} from '../parser/Node'
import {initCardTemplate} from '../cardtemplates/Template'

export function initQuest(details: QuestDetails, questNode: Cheerio, ctx: QuestContext): QuestNodeAction {
  const firstNode = questNode.children().eq(0);
  return {type: 'QUEST_NODE', node: new ParserNode(firstNode, ctx), details};
}

export function choice(settings: SettingsType, node: ParserNode, index: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(loadNode(settings, handleAction(node, index)));
  }
}

export function event(node: ParserNode, evt: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(loadNode(null, handleAction(node, evt)));
  }
}

// TODO: This should probably go in a "search" actions file.
export function viewQuest(quest: QuestDetails): ViewQuestAction {
  return {type: 'VIEW_QUEST', quest};
}

function loadNode(settings: SettingsType, node: ParserNode) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const tag = node.getTag();
    if (tag === 'trigger') {
      const triggerName = node.elem.text().trim();
      if (triggerName === 'end') {
        dispatch(toCard('QUEST_END'));
      } else {
        throw new Error('invalid trigger ' + triggerName);
      }
    } else {
      dispatch(initCardTemplate(node, settings));
    }
  }
}
