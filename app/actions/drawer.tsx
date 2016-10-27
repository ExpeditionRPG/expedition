import {SetDrawerAction} from './ActionTypes'
import {QuestType} from '../reducers/StateTypes'

export function setDrawer(user: string, is_open: boolean): SetDrawerAction {
  return {type: 'SET_DRAWER', is_open};
}