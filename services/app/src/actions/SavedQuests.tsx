import * as Redux from 'redux';
import {Quest} from 'shared/schema/Quests';
import {getEnemiesAndTier} from '../components/views/quest/cardtemplates/combat/Actions';
import {getNextMidCombatNode} from '../components/views/quest/cardtemplates/roleplay/Actions';
import {defaultContext} from '../components/views/quest/cardtemplates/Template';
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes';
import {getCheerio} from '../Globals';
import {getStorageJson, setStorageKeyValue} from '../LocalStorage';
import {logEvent} from '../Logging';
import {SavedQuestMeta} from '../reducers/StateTypes';
import {QuestNodeAction, SavedQuestDeletedAction, SavedQuestListAction, SavedQuestStoredAction} from './ActionTypes';
import {initQuest} from './Quest';
import {openSnackbar} from './Snackbar';
import {fetchLocal} from './Web';

const cheerio = require('cheerio') as CheerioAPI;

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

export function saveQuestForOffline(details: Quest) {
  return (dispatch: Redux.Dispatch<any>): any => {
    return fetchLocal(details.publishedurl).then((result: string) => {
      const elem = cheerio.load(result)('quest');
      const node = initQuest(details, elem, defaultContext()).node;
      dispatch(storeSavedQuest(node, details, Date.now()));
      return dispatch(openSnackbar('Saved for offline play.'));
    })
    .catch((e: Error) => {
      return dispatch(openSnackbar(Error('Network error: Please check your connection.')));
    });
  };
}

export function storeSavedQuest(node: ParserNode, details: Quest, ts: number): SavedQuestStoredAction {
  logEvent('save', 'quest_save', { ...details, action: details.title, label: details.id });
  // Update the listing
  const savedQuests = getSavedQuestMeta();

  const pathLen = node.ctx.path.length;
  savedQuests.push({ts, details, pathLen});
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

function recreateNodeThroughCombat(node: ParserNode, i: number, path: string|number[]): {nextNode: ParserNode|null, i: number} {
  // Set round count
  // TODO: Make this more corect
  const {enemies, tier} = getEnemiesAndTier(node);
  node.ctx.templates.combat = {
    custom: false,
    enemies,
    numAliveAdventurers: 0,
    roundCount: 0,
    tier,
    decisionPhase: 'PREPARE_DECISION',
    surgePeriod: 4,
    decisionPeriod: 4,
    damageMultiplier: 1,
    maxRoundDamage: 4,
  };
  node = node.clone();

  for (; i < path.length; i++) {
    const action = path[i];
    if (typeof(action) === 'string' && action.startsWith('|')) {
      (node.ctx.templates.combat as any).roundCount = parseInt(action.substr(1), 10);
      node = node.clone(); // Clone re-calculates visibility of inner nodes.
    } else {
      if (typeof action !== 'number') {
        console.warn('Unused action ' + action + ' in combat');
        continue;
      }
      const {nextNode, state} = getNextMidCombatNode(node, action);
      switch (state) {
        case 'ENDCOMBAT':
        case 'VICTORY':
        case 'DEFEAT':
          return {nextNode, i};
        case 'END':
          return {nextNode: null, i};
        case 'ENDROUND':
        default: // we're still in combat
          node = nextNode;
          break;
      }
    }
  }
  return {nextNode: node, i};
}

function recreateNodeFromPath(details: Quest, xml: string, path: string|number[]): ParserNode {
  let node = initQuest(details, getCheerio().load(xml)('quest'), defaultContext()).node;
  console.log('Recreating node from path');
  console.log(`Path is ${path}`);
  for (let i = 0; i < path.length; i++) {
    const action = path[i];
    // TODO: Also save random seed with path in context
    console.log(`Node ${node.getTag()} action ${action}`);
    let next: ParserNode|null;
    if (node.getTag() === 'combat') {
      // Try going all the way through combat. If we stop somewhere in
      // the middle, return the entry node.
      const result = recreateNodeThroughCombat(node, i, path);
      if (!result.nextNode) {
        return node;
      } else {
        next = result.nextNode;
      }
      i = result.i;
    } else {
      next = node.handleAction(action);
    }
    console.log(`Yields node ${next && next.getTag()}`);
    if (!next) {
      throw new Error('Failed to load quest.');
    }
    node = next;
  }
  return node;
}

export function loadSavedQuest(id: string, ts: number): QuestNodeAction {
  const savedQuests = getSavedQuestMeta();
  let details: Quest|null = null;
  for (const savedQuest of savedQuests) {
    if (savedQuest.details.id === id && savedQuest.ts === ts) {
      details = savedQuest.details;
      break;
    }
  }

  if (details === null) {
    throw new Error('Could not load quest details.');
  }

  logEvent('save', 'quest_save_load', { ...details, action: details.title, label: details.id });
  const data: SavedQuest = getStorageJson(savedQuestKey(id, ts), {}) as any;
  if (!data.xml || !data.path) {
    throw new Error('Could not load quest.');
  }
  const node = recreateNodeFromPath(details, data.xml, data.path);
  return {type: 'QUEST_NODE', node, details};
}
