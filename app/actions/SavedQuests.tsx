import {SavedQuestListAction, SavedQuestDeletedAction, SavedQuestStoredAction, SavedQuestSelectedAction, QuestNodeAction} from './ActionTypes'
import {SavedQuestMeta} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {logEvent} from '../Main'
import {getStorageJson, setStorageKeyValue, getCheerio} from '../Globals'
import {SAVED_QUESTS_KEY} from '../Constants'
import {initQuest} from './Quest'
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes'
import {defaultContext} from '../components/views/quest/cardtemplates/Template'

declare type SavedQuest = {xml: string, path: number[]};

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
