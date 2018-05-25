import * as React from 'react'
import {loadAudioLocalFile} from '../../actions/Audio'
import {AudioLoadingType, AudioState, CardName, CardPhase} from '../../reducers/StateTypes'
import {getWindow} from '../../Globals'
import {logEvent} from '../../Main'
import {AUDIO_COMMAND_DEBOUNCE_MS, MUSIC_INTENSITY_MAX} from '../../Constants'
const eachLimit = require('async/eachLimit');

/* Notes on audio implementation:
- intensity (0-MUSIC_INTENSITY_MAX) used as baseline for combat situation, and changes slowly (mostly on loop reset).
  User hears as different tracks on the four baseline instruments (drums, low strings, low brass, high strings)
- peak intensity (0-1) used for quick changes, such as the timer.
  User hears as the matching high brass track.
- some people say that exponentialRampToValueAtTime sounds better than linear ramping;
  after several experiments, I've decided it actually sounds worse for our use case.
- music files are purposefully longer than their listed loopMs, so that they have time
  to wrap up their echoes / reverbs
- audio.enabled only changes from detecting incompatibility, or user changing the setting
  and so behaves like an all-stop since it's unlikely to be turned back on that session
  - for example, if this is initialized with audio disabled, it does not load audio files -
    but, if you turn on audio later in the session, it'll download them at that time
- audio.paused may change at any time (such as minimizing / returning to the tab),
  so it behaves like pause / resume
*/

const MUSIC_FADE_SECONDS = 1.5;
const MUSIC_FADE_LONG_SECONDS = 3.5; // for fade outs, such as the end of combat
const MUSIC_DEFINITIONS = {
  combat: {
    light: {
      bpm: 120,
      directory: 'combat/light/',
      // peakingInstrument always at the end
      instruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings', 'HighBrass'],
      baselineInstruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings'],
      peakingInstrument: 'HighBrass',
      loopMs: 8000,
      minIntensity: 0,
      maxIntensity: 24,
      variants: 12,
    },
    heavy: {
      bpm: 140,
      directory: 'combat/heavy/',
      instruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings', 'HighBrass'],
      baselineInstruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings'],
      peakingInstrument: 'HighBrass',
      loopMs: 13712,
      minIntensity: 12,
      maxIntensity: MUSIC_INTENSITY_MAX,
      variants: 6,
    },
  },
} as {[key: string]: {[key: string]: MusicDefinition}};
interface MusicDefinition {
  bpm: number,
  directory: string,
  instruments: string[],
  baselineInstruments: string[],
  peakingInstrument: string,
  loopMs: number,
  minIntensity: number,
  maxIntensity: number,
  variants: number,
};
type GainNode = any;
type SourceNode = any;
interface NodeSet {
  source: SourceNode;
  gain: GainNode;
};

export interface AudioStateProps {
  audio: AudioState;
  cardName: CardName;
  cardPhase: CardPhase|null;
  enabled: boolean;
}

export interface AudioDispatchProps {
  disableAudio: () => void;
  onLoadChange: (loaded: AudioLoadingType) => void;
}

export interface AudioProps extends AudioStateProps, AudioDispatchProps {}

export default class Audio extends React.Component<AudioProps, {}> {
  private buffers: {
    [key: string]: AudioBuffer;
  };
  private ctx: AudioContext;
  private intensity: number;
  private paused: boolean;
  private currentMusicTheme: MusicDefinition|null;
  private currentMusicTracks: number[];
  private musicNodes: NodeSet[];
  private musicTimeout: any;

  constructor(props: AudioProps) {
    super(props);
    this.buffers = {};
    this.currentMusicTheme = null;
    this.currentMusicTracks = [];
    this.musicNodes = [] as NodeSet[];
    this.paused = false;

    try {
      this.ctx = new (getWindow().AudioContext as any || getWindow().webkitAudioContext as any)();
      if (props.enabled) {
        setTimeout(() => this.loadFiles(), 2000);
      }
    } catch(err) {
      if (props.enabled) {
        props.disableAudio();
      }
      logEvent('web_audio_api_err', { label: err });
      console.log('Web Audio API is not supported in this browser');
    }
  }

  // This will fire many times without any audio-related changes since it subscribes to settings
  // So we have to be careful in checking that it's actually an audio-related change,
  // And not a different event that contains valid-looking (but identical) audio info
  componentWillReceiveProps(nextProps: Partial<AudioProps>) {
    if (!nextProps.audio) {
      return;
    }

    const newIntensity = Math.round(Math.min(MUSIC_INTENSITY_MAX, Math.max(0, nextProps.audio.intensity)));

    if (this.props.enabled !== nextProps.enabled) {
      if (nextProps.enabled) {
        this.loadFiles();
        this.paused = false;
        this.playAtIntensity(newIntensity);
      } else {
        this.pauseMusic();
      }
    }

    if (!nextProps.enabled) {
      // Go no further, but keep track of intensity in case they re-enable mid-combat
      this.intensity = newIntensity;
      return console.log('Skipping playing audio, audio currently disabled.');
    }

    // AUDIO COMMANDS. Ignore if old or duplicate (aka from going back, or settings change)
    if (AUDIO_COMMAND_DEBOUNCE_MS > Math.abs(nextProps.audio.timestamp - this.props.audio.timestamp)) {
      return;
    }

    if (this.paused !== nextProps.audio.paused) {
      if (nextProps.audio.paused) {
        this.pauseMusic();
      } else {
        this.resumeMusic();
      }
    }

    // If we're outside of combat, pause music
    if (!this.paused && (nextProps.cardName !== 'QUEST_CARD' || nextProps.cardPhase === null || nextProps.cardPhase === 'ROLEPLAY')) {
      this.pauseMusic();
    }

    if (this.paused) {
      return console.log('Skipping playing audio, audio currently paused.');
    }

    if (!this.ctx) {
      return console.log('Skipping playing audio, audio context failed to initialize.');
    }

    if (nextProps.audio.sfx !== null) {
      this.playFileOnce('sfx/' + nextProps.audio.sfx);
    }

    // MUSIC-SPECIFIC COMMANDS.
    const oldIntensity = this.props.audio.intensity;
    if (newIntensity !== oldIntensity) {
      this.playAtIntensity(newIntensity, oldIntensity);
    }

    const newPeak = nextProps.audio.peakIntensity;
    if (newPeak !== this.props.audio.peakIntensity) {
      const peakNode = this.musicNodes[this.musicNodes.length - 1];
      if (peakNode && peakNode.gain) {
        if (newPeak > 0) {
          peakNode.gain.gain.linearRampToValueAtTime(newPeak, this.ctx.currentTime + MUSIC_FADE_SECONDS); // Fade in
        } else {
          peakNode.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + MUSIC_FADE_SECONDS); // Fade out
        }
      }
    }
  }

  private playAtIntensity(newIntensity: number, oldIntensity = 0) {
    this.intensity = newIntensity;
    if (newIntensity === 0) {
      // fade out
      this.currentMusicTheme = null;
      this.currentMusicTracks = [];
      this.fadeOutMusic();
    } else if (this.currentMusicTheme === null || oldIntensity === 0) {
      // Starting from silence, immediately start the theme
      if (newIntensity <= 18) {
        this.playNewMusicTheme(MUSIC_DEFINITIONS.combat.light);
      } else {
        this.playNewMusicTheme(MUSIC_DEFINITIONS.combat.heavy);
      }
    } else {
      // Shift in existing music; theme transitions happen immediately; shifts happen next loop
      if (newIntensity > this.currentMusicTheme.maxIntensity) {
        this.playNewMusicTheme(MUSIC_DEFINITIONS.combat.heavy);
      } else if (newIntensity < this.currentMusicTheme.minIntensity) {
        this.playNewMusicTheme(MUSIC_DEFINITIONS.combat.light);
      } else {
        this.updateExistingTheme(newIntensity - oldIntensity);
      }
    }
  }

  private loadFiles() {
    if (this.props.audio.loaded === 'UNLOADED') {
      this.props.onLoadChange('LOADING');
      const musicFiles = Object.keys(MUSIC_DEFINITIONS).reduce((list: string[], musicClass: string) => {
        return list.concat(Object.keys(MUSIC_DEFINITIONS[musicClass]).reduce((list: string[], musicWeight: string) => {
          const weight = MUSIC_DEFINITIONS[musicClass][musicWeight];
          for (let i = 0; i < weight.instruments.length; i++) {
            for (let v = 1; v <= weight.variants; v++) {
              list.push(`${musicClass}/${musicWeight}/${weight.instruments[i]}${v}`);
            }
          }
          return list;
        }, []));
      }, []);
      eachLimit(musicFiles, 4, (file: string, callback: (err?: Error) => void) => {
        loadAudioLocalFile(this.ctx, 'audio/' + file + '.mp3', (err: Error|null, buffer: any) => {
          if (err) {
            console.error('Error loading audio file: ' + file);
            return callback(err);
          }
          this.buffers[file] = buffer;
          return callback();
        });
      }, (err: Error) => {
        if (err) {
          console.error('Error loading audio files: ', err);
          this.props.onLoadChange('ERROR');
        } else {
          this.props.onLoadChange('LOADED');
          this.playAtIntensity(this.intensity);
        }
      });
    }
  }

  private playFileOnce(file: string, initialVolume: number = 1, fadeInVolume: number = 0): NodeSet|null {
    if (!this.buffers[file]) {
      console.log('Skipping playing audio ' + file + ', not loaded yet.');
      return null;
    }
    const gain = this.ctx.createGain();
    gain.connect(this.ctx.destination);
    gain.gain.setValueAtTime(initialVolume, this.ctx.currentTime);
    if (fadeInVolume) {
      gain.gain.linearRampToValueAtTime(fadeInVolume, this.ctx.currentTime + MUSIC_FADE_SECONDS);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers[file];
    source.connect(gain);
    source.start = source.start || (source as SourceNode).noteOn; // polyfill for old browsers
    source.start(0);
    return {source, gain};
  }

  // Starts the music from scratch with a new theme, fading out any existing music
  // If no theme specified, uses existing music (for example, resuming from a pause)
  private playNewMusicTheme(theme: MusicDefinition|null = this.currentMusicTheme) {
    this.fadeOutMusic();
    this.currentMusicTheme = theme;
    this.loopTheme(true);
  }

  // Kick off a copy of the existing music theme
  // Doesn't stop the current music nodes (lets them stop naturally for reverb)
  private loopTheme(newTheme: boolean = false) {
    if (this.paused) {
      return console.log('Skipping playing music, audio currently paused.');
    }

    if (!this.currentMusicTheme) {
      return this.playAtIntensity(this.intensity);
    }

    const theme = this.currentMusicTheme;
    let themeIntensity = Math.ceil((this.intensity - theme.minIntensity) / (theme.maxIntensity - theme.minIntensity) * theme.variants);
    const skippedInstruments = [Math.floor(Math.random() * theme.baselineInstruments.length)];

    if (Math.random() < 0.18 && themeIntensity > 1) {
      // randomly go a bit down in intensity
      themeIntensity--;
    } else if (Math.random() < 0.2 && themeIntensity < theme.variants) {
      // randomly go a bit up in intensity
      themeIntensity++;
    }

    if (Math.random() < 0.2) {
      // randomly play one less instrument
      skippedInstruments.push(Math.floor(Math.random() * theme.baselineInstruments.length));
    } else if (Math.random() < 0.15) {
      // randomly play up to two fewer instruments
      skippedInstruments.push(Math.floor(Math.random() * theme.baselineInstruments.length));
      skippedInstruments.push(Math.floor(Math.random() * theme.baselineInstruments.length));
    }
    this.currentMusicTracks = theme.baselineInstruments.map((instrument: string, i: number) => {
      return i;
    }).filter((i: number) => {
      return skippedInstruments.indexOf(i) === -1;
    });

    theme.instruments.forEach((instrument: string, i: number) => {
      const active = (this.currentMusicTracks.indexOf(i) !== -1 || this.props.audio.peakIntensity > 0);
      let initialVolume = (newTheme || !active) ? 0 : 1;
      let targetVolume = active ? 1 : 0;

      if (this.props.audio.peakIntensity > 0 && instrument === theme.peakingInstrument) {
        targetVolume = this.props.audio.peakIntensity;
        if (this.musicNodes[i] && this.musicNodes[i].gain) {
          initialVolume = this.musicNodes[i].gain.gain.value;
        }
      }
      // Start all tracks at 0 volume, and fade them in to 1 if they're active
      const newNode = this.playFileOnce(theme.directory + instrument + themeIntensity, initialVolume, targetVolume);
      if (newNode) {
        this.musicNodes[i] = newNode;
      }
    });
    this.musicTimeout = setTimeout(() => {
      this.loopTheme();
    }, this.currentMusicTheme.loopMs);
  }

  // Fade in / out tracks on the current theme for a smoother + more immediate change in intensity
  private updateExistingTheme(intensityDelta: number) {
    const theme = this.currentMusicTheme;
    if (theme === null) {
      return;
    }

    if (intensityDelta > 0) {
      // Fade in one active baseline track randomly
      const fadeInInstruments = theme.baselineInstruments.map((instrument: string, i: number) => {
        return i;
      }).filter((i: number) => {
        return this.currentMusicTracks.indexOf(i) === -1;
      });
      if (fadeInInstruments && fadeInInstruments[0] !== null && this.musicNodes[fadeInInstruments[0]]) {
        const nodes = this.musicNodes[fadeInInstruments[0]];
        nodes.gain.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + MUSIC_FADE_SECONDS); // Fade in
        this.currentMusicTracks = this.currentMusicTracks.concat(fadeInInstruments[0]);
      }
    } else if (intensityDelta < 0 && this.currentMusicTracks.length > 1) {
      // Fade out of one inactive baseline track randomly
      const fadeOutInstruments = theme.baselineInstruments.map((instrument: string, i: number) => {
        return i;
      }).filter((i: number) => {
        return this.currentMusicTracks.indexOf(i) !== -1;
      });
      if (fadeOutInstruments && fadeOutInstruments[0] !== null && this.musicNodes[fadeOutInstruments[0]]) {
        const nodes = this.musicNodes[fadeOutInstruments[0]];
        nodes.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + MUSIC_FADE_SECONDS); // Fade out
        this.currentMusicTracks = this.currentMusicTracks.splice(fadeOutInstruments[0], 1);
      }
    }
  }

  private fadeOutMusic() {
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
    const fadeSeconds = (this.intensity > 0) ? MUSIC_FADE_SECONDS : MUSIC_FADE_LONG_SECONDS;
    for (let i = 0; i < this.musicNodes.length; i++) {
      const track = this.musicNodes[i];
      if (track && track.source && track.source.playbackState === track.source.PLAYING_STATE) {
        track.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeSeconds); // Fade out
        track.source.stop = track.source.stop || track.source.noteOff; // polyfill for old browsers
        try {
          track.source.stop(this.ctx.currentTime + fadeSeconds);
        } catch (err) { // polyfill for iOS
          track.gain.disconnect();
        }
      }
    }
  }

  // TODO v2 a nicer, albeit more complicated & bug prone, implementation would be to save the current spot in the audio
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

  render(): JSX.Element|null {
    return null;
  }
}
