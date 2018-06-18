import Redux from 'redux'
import {LogMessage, LogMessageMap} from 'expedition-qdl/render/Logger'
import {AnnotationType, AnnotationsState} from './StateTypes'
import {QuestRenderAction, QuestPlaytestAction} from '../actions/ActionTypes'

const initialAnnotations: AnnotationsState = {
  spellcheck: [],
  playtest: [],
};

function toAnnotation(msgs: LogMessage[], result: AnnotationType[], errorLines: Set<number>): void {
  for (const m of msgs) {
    errorLines.add(m.line || 0);

    if (m.type === 'internal') {
      m.text = 'PLEASE REPORT: ' + m.text;
      m.type = 'error';
    }

    result.push({
      row: m.line || 0,
      column: 0,
      text: m.type[0].toUpperCase() + m.type.substring(1) + ' ' + m.url + ': ' +m.text,
      type: m.type,
    });
  }
}

function messagesToErrors(msgs: LogMessageMap): AnnotationType[] {
  // Don't render info lines here.
  // TODO: Conditionally render info lines based on user settings
  const result: AnnotationType[] = [];
  const errorLines = new Set<number>();
  toAnnotation(msgs.warning, result, errorLines);
  toAnnotation(msgs.error, result, errorLines);
  toAnnotation(msgs.internal, result, errorLines);

  errorLines.forEach((l: number) => {
    result.push({
      row: l,
      column: 0,
      text: '(Click the icon for details)',
      type: 'info',
    });
  });

  return result;
}

export function annotations(state: AnnotationsState = initialAnnotations, action: Redux.Action): AnnotationsState {
  switch (action.type) {
    case 'PLAYTEST_INIT':
      return {...state, playtest: []};
    case 'PLAYTEST_MESSAGE':
      return {
        ...state,
        playtest: [...state.playtest, ...messagesToErrors((action as QuestPlaytestAction).msgs)],
      };
    case 'QUEST_RENDER':
      return {
        ...state,
        spellcheck: messagesToErrors((action as QuestRenderAction).msgs),
      };
    default:
      return state;
  }


}
