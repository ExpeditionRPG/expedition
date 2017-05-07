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
};

export function editor(state: EditorState = defaultState, action: Redux.Action): EditorState {
  switch (action.type) {
    case 'SET_DIRTY':
      return Object.assign({}, state, {dirty: (action as SetDirtyAction).is_dirty});
    case 'SET_DIRTY_TIMEOUT':
      return Object.assign({}, state, {dirtyTimeout: (action as SetDirtyTimeoutAction).timer});
    case 'RECEIVE_QUEST_SAVE':
      return Object.assign({}, state, {dirty: false});
    case 'SET_LINE':
      return Object.assign({}, state, {line: (action as SetLineAction).line});
    case 'QUEST_RENDER':
      window.document.title = 'Expedition Quest Creator - ' + (action as QuestRenderAction).qdl.getMeta()['title'];
      return Object.assign({}, state, {renderer: (action as QuestRenderAction).qdl});
    case 'QUEST_NODE':
      return Object.assign({}, state, {node: (action as any).node});
    case 'SET_OP_INIT':
      return Object.assign({}, state, {opInit: (action as SetOpInitAction).mathjs});
    case 'PANEL_DRAG':
      return Object.assign({}, state, {lastSplitPaneDragMillis: Date.now()});
    case 'PANEL_TOGGLE':
      const panel = (action as PanelToggleAction).panel;
      return Object.assign({}, state, {bottomPanel: (state.bottomPanel !== panel) ? panel : null});
    default:
      return state;
  }
}

