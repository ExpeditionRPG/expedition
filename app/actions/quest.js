import {
  REQUEST_QUEST_LOAD, RECEIVE_QUEST_LOAD,
  REQUEST_QUEST_SAVE, RECEIVE_QUEST_SAVE,
  REQUEST_QUEST_DELETE, RECEIVE_QUEST_DELETE,
  REQUEST_QUEST_PUBLISH, RECEIVE_QUEST_PUBLISH
} from './ActionTypes'

function receiveQuestData(result, xml) {
  return {
    type: RECEIVE_QUEST_LOAD,
    id: result.id,
    url: result.url,
    last_save: result.modified,
    xml: xml
  };
}

function loadQuest(dispatch, id) {
  // We only load quests when the drawer is open.
  dispatch({type: REQUEST_QUEST_LOAD, id});
  return $.get("/quest/"+id, function(raw_result) {
    var result = JSON.parse(raw_result);
    $.get(result.url, function(xml) {
      dispatch(receiveQuestData(result, xml));
    }).fail(pushHTTPError);
  }).fail(pushHTTPError);
}

export function saveQuest(dispatch, id, view, cb) {
  // Pull from the text buffer for maximum freshness.
  var data = getBuffer();
  if (view === CodeViews.MARKDOWN) {
    var err = null;
    try {
      data = toXML(data);
    } catch (e) {
      pushError(e);
      dispatch(setDialog(DialogIDs.ERROR, true));
      return;
    }
  }

  dispatch({type: REQUEST_QUEST_SAVE, id});
  return $.post("/quest/" + id, data, function(result_quest_id) {
    dispatch({type: RECEIVE_QUEST_SAVE, id: result_quest_id});
    if (cb) {
      cb(result_quest_id);
    }
  }).fail(pushHTTPError);
}

function deleteQuest(dispatch, id) {
  dispatch({type: REQUEST_QUEST_DELETE, id});
  console.log(pushHTTPError);
  $.post("/delete/" + id).done(function(result) {
    dispatch({type: RECEIVE_QUEST_DELETE, id, result});
  }).fail(function(err) {pushHTTPError(err)});
}

function publishQuest(dispatch, id) {
  dispatch({type: REQUEST_QUEST_PUBLISH, id});
  $.post("/published/" + id + "/true", function(short_url) {
    dispatch({type: RECEIVE_QUEST_PUBLISH, id, short_url});
  }).fail(pushHTTPError);
}

function downloadQuest(dispatch, id) {
  if (!state.url) {
    pushError(new Error("No quest data available to download. Please save your quest first."));
  } else {
    window.open(state.url, '_blank');
  }
  return state;
}

export function questAction(action, force, dirty, editor, quest) {
  return dispatch => {
    // Show confirmation dialogs for certain actions if
    // we have a dirty editor.
    if (dirty && !force) {
      switch(action) {
        case NEW_QUEST:
          return dispatch(setDialog(DialogIDs.CONFIRM_NEW_QUEST, true));
        case LOAD_QUEST:
          return dispatch(setDialog(DialogIDs.CONFIRM_LOAD_QUEST, true));
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
        return saveQuest(dispatch, quest.id, editor.view);
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