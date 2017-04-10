import Redux from 'redux'
import {toCard} from '../../actions/card'
import {SettingsType} from '../../reducers/StateTypes'
import {ParserNode} from '../../parser/Node'
import {QuestNodeAction} from '../../actions/ActionTypes'

export function initRoleplay(node: ParserNode, settings: SettingsType, custom?: boolean) {
  return (dispatch: Redux.Dispatch<any>): any => {
    // We set the quest state *after* the toCard() dispatch to prevent
    // the history from grabbing the quest state before navigating.
    // This bug manifests as toPrevious() sliding back to the same card
    // content.
    dispatch(toCard('QUEST_CARD', null));
    dispatch({type: 'QUEST_NODE', node} as QuestNodeAction);
  };
}