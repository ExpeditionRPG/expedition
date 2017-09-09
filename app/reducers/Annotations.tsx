import Redux from 'redux'
import {LogMessage, LogMessageMap} from 'expedition-qdl/lib/render/Logger'
import {AnnotationType} from './StateTypes'
import {QuestRenderAction, QuestPlaytestAction} from '../actions/ActionTypes'

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
      type: m.type,
    });
  }
}

export function annotations(state: AnnotationType[] = [], action: Redux.Action): AnnotationType[] {
  // Transfer accumulated errors into state.
  let msgs: LogMessageMap;
  let result: AnnotationType[] = [];

  switch (action.type) {
    case 'QUEST_PLAYTEST':
      msgs = (action as QuestPlaytestAction).msgs;
      result = [...state]; // Persist other messages from render
      break;
    case 'QUEST_RENDER':
      msgs = (action as QuestRenderAction).msgs;
      break;
    default:
      return state;
  }

  // Don't render info lines here.
  // TODO: Conditionally render info lines based on user settings
  var errorLines = new Set<number>();
  toAnnotation(msgs.warning, result, errorLines);
  toAnnotation(msgs.error, result, errorLines);
  toAnnotation(msgs.internal, result, errorLines);

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
