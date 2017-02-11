import {LogMessage} from '../parsing/Logger'
import {AnnotationType} from './StateTypes'
import {QuestRenderAction} from '../actions/ActionTypes'

function toAnnotation(msgs: LogMessage[], result: AnnotationType[], errorLines: Set<number>): void {
  for (let m of msgs) {
    errorLines.add(m.line);

    if (m.type === 'internal') {
      m.text = 'PLEASE REPORT: ' + m.text;
      m.type = 'error';
    }

    result.push({
      row: m.line,
      column: 0,
      text: m.type + ' ' + m.url + ': ' +m.text,
      type: (m.type === 'internal') ? 'error' : m.type,
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
  var errorLines = new Set<number>();
  toAnnotation(msgsAction.msgs.warning, result, errorLines);
  toAnnotation(msgsAction.msgs.error, result, errorLines);
  toAnnotation(msgsAction.msgs.internal, result, errorLines);

  errorLines.forEach((l: number) => {
    result.push({
      row: l,
      column: 0,
      text: '(See HELP for more details)',
      type: 'info',
    });
  });

  return result;
}
