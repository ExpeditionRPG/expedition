import Redux from 'redux';
import {AudioDataSetAction} from '../actions/ActionTypes';
import {AudioDataState} from './StateTypes';

export const initialStaticFiles: AudioDataState = {
  audioNodes: null,
  themeManager: null,
};

export function audioData(state: AudioDataState = initialStaticFiles, action: Redux.Action): AudioDataState {
  switch (action.type) {
    case 'AUDIO_DATA_SET':
      return {...state, ...(action as AudioDataSetAction).data};
    default:
      return state;
  }
}
