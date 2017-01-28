import {SetDirtyAction, SetLineAction, QuestRenderAction, SetOpInitAction, SetPlaySettingAction} from '../actions/ActionTypes'
import {EditorState} from './StateTypes'

const defaultState: EditorState = {
  renderer: null,
  dirty: false,
  line: 0,
  node: null,
  opInit: '',
  playFrom: 'cursor',
};

export function editor(state: EditorState = defaultState, action: Redux.Action): EditorState {
  switch (action.type) {
    case 'SET_DIRTY':
      return Object.assign({}, state, {dirty: (action as SetDirtyAction).is_dirty});
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
    case 'SET_PLAY_SETTING':
      return Object.assign({}, state, {playFrom: (action as SetPlaySettingAction).setting});
    default:
      return state;
  }
}

