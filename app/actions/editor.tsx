import {SetCodeViewAction, SetDirtyAction} from './ActionTypes'
import {CodeViewType} from '../reducers/StateTypes'

export function setCodeView(currview: CodeViewType, currcode: string, nextview: CodeViewType, cb: ()=>any): SetCodeViewAction {
  return {type: 'SET_CODE_VIEW', currview, currcode, nextview, cb};
}

export function setDirty(is_dirty: boolean): SetDirtyAction {
  return {type: 'SET_DIRTY', is_dirty};
}