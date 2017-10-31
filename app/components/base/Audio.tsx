import * as React from 'react'
import {loadAudioLocalFile} from '../../actions/Audio'
import {AudioState, SettingsType} from '../../reducers/StateTypes'
import {getWindow} from '../../Globals'
import {logEvent} from '../../Main'


const SFX_FILES = ['sfx_combat_defeat', 'sfx_combat_victory'];
const MUSIC_FILES = ['music_combat_intense_1'];
const MUSIC_FADE_SECONDS = 1.5;

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
  private loopFiles: string[];
  private loopFilesPaused: string[];
  private musicSourceNode: any;
  private musicGainNode: any;
  private musicTimeout: any;

  constructor(props: AudioProps) {
    super(props);
    this.buffers = {};
    this.lastTimestamp = 0;
    this.loopFiles = [];
    this.loopFilesPaused = [];
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
  // So we have to be careful in checking that it's actually an audio-related change
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
    if (nextProps.audio.timestamp <= this.lastTimestamp) {
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
      // TODO temp logic - rather than blanket resetting the loop,
      // modify existing music via fades to match new intensity
      // (also means we need per-layer control)
      // IDEA: provide root filename, with layers split by _int
      // keep track of nodes in []5, and use semi-randomized initial blend of layers
      // based on intensity (keep track of them, so that changes to intensity can fade in / out layers
      // rather than randomly change everything, which would be disruptive)
      if (nextProps.audio.intensity > 0) {
        this.loopFiles = ['sfx_combat_defeat', 'sfx_combat_victory', 'music_combat_intense_1'].filter((file: string) => this.buffers[file]);
      } else {
        this.loopFiles = [];
      }
      this.playMusicLoopNext();
    }
  }

  private loadFiles(): void {
    // TODO async load max 4 at a time and update this.loaded = 'LOADED' on complete
    // TODO make sure these get cached as much as possible, which doesn't seem to be happening right now
    // either fixable in loadAudioLocalFile, or when we deploy them to S3
    // (since they're audio and not code, we can set much more aggressive cache flags)
    if (!this.loaded) {
      this.loaded = 'LOADING';
      SFX_FILES.concat(MUSIC_FILES).forEach((file: string) => {
        loadAudioLocalFile(this.ctx, 'audio/' + file + '.mp3', (err: string, buffer: any) => {
          if (err) {
            return console.log('Error loading audio file: ' + file);
          }
          this.buffers[file] = buffer;
        });
      });
    }
  }

  private playFileOnce(file: string): void {
    if (!this.buffers[file]) {
      return console.log('Skipping playing audio ' + file + ', not loaded yet.');
    }
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers[file];
    source.connect(this.ctx.destination);
    source.start = source.start || (source as any).noteOn; // polyfill for old browsers
    source.start(0);
  }

  // Plays the next song in the music loop with a cross-fade transition
  // If there's no songs in the loop, just fades out of the current song
  private playMusicLoopNext() {
    if (!this.enabled) {
      return console.log('Skipping playing music, audio currently disabled.');
    }

    if (this.paused) {
      return console.log('Skipping playing music, audio currently paused.');
    }

    const file = this.loopFiles.shift();
    const buffer = this.buffers[file];
    this.loopFiles = this.loopFiles.concat(file);

    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }

    if (this.musicGainNode) {
      this.musicGainNode.gain.setValueAtTime(1, this.ctx.currentTime); // Set the node gain to 1 so that we can fade out
      this.musicGainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + MUSIC_FADE_SECONDS); // Fade out
      this.musicSourceNode.stop = this.musicSourceNode.stop || this.musicSourceNode.noteOff; // polyfill for old browsers
      this.musicSourceNode.stop(this.ctx.currentTime + MUSIC_FADE_SECONDS);
    }

    if (!file) {
      this.musicGainNode = null;
      this.musicSourceNode = null;
      return;
    }

    if (!buffer) {
      return console.log('Skipping playing audio ' + file + ', buffer does not exist.');
    }

    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.connect(this.ctx.destination);
    this.musicGainNode.gain.setValueAtTime(0, this.ctx.currentTime); // Set the node gain to 0  so that we can fade in
    this.musicGainNode.gain.linearRampToValueAtTime(1, this.ctx.currentTime + MUSIC_FADE_SECONDS); // Fade in
    this.musicSourceNode = this.ctx.createBufferSource();
    this.musicSourceNode.buffer = buffer;
    this.musicSourceNode.connect(this.musicGainNode);
    this.musicSourceNode.start = this.musicSourceNode.start || this.musicSourceNode.noteOn; // polyfill for old browsers
    this.musicSourceNode.start(0);
    this.musicTimeout = setTimeout(() => {
      this.playMusicLoopNext();
    }, (buffer.duration - MUSIC_FADE_SECONDS) * 1000);
  }

  // TODO nicer (albeit more complicated & bug prone) implementation would be to save the current spot in the audio
  // By keeping track of currentTime https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime
  // And then resume playing the audio (and resume the timeout) from the previous spot (fading in from the end of fade out)
  // by passing in an offset to start() - https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start
  private pauseMusic() {
    this.paused = true;
    this.loopFilesPaused = this.loopFiles;
    this.loopFiles = [];
    this.playMusicLoopNext();
  }

  private resumeMusic() {
    this.paused = false;
    this.loopFiles = this.loopFilesPaused;
    this.loopFilesPaused = [];
    this.playMusicLoopNext();
  }

  render(): JSX.Element {
    return null;
  }
}
