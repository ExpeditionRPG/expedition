import { combineReducers } from 'redux'
import {SET_CODE_VIEW, RECEIVE_QUEST_LOAD, NEW_QUEST, RECEIVE_QUEST_DELETE, CodeViews} from '../actions/ActionTypes'
import {toXML} from '../../translation/to_xml'
import {toMarkdown} from '../../translation/to_markdown'
import {pushError, consumeErrors} from '../error'
import {getBuffer, setBuffer, xml_filler} from '../buffer'

export function editor(state = {xml: xml_filler, view: CodeViews.XML}, action) {
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
        return {
          xml: (action.currview === CodeViews.XML) ? action.currcode : state.xml,
          view: state.view
        };
      };
    case RECEIVE_QUEST_LOAD:
      return {...state, xml: action.xml};
    case NEW_QUEST:
    case RECEIVE_QUEST_DELETE:
      setBuffer(xml_filler);
      return {xml: xml_filler, view: CodeViews.XML};
    default:
      return state;
  }
}