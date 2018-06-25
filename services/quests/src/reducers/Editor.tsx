import Redux from 'redux';
import {PanelToggleAction, PlaytestInitAction, QuestRenderAction, SetDirtyAction, SetDirtyTimeoutAction, SetLineAction, SetOpInitAction, SetWordCountAction} from '../actions/ActionTypes';
import {EditorState} from './StateTypes';

const defaultState: EditorState = {
  loadingQuest: false,
  renderer: null,
  dirty: false,
  dirtyTimeout: null,
  line: {
    number: 0,
    ts: 0,
  },
  node: null,
  opInit: '',
  lastSplitPaneDragMillis: 0,
  bottomPanel: null,
  showLineNumbers: false,
  worker: null,
  wordCount: 0,
};

export function editor(state: EditorState = defaultState, action: Redux.Action): EditorState {
  switch (action.type) {
    case 'SET_DIRTY':
      return {...state, dirty: (action as SetDirtyAction).isDirty};
    case 'SET_DIRTY_TIMEOUT':
      return {...state, dirtyTimeout: (action as SetDirtyTimeoutAction).timer};
    case 'RECEIVE_QUEST_SAVE':
      return {...state, dirty: false};
    case 'SET_LINE':
      return {...state, line: {
        number: (action as SetLineAction).line,
        ts: Date.now(),
      }};
    case 'RECEIVE_QUEST_LOAD':
      return {...state, loadingQuest: false};
    case 'QUEST_LOADING':
      return {...state, loadingQuest: true};
    case 'SET_WORD_COUNT':
      return {...state, wordCount: (action as SetWordCountAction).count};
    case 'QUEST_RENDER':
      const pageTitle = (action as QuestRenderAction).qdl.getMeta().title + ' - Expedition Quest Creator';
      window.document.title = pageTitle;
      try {
        document.getElementsByTagName('title')[0].innerHTML = pageTitle;
      } catch ( Exception ) { }
      window.history.replaceState(window.history.state, pageTitle, window.location.href);
      return {...state, renderer: (action as QuestRenderAction).qdl};
    case 'QUEST_NODE':
      return {...state, node: (action as any).node};
    case 'SET_OP_INIT':
      return {...state, opInit: (action as SetOpInitAction).mathjs};
    case 'PANEL_DRAG':
      return {...state, lastSplitPaneDragMillis: Date.now()};
    case 'PANEL_TOGGLE':
      const panel = (action as PanelToggleAction).panel;
      return {...state, bottomPanel: (state.bottomPanel !== panel) ? panel : null};
    case 'PLAYTEST_INIT':
      return {...state, worker: (action as PlaytestInitAction).worker};
    case 'PLAYTEST_COMPLETE':
      return {...state, worker: null};
    case 'LINE_NUMBERS_TOGGLE':
      return {...state, showLineNumbers: !state.showLineNumbers};
    default:
      return state;
  }
}
