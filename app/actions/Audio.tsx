import Redux from 'redux'
import {AudioSetAction} from './ActionTypes'
import {AudioLoadingType} from '../reducers/StateTypes'


export function audioSetIntensity(intensity: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(audioSet({intensity}));
  }
}

export function audioSetPeakIntensity(peakIntensity: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(audioSet({peakIntensity}));
  }
}

export function audioPlaySfx(sfx: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(audioSet({sfx}));
  }
}

export function audioPause() {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(audioSet({paused: true}));
  }
}

export function audioResume() {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(audioSet({paused: false}));
  }
}

export function audioLoadChange(loaded: AudioLoadingType) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(audioSet({loaded}));
  }
}

// can't use Fetch for local files since audio files might come from file://, must use this instead
// TODO: Switch to using promises
export function loadAudioLocalFile(context: AudioContext, url: string, callback: (err: Error|null, buffer: AudioBuffer|null) => void) {
  const request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = () => {
    context.decodeAudioData(request.response, (buffer: AudioBuffer) => {
      return callback(null, buffer);
    }, (err: Error) => {
      return callback(err, null);
    });
  };
  request.onerror = () => {
    return callback(Error('Network error'), null);
  };
  request.send();
}

function audioSet(changes: any): AudioSetAction {
  return {type: 'AUDIO_SET', changes: {
    sfx: null, // default to not playing a sfx
    timestamp: Date.now(),
    ...changes,
  }} as AudioSetAction;
}
