import Redux from 'redux'
import {SetDirtyAction, SetDirtyTimeoutAction, SetLineAction} from './ActionTypes'
import {PanelType} from '../reducers/StateTypes'
import {store} from '../store'
import {saveQuest} from './quest'
import {renderXML} from '../parsing/QDLParser'
import {playtestXMLResult} from '../parsing/crawler/PlaytestCrawler'

import {QuestContext} from 'expedition-app/app/reducers/QuestTypes'
import {initQuest, loadNode} from 'expedition-app/app/actions/Quest'
import {ParserNode} from 'expedition-app/app/parser/Node'

export function setDirty(is_dirty: boolean): SetDirtyAction {
  return {type: 'SET_DIRTY', is_dirty};
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

export function panelToggle(panel: PanelType) {
  return {type: 'PANEL_TOGGLE', panel};
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

export function getPlayNode(node: Cheerio): Cheerio {
  let tag = node.get(0).tagName;
  if (tag === 'quest') {
    node = node.children().first();
    tag = node.get(0).tagName;
  }
  if (tag !== 'roleplay' && tag !== 'combat') {
    alert('Invalid cursor position; to play from the cursor, cursor must be on a roleplaying or combat card.');
    return null;
  }
  return node;
}

export function renderAndPlay(qdl: string, line: number, ctx: QuestContext) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const renderResult = renderXML(qdl);
    const questNode = renderResult.getResult();
    const newNode = new ParserNode(getPlayNode(renderResult.getResultAt(line)), ctx);
    dispatch({type: 'REBOOT_APP'});
    dispatch(initQuest('0', questNode, ctx));
    // TODO: Make these settings configurable - https://github.com/ExpeditionRPG/expedition-quest-creator/issues/261
    loadNode({autoRoll: false, numPlayers: 1, difficulty: 'NORMAL', showHelp: false, multitouch: false, vibration: false}, dispatch, newNode);
    dispatch({type: 'QUEST_PLAYTEST', msgs: playtestXMLResult(questNode)});
  };
}
