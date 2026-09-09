import Redux from 'redux';
import { LogMessage, LogMessageMap } from 'shared/render/Logger';
import { QuestPlaytestAction, QuestRenderAction } from '../actions/ActionTypes';
import { AnnotationsState, AnnotationType } from './StateTypes';

const initialAnnotations: AnnotationsState = {
  playtest: [],
  spellcheck: [],
};

function toAnnotation(
  msgs: LogMessage[],
  result: AnnotationType[],
  errorLines: Set<number>,
): void {
  for (const m of msgs) {
    errorLines.add(m.line || 0);

    const type = m.type === 'internal' ? 'error' : m.type;
    const text = m.type === 'internal' ? 'PLEASE REPORT: ' + m.text : m.text;

    result.push({
      column: 0,
      row: m.line || 0,
      text:
        type[0].toUpperCase() + type.substring(1) + ' ' + m.url + ': ' + text,
      type,
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
      column: 0,
      row: l,
      text: '(Click the icon for details)',
      type: 'info',
    });
  });

  return result;
}

export function annotations(
  state: AnnotationsState = initialAnnotations,
  action: Redux.Action,
): AnnotationsState {
  switch (action.type) {
    case 'PLAYTEST_INIT':
      return { ...state, playtest: [] };
    case 'PLAYTEST_MESSAGE':
      return {
        ...state,
        playtest: [
          ...state.playtest,
          ...messagesToErrors((action as QuestPlaytestAction).msgs),
        ],
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
