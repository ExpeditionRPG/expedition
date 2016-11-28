import {BlockMsg} from '../parsing/BlockMsg'
import {AnnotationType} from './StateTypes'
import {QuestRenderAction} from '../actions/ActionTypes'

function toAnnotation(msgs: BlockMsg[], result: AnnotationType[]): void {
  for (let m of msgs) {
    result.push({
      row: m.line || (m.blockGroup.length && m.blockGroup[0].startLine),
      column: 0,
      text: m.text,
      type: m.type,
    });
  }
}

export function annotations(state: AnnotationType[] = [], action: Redux.Action): AnnotationType[] {
  // Transfer accumulated errors into state.
  if (action.type !== 'QUEST_RENDER') {
    return state;
  }

  var msgsAction = (action as QuestRenderAction);
  var result: AnnotationType[] = [];
  // Don't render info lines here.
  toAnnotation(msgsAction.msgs.warning, result);
  toAnnotation(msgsAction.msgs.error, result);
  return result;
}
