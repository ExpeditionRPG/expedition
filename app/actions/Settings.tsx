import {ChangeSettingsAction} from './ActionTypes'

export function changeSettings(settings: any): ChangeSettingsAction {
  return {type: 'CHANGE_SETTINGS', settings};
}
