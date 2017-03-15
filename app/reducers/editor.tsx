import Redux from 'redux'
import {SetDirtyAction, SetDirtyTimeoutAction, SetLineAction, QuestRenderAction, SetOpInitAction} from '../actions/ActionTypes'
import {EditorState} from './StateTypes'

const defaultState: EditorState = {
  renderer: null,
  dirty: false,
  dirtyTimeout: null,
  line: 0,
  node: null,
  opInit: '',
  lastSplitPaneDragMillis: 0,
  bottomPanelShown: false,
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
      return Object.assign({}, state, {renderer: (action as QuestRenderAction).qdl});
    case 'QUEST_NODE':
      return Object.assign({}, state, {node: (action as any).node});
    case 'SET_OP_INIT':
      return Object.assign({}, state, {opInit: (action as SetOpInitAction).mathjs});
    case 'PANEL_DRAG':
      return Object.assign({}, state, {lastSplitPaneDragMillis: Date.now()});
    case 'PANEL_TOGGLE':
      return Object.assign({}, state, {bottomPanelShown: !state.bottomPanelShown});
    default:
      return state;
  }
}

