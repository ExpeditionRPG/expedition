import {SetViewAction} from './ActionTypes'
import {ViewType} from '../reducers/StateTypes'

export function setView(view: ViewType): SetViewAction {
  return {type: 'SET_VIEW', view};
}
