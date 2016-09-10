import {
  NEW_QUEST, LOAD_QUEST, SAVE_QUEST, DELETE_QUEST, PUBLISH_QUEST, DOWNLOAD_QUEST,
  REQUEST_QUEST_LOAD, RECEIVE_QUEST_LOAD,
  REQUEST_QUEST_SAVE, RECEIVE_QUEST_SAVE,
  REQUEST_QUEST_DELETE, RECEIVE_QUEST_DELETE,
  REQUEST_QUEST_PUBLISH, RECEIVE_QUEST_PUBLISH,
  CodeViewType
} from './ActionTypes'

import {setDialog} from './dialog'
import {pushError, pushHTTPError} from '../error'
import {getBuffer} from '../buffer'

/// <reference path="../../translation/to_xml.d.ts" />
import {toXML} from 'to_xml'

function receiveQuestData(result: {id:string, url:string, modified:string}, xml: string): any {
  return {
    type: RECEIVE_QUEST_LOAD,
    id: result.id,
    url: result.url,
    last_save: result.modified,
    xml: xml
  };
}

function loadQuest(dispatch: Redux.Dispatch<any>, id: string): any {
  // We only load quests when the drawer is open.
  dispatch({type: REQUEST_QUEST_LOAD, id});
  return $.get("/quest/"+id, function(raw_result) {
    var result = JSON.parse(raw_result);
    $.get(result.url, function(xml) {
      dispatch(receiveQuestData(result, xml));
    }).fail(pushHTTPError);
  }).fail(pushHTTPError);
}

function saveQuest(dispatch: Redux.Dispatch<any>, id: string, view: CodeViewType, cb: any): any {
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

  dispatch({type: REQUEST_QUEST_SAVE, id});
  return $.post("/quest/" + id, data, function(result_quest_id: string) {
    dispatch({type: RECEIVE_QUEST_SAVE, id: result_quest_id});
    if (cb) {
      cb(result_quest_id);
    }
  }).fail(pushHTTPError);
}

function deleteQuest(dispatch: Redux.Dispatch<any>, id: string): any {
  dispatch({type: REQUEST_QUEST_DELETE, id});
  console.log(pushHTTPError);
  $.post("/delete/" + id).done(function(result) {
    dispatch({type: RECEIVE_QUEST_DELETE, id, result});
  }).fail(function(err) {pushHTTPError(err)});
}

function publishQuest(dispatch: Redux.Dispatch<any>, id: string): any {
  dispatch({type: REQUEST_QUEST_PUBLISH, id});
  $.post("/published/" + id + "/true", function(short_url) {
    dispatch({type: RECEIVE_QUEST_PUBLISH, id, short_url});
  }).fail(pushHTTPError);
}

function downloadQuest(dispatch: Redux.Dispatch<any>, url: string): any {
  if (!url) {
    pushError(new Error("No quest data available to download. Please save your quest first."));
  } else {
    window.open(url, '_blank');
  }
}

export function questAction(action: string, force: boolean, dirty: boolean, editor: {view: CodeViewType}, quest: {id: string, url: string}): any {
  return (dispatch: Redux.Dispatch<any>) => {
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
        return saveQuest(dispatch, quest.id, editor.view, ()=>{});
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