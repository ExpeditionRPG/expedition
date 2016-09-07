import {pushError, pushHTTPError} from './error'
import {getBuffer} from './buffer'
import {toXML} from '../../translation/to_xml'

export const SET_CODE_VIEW = 'SET_CODE_VIEW';
export const SET_DIRTY = 'SET_DIRTY';
export const SET_DRAWER = 'SET_DRAWER';
export const SET_DIALOG = 'SET_DIALOG';
export const NEW_QUEST = 'NEW_QUEST';
export const LOAD_QUEST = 'LOAD_QUEST';
export const DELETE_QUEST = 'DELETE_QUEST';
export const SAVE_QUEST = 'SAVE_QUEST';
export const PUBLISH_QUEST = 'PUBLISH_QUEST';
export const DOWNLOAD_QUEST = 'DOWNLOAD_QUEST';
export const SIGN_IN = 'SIGN_IN';
export const SIGN_OUT = 'SIGN_OUT';

export const DialogIDs = {
  USER: 'USER',
  ERROR: 'ERROR',
  CONFIRM_NEW_QUEST: 'CONFIRM_NEW_QUEST',
  CONFIRM_LOAD_QUEST: 'CONFIRM_LOAD_QUEST',
  PUBLISH_QUEST: 'PUBLISH_QUEST'
};

export const CodeViews = {
  XML: 'XML',
  MARKDOWN: 'MARKDOWN'
};

export const DrawerActions = {
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  TOGGLE: 'TOGGLE'
};

export function setCodeView(currview, currcode, nextview, cb) {
  return {type: SET_CODE_VIEW, currview, currcode, nextview, cb};
}

export function setDirty(is_dirty) {
  return {type: SET_DIRTY, is_dirty};
}

export function setDialog(dialog, shown) {
  return {type: SET_DIALOG, dialog, shown};
}

export function signIn() {
  return {type: SIGN_IN};
}

export function signOut() {
  return {type: SIGN_OUT};
}

export const REQUEST_QUEST_LIST = 'REQUEST_QUEST_LIST';
export const RECEIVE_QUEST_LIST = 'RECEIVE_QUEST_LIST';
function receiveQuestList(json) {
  return {
    type: RECEIVE_QUEST_LIST,
    quests: json.quests,
    nextToken: json.nextToken,
    receivedAt: Date.now()
  };
}
function fetchQuestList(dispatch) {
  dispatch({type: REQUEST_QUEST_LIST});
  return $.get("/quests/0").done(data => dispatch(receiveQuestList(JSON.parse(data)))); // TODO: Add fail
}

export function setDrawer(is_open) {
  return dispatch => {
    dispatch({type: SET_DRAWER, is_open});
    if (is_open) {
      return $.get("/quests/0").done(data => dispatch(receiveQuestList(JSON.parse(data)))); // TODO: Add fail
    }
  }
}

export const REQUEST_QUEST_LOAD = 'REQUEST_QUEST_LOAD';
export const RECEIVE_QUEST_LOAD = 'RECEIVE_QUEST_LOAD';
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

export const REQUEST_QUEST_SAVE = 'REQUEST_QUEST_SAVE';
export const RECEIVE_QUEST_SAVE = 'RECEIVE_QUEST_SAVE';
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

export const REQUEST_QUEST_DELETE = 'REQUEST_QUEST_DELETE';
export const RECEIVE_QUEST_DELETE = 'RECEIVE_QUEST_DELETE';
function deleteQuest(dispatch, id) {
  dispatch({type: REQUEST_QUEST_DELETE, id});
  console.log(pushHTTPError);
  $.post("/delete/" + id).done(function(result) {
    dispatch({type: RECEIVE_QUEST_DELETE, id, result});
  }).fail(function(err) {pushHTTPError(err)});
}

export const REQUEST_QUEST_PUBLISH = 'REQUEST_QUEST_PUBLISH';
export const RECEIVE_QUEST_PUBLISH = 'RECEIVE_QUEST_PUBLISH';
function publishQuest(dispatch, id) {
  dispatch({type: REQUEST_QUEST_PUBLISH, id});
  $.post("/published/" + id + "/true", function(short_url) {
    dispatch({type: RECEIVE_QUEST_PUBLISH, id, short_url});
  }).fail(pushHTTPError);
}

export function questAction(action, force, id, dirty, view) {
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
        return loadQuest(dispatch, id);
      case SAVE_QUEST:
        return saveQuest(dispatch, id, view);
      case DELETE_QUEST:
        return deleteQuest(dispatch, id);
      case PUBLISH_QUEST:
        return publishQuest(dispatch, id);
      default:
        break;
    }

    return dispatch({type: action});
  }
}

export function setDrawer(is_open) {
  return dispatch => {
    dispatch({type: SET_DRAWER, is_open});
    if (is_open) {
      return fetchQuestList(dispatch);
    }
  }
}