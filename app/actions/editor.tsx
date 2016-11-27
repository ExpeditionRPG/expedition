import {SetDirtyAction, SetLineAction} from './ActionTypes'

export function setDirty(is_dirty: boolean): SetDirtyAction {
  return {type: 'SET_DIRTY', is_dirty};
}

export function setLine(line: number): SetLineAction {
  return {type: 'SET_LINE', line};
}