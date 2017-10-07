import Redux from 'redux'
import {
  QuestNodeAction,
  ViewQuestAction
} from './ActionTypes'
import {SettingsType} from '../reducers/StateTypes'
import {toCard} from './Card'
import {QuestDetails} from '../reducers/QuestTypes'
import {initCardTemplate, ParserNode} from '../cardtemplates/Template'
import {TemplateContext} from '../cardtemplates/TemplateTypes'

export function initQuest(details: QuestDetails, questNode: Cheerio, ctx: TemplateContext): QuestNodeAction {
  const firstNode = questNode.children().eq(0);
  const node = new ParserNode(firstNode, ctx);
  return {type: 'QUEST_NODE', node, details};
}

export function choice(settings: SettingsType, node: ParserNode, index: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(loadNode(settings, node.handleAction(index)));
  }
}

export function event(node: ParserNode, evt: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(loadNode(null, node.handleAction(evt)));
  }
}

// used externally by the quest creator, but not by other external App code
export function loadNode(settings: SettingsType, node: ParserNode) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const tag = node.getTag();
    if (tag === 'trigger') {
      const triggerName = node.elem.text().trim();
      if (triggerName === 'end') {
        dispatch(toCard({name: 'QUEST_END'}));
      } else {
        throw new Error('invalid trigger ' + triggerName);
      }
    } else {
      dispatch(initCardTemplate(node, settings));
    }
  }
}
