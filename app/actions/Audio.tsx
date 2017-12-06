import Redux from 'redux'
import {AudioSetAction} from './ActionTypes'


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

// can't use Fetch for local files since audio files might come from file://, must use this instead
export function loadAudioLocalFile(context: any, url: string, callback: (err: string, buffer: any) => void) {
  const request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = () => {
    context.decodeAudioData(request.response, (buffer: any) => {
      return callback(null, buffer);
    }, (err: string) => {
      return callback(err, null);
    });
  };
  request.onerror = () => {
    return callback('Network error', null);
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
