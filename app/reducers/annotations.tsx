import {LogMessage} from '../parsing/Logger'
import {AnnotationType} from './StateTypes'
import {QuestRenderAction} from '../actions/ActionTypes'

function toAnnotation(msgs: LogMessage[], result: AnnotationType[]): void {
  for (let m of msgs) {
    result.push({
      row: m.line,
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
