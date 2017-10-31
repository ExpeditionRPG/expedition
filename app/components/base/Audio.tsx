import * as React from 'react'
import {loadAudioLocalFile} from '../../actions/Audio'
import {AudioState, SettingsType} from '../../reducers/StateTypes'
import {getWindow} from '../../Globals'
import {logEvent} from '../../Main'
import {AUDIO_COMMAND_DEBOUNCE_MS} from '../../Constants'

/* Notes on audio implementation:
- some people say that exponentialRampToValueAtTime sounds better than linear ramping;
  after several experiments, I've decided it actually sounds worse for our use case.
- music files are purposefully longer than their listed durationMs, so that they have time
  to wrap up their echoes / reverbs
- audio.enabled only changes from detecting incompatibility, or user changing the setting
  and so behaves like an all-stop since it's unlikely to be turned back on that session
  - for example, if this is initialized with audio disabled, it does not load audio files -
    but, if you turn on audio later in the session, it'll download them at that time
- audio.paused may change at any time (such as minimizing / returning to the tab),
  so it behaves like pause / resume
*/

const SFX_FILES = ['sfx_combat_defeat', 'sfx_combat_victory'];
const MUSIC_FADE_SECONDS = 1.5;
const MUSIC_DICTIONARY = {
  combat_light: {
    durationMs: 8000,
    tracks: ['combat_light_low_strings', 'combat_light_high_strings'],
  },
  combat_intense: {
    durationMs: 8000,
    tracks: ['combat_intense_low_strings', 'combat_intense_high_strings', 'combat_light_low_strings', 'combat_light_high_strings'],
  },
} as {[key: string]: {durationMs: number, tracks: string[]}};
const INTENSITY_DICTIONARY = {
  1: {
    theme: 'combat_light',
    tracks: [0],
  },
  2: {
    theme: 'combat_light',
    tracks: [1],
  },
  3: {
    theme: 'combat_light',
    tracks: [0, 1],
  },
  4: {
    theme: 'combat_intense',
    tracks: [0],
  },
  5: {
    theme: 'combat_intense',
    tracks: [0, 2],
  },
  6: {
    theme: 'combat_intense',
    tracks: [0, 1, 2],
  },
  7: {
    theme: 'combat_intense',
    tracks: [0, 2, 3],
  },
  8: {
    theme: 'combat_intense',
    tracks: [0, 1, 2, 3],
  },
} as {[key: number]: {theme: string, tracks: number[]}};

type GainNode = any;
type SourceNode = any;
interface nodeSet {
  source: SourceNode;
  gain: GainNode;
};

export interface AudioStateProps {
  audio: AudioState;
  settings: SettingsType;
}

export interface AudioDispatchProps {
  disableAudio: () => void;
}

export interface AudioProps extends AudioStateProps, AudioDispatchProps {}

export default class Audio extends React.Component<AudioProps, {}> {
  private buffers: {
    [key: string]: AudioBuffer;
  };
  private ctx: AudioContext;
  private enabled: boolean;
  private paused: boolean;
  private loaded: null | 'LOADING' | 'LOADED';
  private lastTimestamp: number;
  private currentMusicTheme: string;
  private currentMusicTracks: number[];
  private musicNodes: nodeSet[];
  private musicTimeout: any;

  constructor(props: AudioProps) {
    super(props);
    this.buffers = {};
    this.lastTimestamp = 0;
    this.currentMusicTheme = null;
    this.currentMusicTracks = null;
    this.musicNodes = [] as nodeSet[];
    this.paused = false;
    this.enabled = props.settings.audioEnabled;

    try {
      this.ctx = new (getWindow().AudioContext as any || getWindow().webkitAudioContext as any)();
      if (this.enabled) {
        this.loadFiles();
      }
    } catch(err) {
      if (this.enabled) {
        props.disableAudio();
      }
      logEvent('web_audio_api_err', { label: err });
      console.log('Web Audio API is not supported in this browser');
    }
  }

  // This will fire many times without any audio-related changes since it subscribes to settings
  // So we have to be careful in checking that it's actually an audio-related change,
  // And not a different event that contains valid-looking (but identical) audio info
  componentWillReceiveProps(nextProps: any) {
    if (this.enabled !== nextProps.settings.audioEnabled) {
      if (nextProps.settings.audioEnabled) {
        this.enabled = true;
        this.resumeMusic();
        this.loadFiles();
      } else {
        this.pauseMusic();
        this.enabled = false;
      }
    }

    // AUDIO COMMANDS. Ignore if old or duplicate (aka from going back, or settings change)
    if (nextProps.audio.timestamp <= this.lastTimestamp + AUDIO_COMMAND_DEBOUNCE_MS) {
      return;
    }
    this.lastTimestamp = nextProps.audio.timestamp;

    if (this.paused !== nextProps.audio.paused) {
      if (nextProps.audio.paused) {
        this.pauseMusic();
      } else {
        this.resumeMusic();
      }
    }

    if (!this.enabled) {
      return console.log('Skipping playing audio, audio currently disabled.');
    }

    if (this.paused) {
      return console.log('Skipping playing audio, audio currently paused.');
    }

    if (!this.ctx) {
      return console.log('Skipping playing audio, audio context failed to initialize.');
    }

    if (nextProps.audio.sfx !== null) {
      this.playFileOnce(nextProps.audio.sfx);
    }

    if (this.props.audio.intensity !== nextProps.audio.intensity) {
    // TODO v2: be intelligent about the theme divide, ie don't completely halt everything / restart all music
    // when going from 11-12 or 12-11... but what to do instead, that wouldn't just punt the problem to 10/13?
      const newMusic = INTENSITY_DICTIONARY[nextProps.audio.intensity];
      if (newMusic) {
        if (newMusic.theme === this.currentMusicTheme) {
          this.updateExistingTheme(newMusic.tracks);
        } else {
          this.playNewMusicTheme(newMusic.theme, newMusic.tracks);
        }
      } else { // fades out if intensity if there is no entry, including for intensity = 0
        this.currentMusicTheme = null;
        this.currentMusicTracks = null;
        this.fadeOutMusic();
      }
    }
  }

  private loadFiles(): void {
// TODO async load max 4 at a time and update this.loaded = 'LOADED' on complete
    if (!this.loaded) {
      this.loaded = 'LOADING';
      const musicFiles = Object.keys(MUSIC_DICTIONARY).reduce((accumulator: string[], theme: string) => {
        return accumulator.concat(MUSIC_DICTIONARY[theme].tracks);
      }, []);
      [...SFX_FILES, ...musicFiles].forEach((file: string) => {
        loadAudioLocalFile(this.ctx, 'audio/' + file + '.mp3', (err: string, buffer: any) => {
          if (err) {
            return console.log('Error loading audio file: ' + file);
          }
          this.buffers[file] = buffer;
        });
      });
    }
  }

  private playFileOnce(file: string, initialVolume: number = 1, fadeIn: boolean = false): nodeSet {
    if (!this.buffers[file]) {
      console.log('Skipping playing audio ' + file + ', not loaded yet.');
      return null;
    }
    const gain = this.ctx.createGain();
    gain.connect(this.ctx.destination);
    gain.gain.setValueAtTime(initialVolume, this.ctx.currentTime);
    if (fadeIn) {
      gain.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + MUSIC_FADE_SECONDS);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers[file];
    source.connect(gain);
    source.start = source.start || (source as SourceNode).noteOn; // polyfill for old browsers
    source.start(0);
    return {source, gain};
  }

  // Starts the music from scratch with a new theme + track set, fading out any existing music
  // If no theme or tracks specified, uses existing music (for example, resuming from a pause)
  private playNewMusicTheme(theme: string = this.currentMusicTheme, tracks: number[] = this.currentMusicTracks) {
    this.fadeOutMusic();
    this.currentMusicTheme = theme;
    this.currentMusicTracks = tracks;
    this.loopTheme(true);
  }

  // Kick off a copy of the existing music theme + tracks
  // Doesn't stop the current music nodes (lets them stop naturally for reverb)
  private loopTheme(newTheme: boolean = false) {
    if (!this.enabled) {
      return console.log('Skipping playing music, audio currently disabled.');
    }

    if (this.paused) {
      return console.log('Skipping playing music, audio currently paused.');
    }

    if (!this.currentMusicTheme || !this.currentMusicTracks) {
      return console.log('Skipping playing music, no theme or track specified.');
    }

    MUSIC_DICTIONARY[this.currentMusicTheme].tracks.forEach((track: string, index: number) => {
      const active = this.currentMusicTracks.indexOf(index) !== -1;
      // Start all tracks at 0 volume, and fade them in to 1 if they're active
      this.musicNodes[index] = this.playFileOnce(track, newTheme ? 0 : 1, active);
    });

    this.musicTimeout = setTimeout(() => {
      this.loopTheme();
    }, MUSIC_DICTIONARY[this.currentMusicTheme].durationMs);
  }

  // Fade in / out tracks on the current theme for a smooth change in intensity
  private updateExistingTheme(newTracks: number[]) {
    this.musicNodes.forEach((nodes: nodeSet, track: number) => {
      if (nodes === null) {
        return;
      }
      if (newTracks.indexOf(track) !== -1 && this.currentMusicTracks.indexOf(track) === -1) {
        nodes.gain.gain.setValueAtTime(0, this.ctx.currentTime);
        nodes.gain.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + MUSIC_FADE_SECONDS); // Fade in
      } else if (newTracks.indexOf(track) === -1 && this.currentMusicTracks.indexOf(track) !== -1) {
        nodes.gain.gain.setValueAtTime(1, this.ctx.currentTime);
        nodes.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + MUSIC_FADE_SECONDS); // Fade out
      }
      // Else, it's already playing + should be, or not currently playing and shouldn't be
    });
    this.currentMusicTracks = newTracks;
  }

  private fadeOutMusic() {
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
    for (let i = 0; i < this.musicNodes.length; i++) {
      const track = this.musicNodes[i];
      if (track.source.playbackState === track.source.PLAYING_STATE) {
        track.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + MUSIC_FADE_SECONDS); // Fade out
        track.source.stop = track.source.stop || track.source.noteOff; // polyfill for old browsers
        track.source.stop(this.ctx.currentTime + MUSIC_FADE_SECONDS);
      }
    }
  }

  // TODO v2 nicer (albeit more complicated & bug prone) implementation would be to save the current spot in the audio
  // By keeping track of currentTime https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime
  // And then resume playing the audio (and resume the timeout) from the previous spot (fading in from the end of fade out)
  // by passing in an offset to start() - https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start
  private pauseMusic() {
    this.paused = true;
    this.fadeOutMusic();
  }

  private resumeMusic() {
    this.paused = false;
    this.playNewMusicTheme();
  }

  render(): JSX.Element {
    return null;
  }
}
