import {SetDirtyAction, SetLineAction} from './ActionTypes'

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