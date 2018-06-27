import Redux from 'redux'
import {SetDirtyAction, SetDirtyTimeoutAction, SetLineAction, SetWordCountAction} from './ActionTypes'
import {PanelType, PlaytestSettings, QuestType} from '../reducers/StateTypes'
import {store} from '../Store'
import {saveQuest} from './Quest'
import {renderXML} from 'shared/render/QDLParser'
import {loadNode} from 'app/actions/Quest'
import {changeSettings} from 'app/actions/Settings'
import {defaultContext} from 'app/components/views/quest/cardtemplates/Template'
import {TemplateContext, ParserNode} from 'app/components/views/quest/cardtemplates/TemplateTypes'
import {pushError} from './Dialogs'

declare var window: any;

export function setDirty(isDirty: boolean): SetDirtyAction {
  return {type: 'SET_DIRTY', isDirty};
}

export function setDirtyTimeout(timer: any): SetDirtyTimeoutAction {
  return {type: 'SET_DIRTY_TIMEOUT', timer};
}

export function setLine(line: number): SetLineAction {
  return {type: 'SET_LINE', line};
}

export function setOpInit(mathjs: string) {
  return {type: 'SET_OP_INIT', mathjs};
}

export function setWordCount(count: number): SetWordCountAction {
  return {type: 'SET_WORD_COUNT', count};
}

export function panelToggle(panel: PanelType) {
  return {type: 'PANEL_TOGGLE', panel};
}

export function lineNumbersToggle() {
  return {type: 'LINE_NUMBERS_TOGGLE'};
}

export function updateDirtyState(): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const editor = store.getState();
    if (!editor.dirty) {
      dispatch(setDirty(true));
    }

    if (editor.dirtyTimeout) {
      clearTimeout(editor.dirtyTimeout);
    }

    const timer = setTimeout(function() {
      const state = store.getState();
      // Check if a future state update overrode this timer.
      if (state.editor.dirtyTimeout !== timer) {
        return;
      }
      // Check the store directly to see if we're still in a dirty state.
      // The user could have saved manually before the timeout has elapsed.
      if (state.editor.dirty) {
        dispatch(saveQuest(state.quest));
      }
      dispatch(setDirtyTimeout(null));
    }, 2000);
    dispatch(setDirtyTimeout(timer));
  }
}

export function getPlayNode(node: Cheerio): Cheerio|null {
  let tag = node.get(0).tagName;
  if (tag === 'quest') {
    node = node.children().first();
    tag = node.get(0).tagName;
  }
  if (tag !== 'roleplay' && tag !== 'combat') {
    return null;
  }
  return node;
}


export function startPlaytestWorker(oldWorker: Worker|null, elem: Cheerio, settings: PlaytestSettings) {
  return (dispatch: Redux.Dispatch<any>): any => {
    if (oldWorker) {
      oldWorker.terminate();
    }

    if (!window.Worker) {
      console.log('Web worker not available, skipping playtest.');
      return;
    }

    const worker = new Worker('playtest.js');
    worker.onerror = (ev: ErrorEvent) => {
      dispatch({type: 'PLAYTEST_ERROR', msg: ev.error});
      worker.terminate();
    };
    worker.onmessage = (e: MessageEvent) => {
      if (e.data.status === 'COMPLETE') {
        dispatch({type: 'PLAYTEST_COMPLETE'});
      } else {
        dispatch({type: 'PLAYTEST_MESSAGE', msgs: e.data});
      }
    };
    worker.postMessage({type: 'RUN', xml: elem.toString(), settings});
    dispatch({type: 'PLAYTEST_INIT', worker});
  }
}

export function renderAndPlay(quest: QuestType, qdl: string, line: number, oldWorker: Worker|null, ctx: TemplateContext = defaultContext()) {
  return (dispatch: Redux.Dispatch<any>): any => {
    // Do rendering after timeout to stay outside the event handler.
    setTimeout(() => {
      const xmlResult = renderXML(qdl);
      dispatch({type: 'QUEST_RENDER', qdl: xmlResult, msgs: xmlResult.getFinalizedLogs()});

      const questNode: Cheerio = xmlResult.getResult();
      const playNode = getPlayNode(xmlResult.getResultAt(line));
      if (!playNode) {
        const err = new Error('Invalid cursor position; to play from the cursor, cursor must be on a roleplaying or combat card.');
        err.name = 'RenderError';
        return dispatch(pushError(err))
      }

      const newNode = new ParserNode(playNode, ctx);
      dispatch({type: 'REBOOT_APP'});
      // TODO: Make these settings configurable - https://github.com/ExpeditionRPG/expedition-quest-creator/issues/261
      dispatch(changeSettings({
        audioEnabled: false,
        autoRoll: false,
        contentSets: {
          horror: quest.expansionhorror,
        },
        difficulty: 'NORMAL',
        fontSize: 'SMALL',
        multitouch: false,
        numPlayers: quest.minplayers,
        showHelp: false,
        simulator: true,
        timerSeconds: 10,
        vibration: false,
      }));
      // Unfortunately can't just expand quest b/c it includes stuff beyond what app expects
      // Fortunately we really only /need/ to send things that affect display of quest (such as theme)
      dispatch(loadNode(newNode, {
        id: quest.id || '',
        title: quest.title || '',
        summary: quest.summary || '',
        author: quest.author || '',
        publishedurl: '',
        minplayers: quest.minplayers || 1,
        maxplayers: quest.maxplayers || 6,
        theme: quest.theme || 'base',
      }));
      // Results will be shown and added to annotations as they arise.
      dispatch(startPlaytestWorker(oldWorker, questNode, {
        expansionhorror: Boolean(quest.expansionhorror),
      }));
    });
  };
}
