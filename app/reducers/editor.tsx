import { combineReducers } from 'redux'
import {SET_CODE_VIEW, RECEIVE_QUEST_LOAD, NEW_QUEST, RECEIVE_QUEST_DELETE} from '../actions/ActionTypes'
import {pushError, consumeErrors} from '../error'
import {getBuffer, setBuffer, xml_filler} from '../buffer'

var toXML: any = (require('../../translation/to_xml') as any).toXML;
var toMarkdown: any = (require('../../translation/to_markdown') as any).toMarkdown;

export function editor(state = {xml: xml_filler, view: 'XML'}, action: any): any {
  switch (action.type) {
    case SET_CODE_VIEW:
      try {
        if (action.currview === 'MARKDOWN') {
          var converted = toXML(action.currcode, false);
          setBuffer(converted);
          action.cb();
          return {xml: converted, view: action.nextview};
        } else if (action.currview === 'XML') {
          // Going to markdown view
          var converted = toMarkdown(action.currcode, false);
          setBuffer(converted);
          action.cb();
          return {xml: action.currcode, view: action.nextview};
        }
      } catch (e) {
        pushError(e);
        return {
          xml: (action.currview === 'XML') ? action.currcode : state.xml,
          view: state.view
        };
      };
    case RECEIVE_QUEST_LOAD:
      return Object.assign({}, state, {xml: action.xml});
    case NEW_QUEST:
    case RECEIVE_QUEST_DELETE:
      setBuffer(xml_filler);
      return {xml: xml_filler, view: 'XML'};
    default:
      return state;
  }
}