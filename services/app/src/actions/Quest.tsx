import Redux from 'redux';
import {initCardTemplate} from '../components/views/quest/cardtemplates/Template';
import {ParserNode, TemplateContext} from '../components/views/quest/cardtemplates/TemplateTypes';
import {QuestDetails} from '../reducers/QuestTypes';
import {AppStateWithHistory, SettingsType} from '../reducers/StateTypes';
import {
  QuestDetailsAction,
  QuestExitAction,
  QuestNodeAction,
  remoteify
} from './ActionTypes';
import {toCard} from './Card';

export function initQuest(details: QuestDetails, questNode: Cheerio, ctx: TemplateContext): QuestNodeAction {
  const firstNode = questNode.children().eq(0);
  const node = new ParserNode(firstNode, ctx);
  return {type: 'QUEST_NODE', node, details};
}

export const exitQuest = remoteify(function exitQuest(): QuestExitAction {
  return {type: 'QUEST_EXIT'};
});

interface ChoiceArgs {
  settings?: SettingsType;
  node?: ParserNode;
  index: number;
}
export const choice = remoteify(function choice(a: ChoiceArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): ChoiceArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  const nextNode = a.node.handleAction(a.index);
  if (nextNode === null) {
    throw new Error('Could not find next node');
  }
  dispatch(loadNode(nextNode));
  return {index: a.index};
});

interface EventArgs {
  node?: ParserNode;
  evt: string;
  settings?: SettingsType;
}
export const event = remoteify(function event(a: EventArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): EventArgs {
  if (!a.node) {
    a.node = getState().quest.node;
  }
  const nextNode = a.node.handleAction(a.evt);
  if (!nextNode) {
    throw new Error('Could not get next node for event ' + a.evt);
  }
  dispatch(loadNode(nextNode));
  return {evt: a.evt};
});

// Used externally by the quest creator
export function loadNode(node: ParserNode, details?: QuestDetails) {
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
      if (details) {
        dispatch({type: 'QUEST_DETAILS', details} as QuestDetailsAction);
      }
      dispatch(initCardTemplate(node));
    }
  };
}
