import {SetDirtyAction} from '../actions/ActionTypes'
import {DirtyState} from './StateTypes'

export function dirty(state: DirtyState = false, action: Redux.Action): DirtyState {
  switch (action.type) {
    case 'SET_DIRTY':
      return (action as SetDirtyAction).is_dirty;
    case 'RECEIVE_QUEST_SAVE':
    case 'RECEIVE_QUEST_DELETE':
    case 'NEW_QUEST':
      return false;
    default:
      return state;
  }
}

