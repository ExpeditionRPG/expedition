import {AudioSetAction} from './ActionTypes'
import {AudioState} from '../reducers/StateTypes'

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

export function audioSet(delta: Partial<AudioState>): AudioSetAction {
  return {type: 'AUDIO_SET', delta: {
    sfx: null, // default to not playing a sfx
    timestamp: Date.now(),
    ...delta,
  }} as AudioSetAction;
}
