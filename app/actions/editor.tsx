import {SetDirtyAction} from './ActionTypes'

export function setDirty(is_dirty: boolean): SetDirtyAction {
  console.log('hi')
  return {type: 'SET_DIRTY', is_dirty};
}