import * as React from 'react';
import {AUDIO_COMMAND_DEBOUNCE_MS, INIT_DELAY, MUSIC_INTENSITY_MAX} from '../../Constants';
import {AudioLoadingType, AudioState, CardName, CardPhase} from '../../reducers/StateTypes';
const eachLimit = require('async/eachLimit');
const seedrandom = require('seedrandom');

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

const INTENSITY_DECREMENT_CHANCE = 0.18;
const INTENSITY_INCREMENT_CHANCE = 0.2;
const INSTRUMENT_DECREMENT_CHANCE = 0.2;
const INSTRUMENT_DECREMENT_DOUBLE_CHANCE = 0.15;
const MUSIC_FADE_SECONDS = 1.5;
const MUSIC_FADE_LONG_SECONDS = 3.5; // for fade outs, such as the end of combat
const MUSIC_DEFINITIONS = {
  combat: {
    heavy: {
      baselineInstruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings'],
      bpm: 140,
      directory: 'combat/heavy/',
      instruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings', 'HighBrass'],
      loopMs: 13712,
      maxIntensity: MUSIC_INTENSITY_MAX,
      minIntensity: 12,
      peakingInstrument: 'HighBrass',
      variants: 6,
    },
    light: {
      // peakingInstrument always at the end
      baselineInstruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings'],
      bpm: 120,
      directory: 'combat/light/',
      instruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings', 'HighBrass'],
      loopMs: 8000,
      maxIntensity: 24,
      minIntensity: 0,
      peakingInstrument: 'HighBrass',
      variants: 12,
    },
  },
} as {[key: string]: {[key: string]: MusicDefinition}};
interface MusicDefinition {
  baselineInstruments: string[];
  bpm: number;
  directory: string;
  instruments: string[];
  loopMs: number;
  maxIntensity: number;
  minIntensity: number;
  peakingInstrument: string;
  variants: number;
}

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

export interface StateProps {
  themeManager: ThemeManager|null;
  audioContext: AudioContext|null;
  audio: AudioState;
  cardName: CardName;
  cardPhase: CardPhase|null;
  enabled: boolean;
}

export interface DispatchProps {
  disableAudio: () => void;
  loadAudio: (context: AudioContext, url: string, callback: (err: Error|null, ns: NodeSet|null) => void) => void;
  onLoadChange: (loaded: AudioLoadingType, results?: {[file: string]: NodeSet}) => void;
}

interface Props extends StateProps, DispatchProps {}

type GainNode = any;
type SourceNode = any;
export class NodeSet {
  private context: AudioContext;
  private buffer: AudioBuffer;
  private gain: GainNode;
  private source: SourceNode;

  constructor(audioContext: AudioContext, buffer: AudioBuffer) {
    this.buffer = buffer;
    this.context = audioContext;
  }

  public playOnce(initialVolume: number = 1, fadeInVolume: number = 0) {
    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);
    this.gain.gain.setValueAtTime(initialVolume, this.context.currentTime);
    if (fadeInVolume) {
      this.fadeIn(fadeInVolume);
    }
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gain);
    this.source.start = this.source.start || (this.source as SourceNode).noteOn; // polyfill for old browsers
    this.source.start(0);
  }

  public fadeIn(peak?: number, seconds?: number) {
    this.gain.gain.linearRampToValueAtTime(peak || 1.0, this.context.currentTime + (seconds || MUSIC_FADE_SECONDS));
  }

  public fadeOut(seconds?: number, stop?: boolean) {
    if (seconds === undefined) {
      seconds = MUSIC_FADE_SECONDS;
    }
    this.gain.gain.linearRampToValueAtTime(0, this.context.currentTime + seconds);
    if (stop) {
      this.source.stop = this.source.stop || this.source.noteOff; // polyfill for old browsers
      try {
        this.source.stop(this.context.currentTime + seconds);
      } catch (err) { // polyfill for iOS
        this.gain.disconnect();
      }
    }
  }

  public hasGain(): boolean {
    return Boolean(this.gain);
  }

  public getVolume(): number|null {
    if (!this.hasGain()) {
      return null;
    }
    return this.gain.gain.value;
  }

  public isPlaying(): boolean {
    return Boolean(this.source) && this.source.playbackState === this.source.PLAYING_STATE;
  }
}

export class ThemeManager {
  private nodes: {
    [key: string]: NodeSet;
  };
  private tracks: number[];

  private intensity: number;
  private peakIntensity: number;
  private paused: boolean;
  private theme: MusicDefinition|null;
  private timeout: any;
  private rng: () => number;

  constructor(nodes: {[key:string]: NodeSet}, rng: () => number) {
    this.nodes = nodes;
    this.rng = rng;
    this.theme = null;
    this.active = [];
    this.paused = false;
  }

  // TODO v2 a nicer, albeit more complicated & bug prone, implementation would be to save the current spot in the audio
  // By keeping track of currentTime https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime
  // And then resume playing the audio (and resume the timeout) from the previous spot (fading in from the end of fade out)
  // by passing in an offset to start() - https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start
  public pause() {
    this.paused = true;
    this.fadeOut();
  }
  private fadeOut() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    for (const i of this.active) {
      if (i.isPlaying()) {
        i.fadeOut((this.intensity > 0) ? MUSIC_FADE_SECONDS : MUSIC_FADE_LONG_SECONDS, true);
      }
    }
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public setIntensity(intensity: number, peak: number) {
    intensity = Math.round(Math.min(MUSIC_INTENSITY_MAX, Math.max(0, intensity)));
    if (intensity !== this.intensity) {
      this.playAtIntensity(intensity);
    }
    if (peak !== this.peakIntensity) {
      const peakNode = this.nodes[this.active[this.active.length - 1]];
      if (peakNode && peakNode.hasGain()) {
        if (peak > 0) {
          peakNode.fadeIn(peak);
        } else {
          peakNode.fadeOut();
        }
      }
    }
  }

  // Starts the music from scratch with a new theme, fading out any existing music
  // If no theme specified, uses existing music (for example, resuming from a pause)
  private startTheme(theme: MusicDefinition|null = this.theme) {
    this.fadeOut();
    this.theme = theme;
    this.loopTheme(true);
  }

  public resume() {
    this.paused = false;
    this.startTheme();
  }

  private playAtIntensity(newIntensity: number) {
    const old = this.intensity;
    this.intensity = newIntensity;
    if (newIntensity === 0) {
      this.theme = null;
      this.active = [];
      this.fadeOut();
    } else if (this.theme === null || old === 0) {
      // Starting from silence, immediately start the theme
      if (newIntensity <= 18) {
        console.log('starting light theme');
        this.startTheme(MUSIC_DEFINITIONS.combat.light);
      } else {
        console.log('starting heavy theme');
        this.startTheme(MUSIC_DEFINITIONS.combat.heavy);
      }
    } else {
      // Shift in existing music; theme transitions happen immediately; shifts happen next loop
      if (newIntensity > this.theme.maxIntensity) {
        this.startTheme(MUSIC_DEFINITIONS.combat.heavy);
      } else if (newIntensity < this.theme.minIntensity) {
        this.startTheme(MUSIC_DEFINITIONS.combat.light);
      } else {
        this.updateTheme(newIntensity - old);
      }
    }
  }

  private generateIntensity(): number {
    let result = Math.ceil((this.intensity - this.theme.minIntensity) / (this.theme.maxIntensity - this.theme.minIntensity) * this.theme.variants);
    if (this.rng() < INTENSITY_DECREMENT_CHANCE && result > 1) {
      result--;
    } else if (this.rng() < INTENSITY_INCREMENT_CHANCE && result < theme.variants) {
      result++;
    }
    return result;
  }

  private generateTracks(): string[] {
    const skipped = [Math.floor(this.rng() * this.theme.baselineInstruments.length)];
    if (this.rng() < INSTRUMENT_DECREMENT_CHANCE) {
      // randomly play one less instrument
      skipped.push(Math.floor(this.rng() * this.theme.baselineInstruments.length));
    } else if (this.rng() < INSTRUMENT_DECREMENT_DOUBLE_CHANCE) {
      // randomly play up to two fewer instruments
      skipped.push(Math.floor(this.rng() * this.theme.baselineInstruments.length));
      skipped.push(Math.floor(this.rng() * this.theme.baselineInstruments.length));
    }
    return this.theme.baselineInstruments.map((instrument: string, i: number) => {
      return i;
    }).filter((i: number) => {
      return skipped.indexOf(i) === -1;
    });
  }

  // Kick off a copy of the existing music theme
  // Doesn't stop the current music nodes (lets them stop naturally for reverb)
  private loopTheme(newTheme: boolean = false) {
    if (this.paused) {
      return console.log('Skipping music (paused)');
    }
    if (!this.theme) {
      return this.playAtIntensity(this.intensity);
    }

    this.active = this.generateTracks();
    this.theme.instruments.forEach((instrument: string, i: number) => {
      const active = (this.active.indexOf(i) !== -1 || this.peakIntensity > 0);
      let initialVolume = (newTheme || !active) ? 0 : 1;
      let targetVolume = active ? 1 : 0;

      if (this.peakIntensity > 0 && instrument === this.theme.peakingInstrument) {
        targetVolume = this.peakIntensity;
        if (this.active[i] && this.nodes[this.active[i]].hasGain()) {
          initialVolume = this.nodes[this.active[i]].getVolume() || 0;
        }
      }
      // Start all tracks at 0 volume, and fade them in to 1 if they're active
      const file = this.theme.directory + instrument + this.generateIntensity();
      if (!this.nodes[file]) {
        console.log('Skipping playing audio ' + file + ', not loaded yet.');
      } else {
        this.nodes[file].playOnce(initialVolume, targetVolume);
      }
    });

    this.timeout = setTimeout(() => {
      this.loopTheme();
    }, this.theme.loopMs);
  }

  // Fade in / out tracks on the current theme for a smoother + more immediate change in intensity
  private updateTheme(intensityDelta: number) {
    const theme = this.theme;
    if (theme === null) {
      return;
    }

    if (intensityDelta > 0) {
      // Fade in one active baseline track randomly
      const fadeInInstruments = theme.baselineInstruments.map((instrument: string, i: number) => {
        return i;
      }).filter((i: number) => {
        return this.active.indexOf(i) === -1;
      });
      if (fadeInInstruments && fadeInInstruments[0] !== null && this.active[fadeInInstruments[0]]) {
        const nodes = this.active[fadeInInstruments[0]];
        nodes.fadeIn();
        this.active = this.active.concat(fadeInInstruments[0]);
      }
    } else if (intensityDelta < 0 && this.active.length > 1) {
      // Fade out of one inactive baseline track randomly
      const fadeOutInstruments = theme.baselineInstruments.map((instrument: string, i: number) => {
        return i;
      }).filter((i: number) => {
        return this.active.indexOf(i) !== -1;
      });
      if (fadeOutInstruments && fadeOutInstruments[0] !== null && this.active[fadeOutInstruments[0]]) {
        this.nodes[this.active[fadeOutInstruments[0]]].fadeOut();
        this.active = this.active.splice(fadeOutInstruments[0], 1);
      }
    }
  }
}

export default class Audio extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    if (props.audioContext !== null) {
      if (props.enabled) {
        // Load after a timeout so as not to overload the device.
        setTimeout(() => {
          this.getThemeManager().catch(console.error);
        }, INIT_DELAY.LOAD_AUDIO_MILLIS);
      }
    } else {
      if (props.enabled) {
        props.disableAudio();
      }
    }
  }

  // This will fire many times without any audio-related changes since it subscribes to settings
  // So we have to be careful in checking that it's actually an audio-related change,
  // And not a different event that contains valid-looking (but identical) audio info
  public componentWillReceiveProps(nextProps: Partial<Props>) {
    console.log('receivedprops');
    if (!nextProps.audio) {
      return;
    }

    if (this.props.enabled !== nextProps.enabled) {
      if (nextProps.enabled) {
        return this.getThemeManager().then(() => {
          this.props.themeManager.setIntensity(nextProps.audio.intensity);
        }).catch(console.error);
      } else {
        this.props.themeManager.pause();
      }
    }

    if (!nextProps.enabled) {
      return console.log('Skipping audio (disabled)');
    }

    // Ignore if old or duplicate (aka from going back, or settings change)
    if (AUDIO_COMMAND_DEBOUNCE_MS > Math.abs(nextProps.audio.timestamp - this.props.audio.timestamp)) {
      return console.log('Audio debounced');
    }

    if (!this.props.themeManager) {
      return console.log('ThemeManager uninitialized; skipping');
    }

    if (this.props.themeManager.isPaused() !== nextProps.audio.paused) {
      if (nextProps.audio.paused) {
        this.props.themeManager.pause();
        return;
      } else {
        this.props.themeManager.resume();
      }
    }

    if (this.props.themeManager.isPaused()) {
      return console.log('Skipping playing audio, audio currently paused.');
    }

    // If we're outside of combat, pause music
    if (nextProps.cardName !== 'QUEST_CARD' || nextProps.cardPhase === null || nextProps.cardPhase === 'ROLEPLAY') {
      console.log('Pausing music (outside of combat)');
      return this.props.themeManager.pause();
    }
    if (!nextProps.audioContext) {
      return console.log('Skipping playing audio, audio context failed to initialize.');
    }
    this.props.themeManager.setIntensity(nextProps.audio.intensity);
  }

  private getThemeManager(): Promise<void> {
    if (this.props.themeManager) {
      return Promise.fulfill();
    }
    const ac = this.props.audioContext;
    if (!ac || this.props.audio.loaded !== 'UNLOADED') {
      return;
    }
    return new Promise((fulfill, reject) => {
      this.props.onLoadChange('LOADING');
      const musicFiles = getAllMusicFiles();
      // TODO: eachLimit
      const nodes: {[key: string]: NodeSet} = {};
      for (let file of musicFiles) {
        this.props.loadAudio(ac, 'audio/' + file + '.mp3', (err: Error|null, ns: NodeSet) => {
          if (err) {
            this.props.onLoadChange('ERROR');
            reject(new Error('Error loading audio file: ' + file));
          }
          nodes[file] = ns;
        });
      }
      this.props.onLoadChange('LOADED', nodes);
      fulfill();
    });
  }

  public render(): JSX.Element|null {
    return null;
  }
}
