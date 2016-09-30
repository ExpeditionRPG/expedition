import {ChangeSettingAction} from './ActionTypes'
import {SettingNameType} from '../reducers/StateTypes'

export function changeSetting(name: SettingNameType, value: any): ChangeSettingAction {
  return {type: 'CHANGE_SETTING', name, value};
}