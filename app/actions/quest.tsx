import {
  NEW_QUEST, LOAD_QUEST, SAVE_QUEST, DELETE_QUEST, PUBLISH_QUEST, DOWNLOAD_QUEST,
  RequestQuestLoadAction, ReceiveQuestLoadAction,
  RequestQuestSaveAction, ReceiveQuestSaveAction,
  RequestQuestDeleteAction, ReceiveQuestDeleteAction,
  RequestQuestPublishAction, ReceiveQuestPublishAction,
} from './ActionTypes'
import {CodeViewType, QuestType} from '../reducers/StateTypes'

import {setDialog} from './dialog'
import {pushError, pushHTTPError} from '../error'
import {getBuffer} from '../buffer'

var toXML: any = (require('../../translation/to_xml') as any).default

function receiveQuestLoad(quest: QuestType ): ReceiveQuestLoadAction {
  return {type: 'RECEIVE_QUEST_LOAD', quest};
}

function loadQuest(dispatch: Redux.Dispatch<any>, id: string): JQueryPromise<any> {
  // We only load quests when the drawer is open.
  dispatch({type: 'REQUEST_QUEST_LOAD', id});
  return $.get("/quest/"+id, function(raw_result: string) {
    var result = JSON.parse(raw_result);
    $.get(result.url, function(data: string) {
      console.log(data);
      let quest: QuestType = {
        id: result.id,
        meta: result.meta,
        url: result.url,
        modified: parseInt(result.modified),
        xml: data
      };
      dispatch(receiveQuestLoad(quest));
    }).fail(pushHTTPError);
  }).fail(pushHTTPError);
}

export function saveQuest(dispatch: Redux.Dispatch<any>, id: string, view: CodeViewType, cb: ((id:string)=>void)): JQueryPromise<any> {
  // Pull from the text buffer for maximum freshness.
  var data = getBuffer();
  if (view === 'MARKDOWN') {
    var err: Error;
    try {
      data = toXML(data, false);
    } catch (e) {
      pushError(e);
      dispatch(setDialog('ERROR', true));
      return;
    }
  }

  dispatch({type: 'REQUEST_QUEST_SAVE', id} as RequestQuestSaveAction);
  return $.post("/quest/" + id, data, function(result_quest_id: string) {
    dispatch({type: 'RECEIVE_QUEST_SAVE', id: result_quest_id} as ReceiveQuestSaveAction);
    if (cb) {
      cb(result_quest_id);
    }
  }).fail(pushHTTPError);
}

function deleteQuest(dispatch: Redux.Dispatch<any>, id: string): JQueryPromise<any> {
  dispatch({type: 'REQUEST_QUEST_DELETE', id} as RequestQuestDeleteAction);
  console.log(pushHTTPError);
  return $.post("/delete/" + id).done(function(result) {
    dispatch({type: 'RECEIVE_QUEST_DELETE', id, result} as ReceiveQuestDeleteAction);
  }).fail(function(err) {pushHTTPError(err)});
}

function publishQuest(dispatch: Redux.Dispatch<any>, id: string): JQueryPromise<any> {
  dispatch({type: 'REQUEST_QUEST_PUBLISH', id} as RequestQuestPublishAction);
  return $.post("/published/" + id + "/true", function(short_url) {
    dispatch({type: 'RECEIVE_QUEST_PUBLISH', id, short_url} as ReceiveQuestPublishAction);
  }).fail(pushHTTPError);
}

function downloadQuest(dispatch: Redux.Dispatch<any>, url: string): void {
  if (!url) {
    pushError(new Error("No quest data available to download. Please save your quest first."));
  } else {
    window.open(url, '_blank');
  }
}

export function questAction(action: string, force: boolean, dirty: boolean, view: CodeViewType, quest: QuestType): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    // Show confirmation dialogs for certain actions if
    // we have a dirty editor.
    if (dirty && !force) {
      switch(action) {
        case NEW_QUEST:
          return dispatch(setDialog('CONFIRM_NEW_QUEST', true));
        case LOAD_QUEST:
          return dispatch(setDialog('CONFIRM_LOAD_QUEST', true));
        default:
          break;
      }
    }

    // Some quest actions (e.g. LOAD_QUEST) require HTTP requests
    // to recieve data. Intercept those here.
    switch(action) {
      case LOAD_QUEST:
        return loadQuest(dispatch, quest.id);
      case SAVE_QUEST:
        return saveQuest(dispatch, quest.id, view, ()=>{});
      case DELETE_QUEST:
        return deleteQuest(dispatch, quest.id);
      case PUBLISH_QUEST:
        return publishQuest(dispatch, quest.id);
      case DOWNLOAD_QUEST:
        return downloadQuest(dispatch, quest.url);
      default:
        break;
    }

    return dispatch({type: action});
  }
}