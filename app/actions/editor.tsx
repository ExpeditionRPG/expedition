import {SetDirtyAction, SetLineAction, ConsoleHistoryAction} from './ActionTypes'
import {ConsoleHistory} from '../reducers/StateTypes'

export function setDirty(is_dirty: boolean): SetDirtyAction {
  return {type: 'SET_DIRTY', is_dirty};
}

export function setLine(line: number): SetLineAction {
  return {type: 'SET_LINE', line};
}

export function setOpInit(mathjs: string) {
  return {type: 'SET_OP_INIT', mathjs};
}

export function setPlaySetting(setting: string) {
  return {type: 'SET_PLAY_SETTING', setting};
}

export function setConsoleHistory(history: ConsoleHistory): ConsoleHistoryAction {
  return {type: 'CONSOLE_HISTORY', history};
}
