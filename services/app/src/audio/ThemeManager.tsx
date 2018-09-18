import {MUSIC_DEFINITIONS, MUSIC_FADE_SECONDS, MUSIC_INTENSITY_MAX, MusicDefinition} from '../Constants';
import {AudioNode} from './AudioNode';

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

const MUSIC_FADE_LONG_SECONDS = 3.5; // for fade outs, such as the end of combat

const LOW_INTENSITY = 18;

export class ThemeManager {
  private nodes: {
    [key: string]: AudioNode;
  };
  private active: string[];

  private intensity: number;
  private peakIntensity: number;
  private paused: boolean;
  private theme: MusicDefinition|null;
  private timeout: any;
  private rng: () => number;

  constructor(nodes: {[key: string]: AudioNode}, rng: () => number) {
    this.nodes = nodes;
    this.active = [];
    for (const k of Object.keys(this.nodes)) {
      if (this.nodes[k].isPlaying()) {
        this.active.push(k);
      }
    }
    this.rng = rng;
    this.theme = null;
    this.paused = false;
  }

  // TODO v2 a nicer, albeit more complicated & bug prone, implementation would be to save the current spot in the audio
  // By keeping track of currentTime https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime
  // And then resume playing the audio (and resume the timeout) from the previous spot (fading in from the end of fade out)
  // by passing in an offset to start() - https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start
  public pause() {
    if (this.paused) {
      return;
    }
    this.paused = true;
    this.fadeOut();
  }
  private fadeOut() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    for (const i of this.active) {
      if (this.nodes[i] && this.nodes[i].isPlaying()) {
        this.nodes[i].fadeOut((this.intensity > 0) ? MUSIC_FADE_SECONDS : MUSIC_FADE_LONG_SECONDS, true);
      }
    }
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public setIntensity(intensity: number, peak?: number) {
    intensity = Math.round(Math.min(MUSIC_INTENSITY_MAX, Math.max(0, intensity)));
    if (intensity !== this.intensity) {
      this.playAtIntensity(intensity);
    }
    if (peak !== this.peakIntensity) {
      const peakNode = this.nodes[this.active[this.active.length - 1]];
      if (peakNode) {
        console.log(Boolean(peak));
        if (Boolean(peak)) {
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
    if (!this.paused) {
      return;
    }
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
      if (newIntensity <= LOW_INTENSITY) {
        console.log('starting light theme');
        this.startTheme(MUSIC_DEFINITIONS.combat.light);
      } else {
        console.log('starting heavy theme');
        this.startTheme(MUSIC_DEFINITIONS.combat.heavy);
      }
    } else {
      console.log('shift');
      console.log(this.theme.maxIntensity);
      // Shift in existing music; theme transitions happen immediately; shifts happen next loop
      if (newIntensity > this.theme.maxIntensity) {
        console.log('starting heavy theme');
        this.startTheme(MUSIC_DEFINITIONS.combat.heavy);
      } else if (newIntensity < this.theme.minIntensity) {
        this.startTheme(MUSIC_DEFINITIONS.combat.light);
      } else {
        this.updateTheme(newIntensity - old);
      }
    }
  }

  private generateIntensity(): number {
    const theme = this.theme;
    if (!theme) {
      return 0;
    }
    let result = Math.ceil((this.intensity - theme.minIntensity) / (theme.maxIntensity - theme.minIntensity) * theme.variants);
    if (this.rng() < INTENSITY_DECREMENT_CHANCE && result > 1) {
      result--;
    } else if (this.rng() < INTENSITY_INCREMENT_CHANCE && result < theme.variants) {
      result++;
    }
    return result;
  }

  private generateTracks(): string[] {
    const theme = this.theme;
    if (!theme) {
      return [];
    }
    const skipped = [Math.floor(this.rng() * theme.baselineInstruments.length)];
    if (this.rng() < INSTRUMENT_DECREMENT_CHANCE) {
      // randomly play one less instrument
      skipped.push(Math.floor(this.rng() * theme.baselineInstruments.length));
    } else if (this.rng() < INSTRUMENT_DECREMENT_DOUBLE_CHANCE) {
      // randomly play up to two fewer instruments
      skipped.push(Math.floor(this.rng() * theme.baselineInstruments.length));
      skipped.push(Math.floor(this.rng() * theme.baselineInstruments.length));
    }
    return theme.baselineInstruments.filter((_, i: number) => {
      return skipped.indexOf(i) === -1;
    }).map((i: string) => {
      const v = 1 + Math.floor(Math.random() * theme.variants);
      return `combat/${(this.intensity <= LOW_INTENSITY) ? 'light' : 'heavy'}/${i}${v}`; // e.g. combat/light/HighBrass4
    });
  }

  // Kick off a copy of the existing music theme
  // Doesn't stop the current music nodes (lets them stop naturally for reverb)
  private loopTheme(newTheme: boolean = false) {
    if (this.paused) {
      return console.log('Skipping music (paused)');
    }
    const theme = this.theme;
    if (!theme) {
      return this.playAtIntensity(this.intensity);
    }

    this.active = this.generateTracks();
    theme.instruments.forEach((instrument: string, i: number) => {
      const active = (this.active.indexOf(instrument) !== -1 || this.peakIntensity > 0);
      let initialVolume = (newTheme || !active) ? 0 : 1;
      let targetVolume = active ? 1 : 0;

      if (this.peakIntensity > 0 && instrument === theme.peakingInstrument) {
        targetVolume = this.peakIntensity;
        if (this.active[i] && this.nodes[this.active[i]].hasGain()) {
          initialVolume = this.nodes[this.active[i]].getVolume() || 0;
        }
      }
      // Start all tracks at 0 volume, and fade them in to 1 if they're active
      const file = theme.directory + instrument + this.generateIntensity();
      if (!this.nodes[file]) {
        console.log('Skipping playing audio ' + file + ', not loaded yet.');
      } else {
        this.nodes[file].playOnce(initialVolume, targetVolume);
      }
    });

    this.timeout = setTimeout(() => {
      this.loopTheme();
    }, theme.loopMs);
  }

  // Fade in / out tracks on the current theme for a smoother + more immediate change in intensity
  private updateTheme(intensityDelta: number) {
    const theme = this.theme;
    if (theme === null) {
      return;
    }

    if (intensityDelta > 0) {
      // Fade in one active baseline track randomly
      const fadeInInstruments = theme.baselineInstruments.map((i: string) => {
        return i;
      }).filter((i: string) => {
        return this.active.indexOf(i) === -1;
      });
      if (fadeInInstruments && fadeInInstruments[0] !== null && this.nodes[fadeInInstruments[0]]) {
        const nodes = this.nodes[fadeInInstruments[0]];
        nodes.fadeIn();
        this.active = this.active.concat(fadeInInstruments[0]);
      }
    } else if (intensityDelta < 0 && this.active.length > 1) {
      // Fade out of one inactive baseline track randomly
      const fadeOutIdxs = theme.baselineInstruments.filter((i: string) => {
        return this.active.indexOf(i) !== -1;
      }).map((_, i: number) => {
        return i;
      });
      if (fadeOutIdxs && fadeOutIdxs[0] !== null && this.nodes[fadeOutIdxs[0]]) {
        this.nodes[this.active[fadeOutIdxs[0]]].fadeOut();
        this.active = this.active.splice(fadeOutIdxs[0], 1);
      }
    }
  }
}
