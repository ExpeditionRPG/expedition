import * as Redux from 'redux';
import {fetchLocal} from 'shared/requests';
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
import {initQuestNode} from './Quest';
import {openSnackbar} from './Snackbar';

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
      const node = initQuestNode(elem, defaultContext());
      dispatch(storeSavedQuest(node, details, Date.now()));
      return dispatch(openSnackbar('Saved for offline play.'));
    })
    .catch((e: Error) => {
      return dispatch(openSnackbar(Error('Network error saving quest: Please check your connection'), true));
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
  const seed = node.ctx.seed;

  if (!xml || !path) {
    throw new Error('Could not save quest.');
  }

  setStorageKeyValue(savedQuestKey(details.id, ts), {xml, path, seed} as SavedQuest);
  return {type: 'SAVED_QUEST_STORED', savedQuests};
}

function recreateNodeThroughCombat(node: ParserNode, i: number, path: string|number[]): {nextNode: ParserNode|null, i: number} {
  // We lack some metadata about combat, but we can still parse enemies and tier.
  const {enemies, tier} = getEnemiesAndTier(node);
  node.ctx.templates.combat = {
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
        const handled = node.handleAction(action);
        if (handled === null) {
          console.warn(`Failed to load quest (invalid combat action '${action}' for node ${i} along path '${node.ctx.path}')`);
          return {nextNode: null, i};
        }
        node = handled;
        if (action === 'win' || action === 'lose') {
          break;
        }
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
  if (node.getTag() === 'combat') {
    return {nextNode: null, i};
  }
  return {nextNode: node, i};
}

export function recreateNodeFromPath(xml: string, path: string|number[], seed?: string): {node: ParserNode, complete: boolean} {
  let node = initQuestNode(getCheerio().load(xml)('quest'), defaultContext());
  if (seed) {
    node.ctx.seed = seed;
  } else {
    console.warn('Recreating node without saved seed; RNG failures may cause partial load');
  }

  for (let i = 0; i < path.length; i++) {
    const action = path[i];
    // TODO: Also save random seed with path in context
    let next: ParserNode|null;
    next = node.handleAction(action);
    if (!next) {
      console.warn(`Failed to load quest (action #${i} for node along path '${node.ctx.path}'), returning early`);
      return {node, complete: false};
    }

    // Try going all the way through combat. If we stop somewhere in
    // the middle, return the node leading up to it.
    if (next.getTag() === 'combat') {
      const result = recreateNodeThroughCombat(next, i, path);
      if (!result.nextNode) {
        // We'll count this one as complete (node leading up to a mid-combat save)
        return {node, complete: false};
      } else {
        next = result.nextNode;
      }
      i = result.i;
    }

    node = next;
  }
  return {node, complete: true};
}

export function loadSavedQuest(id: string, ts: number) {
  return (dispatch: Redux.Dispatch<any>) => {
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
      throw new Error('Could not load quest - invalid save data');
    }
    const {node, complete} = recreateNodeFromPath(data.xml, data.path, data.seed);
    if (!complete) {
      dispatch(openSnackbar('Could not load fully - using earlier checkpoint.'));
    }
    dispatch({
      type: 'QUEST_NODE',
      node,
      details,
    } as QuestNodeAction);
  };
}
