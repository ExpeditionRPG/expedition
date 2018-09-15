import {connect} from 'react-redux';
import Redux from 'redux';
import {audioSet, loadAudioLocalFile} from '../../actions/Audio';
import {changeSettings} from '../../actions/Settings';
import {openSnackbar} from '../../actions/Snackbar';
import {getWindow} from '../../Globals';
import {logEvent} from '../../Logging';
import {initialAudioState} from '../../reducers/Audio';
import {AppState, AudioLoadingType} from '../../reducers/StateTypes';
import Audio, {DispatchProps, NodeSet, StateProps} from './Audio';

const mapStateToProps = (state: AppState): StateProps => {
  let audioContext: AudioContext|null = null;
  try {
    audioContext = new (getWindow().AudioContext as any || getWindow().webkitAudioContext as any)();
  } catch (err) {
    logEvent('error', 'web_audio_api_err', { label: err });
    console.log('Web Audio API is not supported in this browser');
  }

  return {
    audioContext,
    audio: state.audio || initialAudioState,
    cardName: state.card ? state.card.name : 'SPLASH_CARD',
    cardPhase: state.card ? state.card.phase : null,
    enabled: state.settings.audioEnabled,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    disableAudio(): void {
      dispatch(openSnackbar('Audio not supported on this device; disabling.'));
      dispatch(changeSettings({audioEnabled: false}));
    },
    onLoadChange(loaded: AudioLoadingType): void {
      dispatch(audioSet({loaded}));
    },
    loadAudio(context: AudioContext, url: string, callback: (err: Error|null, buffer: NodeSet|null) => void) {
      loadAudioLocalFile(context, url, callback);
    },
  };
};

const AudioContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Audio);

export default AudioContainer;
