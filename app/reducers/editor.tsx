/// <reference path="../../typings/redux/redux.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />
/// <reference path="../../typings/es6-shim/es6-shim.d.ts" />
import { combineReducers } from 'redux'
import {SET_CODE_VIEW, SetCodeViewAction, RECEIVE_QUEST_LOAD, ReceiveQuestLoadAction, NEW_QUEST, RECEIVE_QUEST_DELETE} from '../actions/ActionTypes'
import {pushError, consumeErrors} from '../error'
import {getBuffer, setBuffer, xml_filler} from '../buffer'
import {EditorType} from './StateTypes'

var toXML: any = (require('../../translation/to_xml') as any).toXML;
var toMarkdown: any = (require('../../translation/to_markdown') as any).toMarkdown;

export function editor(state: EditorType = {xml: xml_filler, view: 'XML'}, action: Redux.Action): EditorType {
  switch (action.type) {
    case SET_CODE_VIEW:
      let code_view = (action as SetCodeViewAction);
      try {
        if (code_view.currview === 'MARKDOWN') {
          var converted = toXML(code_view.currcode, false);
          setBuffer(converted);
          code_view.cb();
          return {xml: converted, view: code_view.nextview};
        } else if (code_view.currview === 'XML') {
          // Going to markdown view
          var converted = toMarkdown(code_view.currcode, false);
          setBuffer(converted);
          code_view.cb();
          return {xml: code_view.currcode, view: code_view.nextview};
        }
      } catch (e) {
        pushError(e);
        return {
          xml: (code_view.currview === 'XML') ? code_view.currcode : state.xml,
          view: state.view
        };
      };
    case RECEIVE_QUEST_LOAD:
      let load_action = (action as ReceiveQuestLoadAction);
      setBuffer(load_action.quest.xml);
      return Object.assign({}, state, {xml: load_action.quest.xml});
    case NEW_QUEST:
    case RECEIVE_QUEST_DELETE:
      setBuffer(xml_filler);
      return {xml: xml_filler, view: 'XML'};
    default:
      return state;
  }
}