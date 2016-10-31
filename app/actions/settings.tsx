import {ChangeSettingsAction} from './ActionTypes'
import {SettingNameType} from '../reducers/StateTypes'

export function changeSettings(settings: any): ChangeSettingsAction {
  return {type: 'CHANGE_SETTINGS', settings};
}