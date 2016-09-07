import { combineReducers } from 'redux'
import {
  SET_CODE_VIEW,
  SET_DIRTY,
  SET_DIALOG,
  SIGN_IN,
  SIGN_OUT,
  SET_DRAWER,
  CodeViews,
  NEW_QUEST,
  DELETE_QUEST,
  LOAD_QUEST,
  DOWNLOAD_QUEST,
  REQUEST_QUEST_LIST,
  REQUEST_QUEST_LOAD,
  REQUEST_QUEST_SAVE,
  REQUEST_QUEST_DELETE,
  REQUEST_QUEST_PUBLISH,
  RECEIVE_QUEST_LIST,
  RECEIVE_QUEST_LOAD,
  RECEIVE_QUEST_SAVE,
  RECEIVE_QUEST_DELETE,
  RECEIVE_QUEST_PUBLISH,
  PUBLISH_QUEST,
  SAVE_QUEST,
  DialogIDs } from './actions'
import {toXML} from '../../translation/to_xml'
import {toMarkdown} from '../../translation/to_markdown'
import {pushError, consumeErrors} from './error'
import {getBuffer, setBuffer, xml_filler} from './buffer'

const editor_initial_state = {xml: xml_filler, view: CodeViews.XML, id: null, url: null, last_save: null};

function editor(state = editor_initial_state, action) {
  switch (action.type) {
    case SET_CODE_VIEW:
      try {
        if (action.currview === CodeViews.MARKDOWN) {
          var converted = toXML(action.currcode);
          setBuffer(converted);
          action.cb();
          return {xml: converted, view: action.nextview};
        } else if (action.currview === CodeViews.XML) {
          // Going to markdown view
          var converted = toMarkdown(action.currcode);
          setBuffer(converted);
          action.cb();
          return {xml: action.currcode, view: action.nextview};
        }
      } catch (e) {
        pushError(e);
        return {xml: (action.currview === CodeViews.XML) ? action.currcode : state.xml, view: state.view};
      };
    case RECEIVE_QUEST_LOAD:
      return {
        id: action.id,
        url: action.url,
        last_save: action.last_save,
        xml: action.xml
      };
    case NEW_QUEST:
    case RECEIVE_QUEST_DELETE:
      setBuffer(xml_filler);
      return editor_initial_state;
    case DOWNLOAD_QUEST:
      if (!state.url) {
        pushError(new Error("No quest data available to download. Please save your quest first."));
      } else {
        window.open(state.url, '_blank');
      }
      return state;
    default:
      return state;
  }
}

function dirty(state = false, action) {
  switch (action.type) {
    case SET_DIRTY:
      return action.is_dirty;
    case RECEIVE_QUEST_SAVE:
    case RECEIVE_QUEST_DELETE:
    case NEW_QUEST:
      return false;
    default:
      return state;
  }
}

function drawer(state = {open: false, quests: null, receivedAt: null}, action) {
  switch (action.type) {
    case SET_DRAWER:
      return {open: action.is_open, quests: state.quests}; // TODO: Fetch
    case RECEIVE_QUEST_LIST:
      return {open: state.open, quests: action.quests, receivedAt: action.receivedAt};
    case NEW_QUEST:
    case REQUEST_QUEST_LOAD:
    case REQUEST_QUEST_SAVE:
    case REQUEST_QUEST_DELETE:
    case REQUEST_QUEST_PUBLISH:
      return {...state, open: false};
    default:
      return state;
  }
}

function dialogs(state = {
  [DialogIDs.USER]: false,
  [DialogIDs.ERROR]: false,
  [DialogIDs.CONFIRM_NEW_QUEST]: false,
  [DialogIDs.CONFIRM_LOAD_QUEST]: false,
  [DialogIDs.PUBLISH_QUEST]: false},
  action) {

  switch (action.type) {
    case SET_DIALOG:
      return {...state, [action.dialog]: action.shown};
    case NEW_QUEST:
      return {...state, [DialogIDs.CONFIRM_NEW_QUEST]: false};
    case LOAD_QUEST:
      return {...state, [DialogIDs.CONFIRM_LOAD_QUEST]: false};
    case RECEIVE_QUEST_PUBLISH:
      return {...state, [DialogIDs.PUBLISH_QUEST]: true}
    default:
      return state;
  }
}

function user(state = {}, action) {
  switch(action.type) {
    // TODO
    case SIGN_IN:
      window.location = state.login;
      return state;
    case SIGN_OUT:
      window.location = state.logout;
      return state;
    default:
      return state;
  }
}

function shorturl(state = null, action) {
  switch (action.type) {
    case RECEIVE_QUEST_PUBLISH:
      return action.short_url;
    default:
      return state;
  }
}

function errors(state = {}, action) {
  // Transfer accumulated errors into state.
  return consumeErrors();
}

const questIDEApp = combineReducers({
  editor,
  dirty,
  shorturl,
  drawer,
  user,
  dialogs,
  errors
});

/*
const questIDEApp = function(state, action) {
  reducer_errors = [];
  var result = combined_reducers(state, action);
  result.errors = reducer_errors;
}
*/
export default questIDEApp