import {LogMessage} from '../parsing/Logger'
import {AnnotationType} from './StateTypes'
import {QuestRenderAction} from '../actions/ActionTypes'

function toAnnotation(msgs: LogMessage[], result: AnnotationType[]): void {
  for (let m of msgs) {

    if (m.type === 'internal') {
      m.text = "PLEASE REPORT: " + m.text;
      m.type = 'error';
    }

    result.push({
      row: m.line,
      column: 0,
      text: m.text + "\n(See \"" + m.url + "\" help section.)\n",
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
  // TODO: Conditionally render info lines based on user settings
  toAnnotation(msgsAction.msgs.warning, result);
  toAnnotation(msgsAction.msgs.error, result);
  toAnnotation(msgsAction.msgs.internal, result);
  return result;
}
