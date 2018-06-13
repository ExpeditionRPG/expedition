import {ChangeSettingsAction} from './ActionTypes'

export function changeSettings(settings: any): ChangeSettingsAction {
  // TODO: Changing player count in settings should affect
  // player status
  return {type: 'CHANGE_SETTINGS', settings};
}
