import * as Redux from 'redux';
import {AudioNode} from '../audio/AudioNode';
import {ThemeManager} from '../audio/ThemeManager';
import {MUSIC_DEFINITIONS} from '../Constants';
import {getAudioContext} from '../Globals';
import {AudioDataState, AudioState} from '../reducers/StateTypes';
import {AudioDataSetAction, AudioSetAction} from './ActionTypes';
const eachLimit = require('async/eachLimit');

export function getAllMusicFiles(): string[] {
  return Object.keys(MUSIC_DEFINITIONS).reduce((list: string[], musicClass: string) => {
    return list.concat(Object.keys(MUSIC_DEFINITIONS[musicClass]).reduce((acc: string[], musicWeight: string) => {
      const weight = MUSIC_DEFINITIONS[musicClass][musicWeight];
      for (const instrument of weight.instruments) {
        for (let v = 1; v <= weight.variants; v++) {
          acc.push(`${musicClass}/${musicWeight}/${instrument}${v}`);
        }
      }
      return acc;
    }, []));
  }, []);
}

// can't use Fetch for local files since audio files might come from file://, must use this instead
// TODO: Switch to using promises
export function loadAudioLocalFile(context: AudioContext, url: string, callback: (err: Error|null, buffer: AudioNode|null) => void) {
  const request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = () => {
    context.decodeAudioData(request.response, (buffer: AudioBuffer) => {
      return callback(null, new AudioNode(context, buffer));
    }, (err: Error) => {
      return callback(err, null);
    });
  };
  request.onerror = () => {
    return callback(Error('Network error'), null);
  };
  request.send();
}

function audioDataSet(data: Partial<AudioDataState>): AudioDataSetAction {
  return {type: 'AUDIO_DATA_SET', data};
}

export function loadAudioFiles() {
  return (dispatch: Redux.Dispatch<any>): any => {
    const ac = getAudioContext();
    if (!ac) {
      return;
    }

    dispatch(audioSet({loaded: 'LOADING'}));
    const musicFiles = getAllMusicFiles();
    const audioNodes: {[key: string]: AudioNode} = {};
    eachLimit(musicFiles, 4, (file: string, callback: (err?: Error) => void) => {
      loadAudioLocalFile(ac, 'audio/' + file + '.mp3', (err: Error|null, ns: AudioNode) => {
        if (err) {
          console.error('Error loading audio file ' + file + ': ' + err.toString());
          return callback(err);
        }
        audioNodes[file] = ns;
        return callback();
      });
    }, (err?: Error) => {
      if (err) {
        dispatch(audioSet({loaded: 'ERROR'}));
        return;
      }
      dispatch(audioSet({loaded: 'LOADED'}));
      const themeManager = new ThemeManager(audioNodes, Math.random);
      dispatch(audioDataSet({audioNodes, themeManager}));
    });
  };
}

export function audioSet(delta: Partial<AudioState>): AudioSetAction {
  return {
    delta: {
      sfx: null, // default to not playing a sfx
      timestamp: Date.now(),
      ...delta,
    },
    type: 'AUDIO_SET',
  } as AudioSetAction;
}
