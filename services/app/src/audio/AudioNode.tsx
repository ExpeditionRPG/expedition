import {MUSIC_FADE_SECONDS} from '../Constants';

type GainNode = any;
type SourceNode = any;
export class AudioNode {
  private context: AudioContext;
  private buffer: AudioBuffer;
  private gain: GainNode|null;
  private source: SourceNode|null;

  constructor(audioContext: AudioContext, buffer: AudioBuffer) {
    this.buffer = buffer;
    this.context = audioContext;
    this.gain = null;
    this.source = null;
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

  public getVolume(): number|null {
    if (!this.gain) {
      return null;
    }
    return this.gain.gain.value;
  }

  public isPlaying(): boolean {
    return Boolean(this.source && this.source.playbackState === this.source.PLAYING_STATE);
  }
}
