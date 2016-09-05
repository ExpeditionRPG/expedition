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
import toXML from '../../translation/to_xml'
import {pushError, consumeErrors} from './error'

const xml_filler = '<quest title="Quest Title" author="Your Name" email="email@example.com" summary="Quest summary" url="yoursite.com" recommended-min-players="2" recommended-max-players="4" min-time-minutes="20" max-time-minutes="40">\n  <roleplay title="Roleplay Title">\n    <p>roleplay text</p>\n  </roleplay>\n  <trigger>end</trigger>\n</quest>';
const editor_initial_state = {xml: xml_filler, view: CodeViews.XML, id: null, url: null, last_save: null};

// Global text buffer for render-less updates of editor.
var buffer;
export function getBuffer() {
  return buffer;
}
export function setBuffer(text) {
  buffer = text;
}

function editor(state = editor_initial_state, action) {
  switch (action.type) {
    case SET_CODE_VIEW:
      try {
        if (action.currview === CodeViews.MARKDOWN) {
          var converted = toXML(action.currcode);
          action.cb();
          return {xml: converted, view: action.nextview};
        } else {
          return {xml: action.currcode, view: action.nextview};
        }
      } catch (e) {
        pushError(e);
        return {xml: (action.currview === CodeViews.XML) ? action.currcode : state.xml, view: state.view};
      };
    case SET_DRAWER:
      // When drawer is opened, sync state so we can properly save
      if (!action.is_open) {
        return state;
      }
      console.log('sync');
      return {...state, xml: (state.view === CodeViews.MARKDOWN) ? toXML(getBuffer()) : getBuffer()};
    case SET_DIRTY:
      console.log(getBuffer());
      return {...state, xml: (state.view === CodeViews.MARKDOWN) ? toXML(getBuffer()) : getBuffer()};
    case RECEIVE_QUEST_LOAD:
      return {
        id: action.id,
        url: action.url,
        last_save: action.last_save,
        xml: action.xml
      };
    case NEW_QUEST:
    case RECEIVE_QUEST_DELETE:
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