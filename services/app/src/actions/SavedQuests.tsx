import {defaultContext} from '../components/views/quest/cardtemplates/Template';
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes';
import {getCheerio} from '../Globals';
import {getStorageJson, setStorageKeyValue} from '../LocalStorage';
import {logEvent} from '../Logging';
import {QuestDetails} from '../reducers/QuestTypes';
import {SavedQuestMeta} from '../reducers/StateTypes';
import {QuestNodeAction, SavedQuestDeletedAction, SavedQuestListAction, SavedQuestSelectedAction, SavedQuestStoredAction} from './ActionTypes';
import {initQuest} from './Quest';

declare interface SavedQuest {xml: string; path: number[]; }

export const SAVED_QUESTS_KEY = 'SAVED_QUESTS';

function getSavedQuestMeta(): SavedQuestMeta[] {
  return getStorageJson(SAVED_QUESTS_KEY, []) as any;
}

export function savedQuestKey(id: string, ts: number) {
  return SAVED_QUESTS_KEY + '-' + id + '-' + ts.toString();
}

export function listSavedQuests(): SavedQuestListAction {
  const savedQuests = getSavedQuestMeta();
  return {type: 'SAVED_QUEST_LIST', savedQuests};
}

export function selectSavedQuest(selected: SavedQuestMeta): SavedQuestSelectedAction {
  return {type: 'SAVED_QUEST_SELECTED', selected};
}

export function deleteSavedQuest(id: string, ts: number) {
  // Update the listing
  const savedQuests = getSavedQuestMeta();
  for (let i = 0; i < savedQuests.length; i++) {
    if (savedQuests[i].details.id === id && savedQuests[i].ts === ts) {
      savedQuests.splice(i, 1);
      setStorageKeyValue(SAVED_QUESTS_KEY, savedQuests);
      setStorageKeyValue(savedQuestKey(id, ts), '');
      return {type: 'SAVED_QUEST_DELETED', savedQuests} as SavedQuestDeletedAction;
    }
  }
  throw new Error('No such quest with ID ' + id + ', timestamp ' + ts.toString() + '.');
}

export function storeSavedQuest(node: ParserNode, details: QuestDetails, ts: number): SavedQuestStoredAction {
  logEvent('quest_save', { ...details, action: details.title, label: details.id });
  // Update the listing
  const savedQuests = getSavedQuestMeta();
  savedQuests.push({ts, details});
  setStorageKeyValue(SAVED_QUESTS_KEY, savedQuests);

  // Save the quest state
  const xml = node.getRootElem() + '';
  const path = node.ctx.path;

  if (!xml || !path) {
    throw new Error('Could not save quest.');
  }

  setStorageKeyValue(savedQuestKey(details.id, ts), {xml, path} as SavedQuest);
  return {type: 'SAVED_QUEST_STORED', savedQuests};
}

function recreateNodeFromPath(details: QuestDetails, xml: string, path: string|number[]): ParserNode {
  let node = initQuest(details, getCheerio().load(xml)('quest'), defaultContext()).node;
  for (const action of path) {
    // TODO: Also save random seed with path in context
    const next = node.getNext(action);
    if (!next) {
      throw new Error('Failed to load quest.');
    }
    node = next;
  }
  return node;
}

export function loadSavedQuest(id: string, ts: number): QuestNodeAction {
  const savedQuests = getSavedQuestMeta();
  let details: QuestDetails|null = null;
  for (let i = 0; i < savedQuests.length; i++) {
    if (savedQuests[i].details.id === id && savedQuests[i].ts === ts) {
      details = savedQuests[i].details;
      break;
    }
  }

  if (details === null) {
    throw new Error('Could not load quest details.');
  }

  logEvent('quest_save_load', { ...details, action: details.title, label: details.id });
  const data: SavedQuest = getStorageJson(savedQuestKey(id, ts), {}) as any;
  if (!data.xml || !data.path) {
    throw new Error('Could not load quest.');
  }
  const node = recreateNodeFromPath(details, data.xml, data.path);
  return {type: 'QUEST_NODE', node, details};
}
