import {SetDirtyAction} from './ActionTypes'

export function setDirty(is_dirty: boolean): SetDirtyAction {
  return {type: 'SET_DIRTY', is_dirty};
}