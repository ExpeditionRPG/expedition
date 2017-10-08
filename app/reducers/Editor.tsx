import Redux from 'redux'
import {PanelToggleAction, SetDirtyAction, SetDirtyTimeoutAction, SetLineAction, QuestRenderAction, SetOpInitAction} from '../actions/ActionTypes'
import {EditorState, PanelType} from './StateTypes'

const defaultState: EditorState = {
  renderer: null,
  dirty: false,
  dirtyTimeout: null,
  line: 0,
  node: null,
  opInit: '',
  lastSplitPaneDragMillis: 0,
  bottomPanel: null,
  worker: null,
};

export function editor(state: EditorState = defaultState, action: Redux.Action): EditorState {
  switch (action.type) {
    case 'SET_DIRTY':
      return {...state, dirty: (action as SetDirtyAction).is_dirty};
    case 'SET_DIRTY_TIMEOUT':
      return {...state, dirtyTimeout: (action as SetDirtyTimeoutAction).timer};
    case 'RECEIVE_QUEST_SAVE':
      return {...state, dirty: false};
    case 'SET_LINE':
      return {...state, line: (action as SetLineAction).line};
    case 'QUEST_RENDER':
      const pageTitle = (action as QuestRenderAction).qdl.getMeta()['title'] + ' - Expedition Quest Creator';
      window.document.title = pageTitle;
      try {
        document.getElementsByTagName('title')[0].innerHTML = pageTitle;
      }
      catch ( Exception ) { }
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
    default:
      return state;
  }
}

