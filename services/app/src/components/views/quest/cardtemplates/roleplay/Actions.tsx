import Redux from 'redux';
import {QuestNodeAction} from '../../../../../actions/ActionTypes';
import {toCard} from '../../../../../actions/Card';
import {ParserNode} from '../TemplateTypes';

export function initRoleplay(node: ParserNode, custom?: boolean) {
  return (dispatch: Redux.Dispatch<any>): any => {
    // We set the quest state *after* updating the history to prevent
    // the history from grabbing the quest state before navigating.
    // This bug manifests as toPrevious() sliding back to the same card
    // content.
    dispatch({type: 'PUSH_HISTORY'});
    dispatch({type: 'QUEST_NODE', node} as QuestNodeAction);
    dispatch(toCard({name: 'QUEST_CARD', phase: 'ROLEPLAY', noHistory: true}));
  };
}
