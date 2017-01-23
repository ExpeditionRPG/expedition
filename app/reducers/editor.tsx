import {SetDirtyAction, SetDirtyTimeoutAction, SetLineAction, QuestRenderAction} from '../actions/ActionTypes'
import {EditorState} from './StateTypes'

const defaultState: EditorState = {
  renderer: null,
  dirty: false,
  dirtyTimeout: null,
  line: 0,
  node: null,
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
    default:
      return state;
  }
}

