/// <reference path="../../typings/redux/redux.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />
/// <reference path="../../typings/es6-shim/es6-shim.d.ts" />
import { combineReducers } from 'redux'
import {ReceiveQuestLoadAction} from '../actions/ActionTypes'
import {pushError, consumeErrors} from '../error'
import {getBuffer, setBuffer, xml_filler} from '../buffer'
import {EditorState} from './StateTypes'

var toXML: any = (require('../../translation/to_xml') as any).toXML;

export function editor(state: EditorState = {xml: xml_filler}, action: Redux.Action): EditorState {
  switch (action.type) {
    case 'RECEIVE_QUEST_LOAD':
      let load_action = (action as ReceiveQuestLoadAction);
      setBuffer(load_action.quest.md);
      return Object.assign({}, state, {md: load_action.quest.md});
    case 'NEW_QUEST':
    case 'RECEIVE_QUEST_DELETE':
      setBuffer(xml_filler);
      return {xml: xml_filler};
    default:
      return state;
  }
}