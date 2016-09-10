import {SET_CODE_VIEW, SET_DIRTY} from '../ActionTypes'

export function setCodeView(currview, currcode, nextview, cb) {
  return {type: SET_CODE_VIEW, currview, currcode, nextview, cb};
}

export function setDirty(is_dirty) {
  return {type: SET_DIRTY, is_dirty};
}