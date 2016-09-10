import {SET_CODE_VIEW, SET_DIRTY, CodeViewType} from './ActionTypes'

export function setCodeView(currview: CodeViewType, currcode: string, nextview: CodeViewType, cb: ()=>any): any {
  return {type: SET_CODE_VIEW, currview, currcode, nextview, cb};
}

export function setDirty(is_dirty: boolean): any {
  return {type: SET_DIRTY, is_dirty};
}