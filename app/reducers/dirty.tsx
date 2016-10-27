import {SetDirtyAction} from '../actions/ActionTypes'
import {DirtyState} from './StateTypes'

export function dirty(state: DirtyState = false, action: Redux.Action): DirtyState {
  switch (action.type) {
    case 'SET_DIRTY':
      return (action as SetDirtyAction).is_dirty;
    case 'RECEIVE_QUEST_SAVE':
      return false;
    default:
      return state;
  }
}

