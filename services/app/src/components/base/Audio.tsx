import {ThemeManager} from 'app/audio/ThemeManager';
import {AUDIO_COMMAND_DEBOUNCE_MS, INIT_DELAY} from 'app/Constants';
import {AudioState} from 'app/reducers/StateTypes';
import * as React from 'react';

export interface StateProps {
  themeManager: ThemeManager|null;
  audio: AudioState;
  inCombat: boolean;
  enabled: boolean;
}

export interface DispatchProps {
  disableAudio: () => void;
  loadAudio: () => void;
}

interface Props extends StateProps, DispatchProps {}

export default class Audio extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    // Load after a timeout so as not to overload the device.
    setTimeout(() => {
      if (!this.props.enabled) {
        return;
      }
      this.handleEnableState();
    }, INIT_DELAY.LOAD_AUDIO_MILLIS);
  }

  private handleEnableState(enabled?: boolean) {
    if (this.props.audio.loaded === 'UNLOADED') {
      this.props.loadAudio();
    } else if (this.props.audio.loaded === 'ERROR' && enabled) {
      this.props.disableAudio();
    } else {
      const tm = this.props.themeManager;
      if (!tm) {
        return;
      }
      if (!enabled) {
        tm.pause();
      } else {
        tm.resume();
      }
    }
  }

  // This will fire many times without any audio-related changes since it subscribes to settings
  // So we have to be careful in checking that it's actually an audio-related change,
  // And not a different event that contains valid-looking (but identical) audio info
  public componentWillReceiveProps(nextProps: Partial<Props>) {
    if (!nextProps.audio) {
      return;
    }

    const tm = nextProps.themeManager;
    if (!this.props.themeManager && tm) {
      if (nextProps.enabled) {
        tm.setIntensity(nextProps.audio.intensity, nextProps.audio.peakIntensity);
      } else {
        return tm.pause();
      }
    }

    if (this.props.enabled !== nextProps.enabled) {

      this.handleEnableState(nextProps.enabled);
    }

    if (!nextProps.enabled) {
      return console.log('Skipping audio (disabled)');
    }

    // Ignore if old or duplicate (aka from going back, settings change, or non-audio action)
    if (AUDIO_COMMAND_DEBOUNCE_MS > Math.abs(nextProps.audio.timestamp - this.props.audio.timestamp)) {
      return;
    }

    if (!tm) {
      return console.log('ThemeManager uninitialized; skipping');
    }

    if (tm.isPaused() !== nextProps.audio.paused) {
      if (nextProps.audio.paused) {
        tm.pause();
        return;
      } else {
        tm.resume();
      }
    }

    if (tm.isPaused()) {
      return console.log('Skipping playing audio, audio currently paused.');
    }

    // If we're outside of combat, pause music
    if (nextProps.inCombat) {
      console.log('Pausing music (outside of combat)');
      return tm.pause();
    }
    tm.setIntensity(nextProps.audio.intensity, nextProps.audio.peakIntensity);
  }

  public render(): JSX.Element|null {
    return null;
  }
}
