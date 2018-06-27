import Redux from 'redux'
import {AudioSetAction} from '../actions/ActionTypes'
import {AudioState} from './StateTypes'

export const initialAudioState: AudioState = {
  loaded: 'UNLOADED',
  paused: false,
  intensity: 0,
  peakIntensity: 0,
  sfx: null,
  timestamp: 0,
};

export function audio(state: AudioState = initialAudioState, action: Redux.Action): AudioState {
  switch(action.type) {
    case 'AUDIO_SET':
      return {...state, ...(action as AudioSetAction).delta};
    default:
      return state;
  }
}
