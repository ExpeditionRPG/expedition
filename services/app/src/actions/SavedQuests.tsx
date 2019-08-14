import * as Redux from 'redux';
import {fetchLocal} from 'shared/requests';
import {Quest} from 'shared/schema/Quests';
import {getEnemiesAndTier} from '../components/views/quest/cardtemplates/combat/Actions';
import {getNextMidCombatNode} from '../components/views/quest/cardtemplates/roleplay/Actions';
import {defaultContext, populateScope} from '../components/views/quest/cardtemplates/Template';
import {ParserNode, TemplateContext} from '../components/views/quest/cardtemplates/TemplateTypes';
import {getCheerio} from '../Globals';
import {checkStorageFreeBytes, getStorageJson, setStorageKeyValue} from '../LocalStorage';
import {logEvent} from '../Logging';
import {SavedQuestMeta} from '../reducers/StateTypes';
import {QuestNodeAction, SavedQuestDeletedAction, SavedQuestListAction, StorageFreeAction} from './ActionTypes';
import {initQuestNode} from './Quest';
import {openSnackbar} from './Snackbar';

const cheerio = require('cheerio') as CheerioAPI;

declare interface SavedQuest {
  xml: string;
  path: number[];
  seed: string;
  // We additionally include context and line information - try to load from this first,
  // otherwise use the path to recreate the node from the beginning.
  ctx: TemplateContext;
  line: number;
}

export const SAVED_QUESTS_KEY = 'SAVED_QUESTS';

function getSavedQuestMeta(): SavedQuestMeta[] {
  const savedQuests = getStorageJson(SAVED_QUESTS_KEY, []) as any;

  // For each quest, also lookup its estimated size
  for (const q of savedQuests) {
    q.savedBytes = getSavedQuestApproxBytes(q.details.id || '', q.ts || 0);
  }

  return savedQuests;
}

export function savedQuestKey(id: string, ts: number) {
  return SAVED_QUESTS_KEY + '-' + id + '-' + ts.toString();
}

export function getSavedQuestApproxBytes(id: string, ts: number): number|undefined {
  const data: SavedQuest = getStorageJson(savedQuestKey(id, ts), {}) as any;
  if (!data) {
    return undefined;
  }
  return (data.xml || '').length + (data.path || []).length;
}

export function listSavedQuests(): SavedQuestListAction {
  const savedQuests = getSavedQuestMeta();
  return {type: 'SAVED_QUEST_LIST', savedQuests};
}

export function deleteSavedQuest(id: string, ts: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    // Update the listing
    const savedQuests = getSavedQuestMeta();
    for (let i = 0; i < savedQuests.length; i++) {
      if (savedQuests[i].details.id === id && savedQuests[i].ts === ts) {
        savedQuests.splice(i, 1);
        setStorageKeyValue(SAVED_QUESTS_KEY, savedQuests);
        setStorageKeyValue(savedQuestKey(id, ts), '');
        dispatch(updateStorageFreeBytes());
        return dispatch({type: 'SAVED_QUEST_DELETED', savedQuests} as SavedQuestDeletedAction);
      }
    }
    throw new Error('No such quest with ID ' + id + ', timestamp ' + ts.toString() + '.');
  };
}

export function saveQuestForOffline(details: Quest) {
  return (dispatch: Redux.Dispatch<any>): any => {
    return fetchLocal(details.publishedurl)
    .catch((e: Error) => {
      return dispatch(openSnackbar(Error('Network error saving quest: Please check your connection'), true));
    })
    .then((result: string) => {
      const elem = cheerio.load(result)('quest');
      const node = initQuestNode(elem, defaultContext());
      return dispatch(storeSavedQuest(node, details, Date.now()))
        .then(() => {
          return dispatch(openSnackbar('Saved for offline play.'));
        });
    })
    .catch((e: Error) => {
      if (e.toString().indexOf('exceeded the quota')) {
        // Out-of-space errors are not considered errors (they should not be reportable)
        return dispatch(openSnackbar('Couldn\'t save; out of storage space.', true));
      }
      return dispatch(openSnackbar(Error('Error saving quest: ' + e), true));
    });
  };
}

export function storeSavedQuest(node: ParserNode, details: Quest, ts: number, set= setStorageKeyValue) {
  return (dispatch: Redux.Dispatch<any>): any => {
    logEvent('save', 'quest_save', { ...details, action: details.title, label: details.id });

    // Save the quest state
    const xml = node.getRootElem() + '';
    const path = node.ctx.path;
    const seed = node.ctx.seed;
    const line = parseInt(node.elem.attr('data-line'), 10);

    if (!xml || !path) {
      return Promise.reject(new Error('Could not save quest.'));
    }

    try {
      set(savedQuestKey(details.id, ts), {xml, path, seed, line, ctx: node.ctx} as SavedQuest);
    } catch (e) {
      return Promise.reject(e);
    }

    // Update the listing
    const savedQuests = getSavedQuestMeta();
    const pathLen = node.ctx.path.length;
    const savedBytes = getSavedQuestApproxBytes(details.id || '', ts || 0);
    const newSavedQuests = [...savedQuests, {ts, details, pathLen, savedBytes}];
    try {
      set(SAVED_QUESTS_KEY, newSavedQuests);
    } catch (e) {
      // If we fail to save the index (e.g. due to not enough space), we
      // must clean up the saved quest data
      set(savedQuestKey(details.id, ts), null);
      return Promise.reject(e);
    }

    dispatch(updateStorageFreeBytes());
    return Promise.resolve(dispatch({type: 'SAVED_QUEST_STORED', savedQuests: newSavedQuests}));
  };
}

export function updateStorageFreeBytes(): StorageFreeAction {
  return {type: 'STORAGE_FREE', freeBytes: checkStorageFreeBytes()};
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
    seed: '',
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

export function recreateNodeFromContext(xml: string, line: number, ctx: TemplateContext, regenScope= populateScope): ParserNode {
  const elem = cheerio.load(xml)(`[data-line=${line}]`);
  if (!elem) {
    throw new Error(`Could not load line ${line} from XML`);
  }

  // Functions do not get serialized; we must recreate them and then bind them to the context.
  ctx.scope._ = regenScope();
  for (const k of Object.keys(ctx.scope._)) {
    ctx.scope._[k] = (ctx.scope._[k] as any).bind(ctx);
  }
  return new ParserNode(elem, ctx, undefined, ctx.seed);
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

    let node: ParserNode|null = null;
    if (data.ctx && data.xml && data.line !== undefined) {
      console.log('Attempting to recreate from ctx');
      try {
        const node = recreateNodeFromContext(data.xml, data.line, data.ctx);
        console.log('Recreated scope:', node.ctx.scope);
      } catch (e) {
        console.warn(e);
        node = null;
      }
    }

    if (node === null) {
      console.log('Attempting legacy load');
      if (!data.xml || !data.path) {
        throw new Error('Could not load quest - invalid save data');
      }
      const {node, complete} = recreateNodeFromPath(data.xml, data.path, data.seed);
      if (!complete) {
        dispatch(openSnackbar('Could not load fully - using earlier checkpoint.'));
      }
    }

    dispatch({type: 'PUSH_HISTORY'});
    dispatch({
      type: 'QUEST_NODE',
      node,
      details,
    } as QuestNodeAction);

    // TODO(scott): Upstream this render choice logic to its own function,
    // reuse it in roleplay/Actions.tsx and combat/Actions.tsx
    const tagName = node.elem.get(0).tagName;
    if (tagName === 'roleplay') {
      if (findCombatParent(node.elem) !== null) {
        // Mid-combat roleplay
        dispatch(toCard({name: 'QUEST_CARD', phase: 'MID_COMBAT_ROLEPLAY', overrideDebounce: true, noHistory: true}));
      } else {
        // Regular roleplay
        dispatch(toCard({name: 'QUEST_CARD', noHistory: true}));
      }
    } else if (tagName === 'combat') {
      dispatch(toCard({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', noHistory: true}));
      dispatch(audioSet({intensity: calculateAudioIntensity(tierSum, tierSum, 0, 0)}));
    } else {
      dispatch(openSnackbar(`Failed to load quest (tag ${tagName})`));
    }
  };
}
