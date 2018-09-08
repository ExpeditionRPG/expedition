import Redux from 'redux';
import {Quest} from 'shared/schema/Quests';
import {initCardTemplate} from '../components/views/quest/cardtemplates/Template';
import {ParserNode, TemplateContext} from '../components/views/quest/cardtemplates/TemplateTypes';
import {AppStateWithHistory} from '../reducers/StateTypes';
import {
  PreviewQuestAction,
  QuestDetailsAction,
  QuestExitAction,
  QuestNodeAction,
  remoteify,
} from './ActionTypes';
import {toCard} from './Card';
import {logQuestPlay} from './Web';

export function initQuestNode(questNode: Cheerio, ctx: TemplateContext): ParserNode {
  const firstNode = questNode.children().eq(0);
  return new ParserNode(firstNode, ctx);
}

export function initQuest(details: Quest, questNode: Cheerio, ctx: TemplateContext): QuestNodeAction {
  return {
    type: 'QUEST_NODE',
    node: initQuestNode(questNode, ctx),
    details
  };
}

export const exitQuest = remoteify(function exitQuest(): QuestExitAction {
  return {type: 'QUEST_EXIT'};
});

interface EndQuestArgs {}
export const endQuest = remoteify(function endQuest(a: EndQuestArgs, dispatch: Redux.Dispatch<any>) {
  dispatch(toCard({name: 'QUEST_END'}));
  dispatch(logQuestPlay({phase: 'end'}));
});

interface ChoiceArgs {
  node?: ParserNode;
  index: number;
}
export const choice = remoteify(function choice(a: ChoiceArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): ChoiceArgs {
  if (!a.node) {
    a.node = getState().quest.node;
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
}
export const event = remoteify(function event(a: EventArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): EventArgs {
  if (!a.node) {
    a.node = getState().quest.node;
  }
  const nextNode = a.node.handleAction(a.evt);
  if (!nextNode) {
    let tag: string = 'unknown';
    let compKey: string = 'unknown';
    let visibleKeys: string = 'unknown';
    try {
      tag = a.node && a.node.getTag() || 'null';
      compKey = a.node && a.node.getComparisonKey();
      visibleKeys = JSON.stringify((a.node && a.node.getVisibleKeys()) || '');
    } catch (e) {
      throw new Error('Failed to get debug info: ' + e.toString());
    }
    throw new Error('Could not get next node for event "' + a.evt + '" - current node tag "' + tag + '" visible keys ' + visibleKeys + '" comparison key ' + compKey);
  }
  dispatch(loadNode(nextNode));
  return {evt: a.evt};
});

// Used externally by the quest creator
export function loadNode(node: ParserNode, details?: Quest) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const tag = node.getTag();
    if (tag === 'trigger') {
      const triggerName = node.elem.text().trim();
      if (triggerName === 'end') {
        dispatch(endQuest({}));
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

interface PreviewQuestArgs {
  quest: Quest;
  saveTS?: number;
  lastPlayed?: Date;
}
export const previewQuest = remoteify(function previewQuest(a: PreviewQuestArgs, dispatch: Redux.Dispatch<any>) {
  dispatch({type: 'PUSH_HISTORY'});
  dispatch({type: 'PREVIEW_QUEST', quest: a.quest, savedTS: a.saveTS, lastPlayed: a.lastPlayed} as PreviewQuestAction);
  dispatch(toCard({name: 'QUEST_PREVIEW', noHistory: true}));
  return a;
});
