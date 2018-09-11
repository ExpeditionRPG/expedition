import {connect} from 'react-redux';
import Redux from 'redux';
import {audioSet, loadAudioLocalFile} from '../../actions/Audio';
import {changeSettings} from '../../actions/Settings';
import {openSnackbar} from '../../actions/Snackbar';
import {initialAudioState} from '../../reducers/Audio';
import {AppState, AudioLoadingType} from '../../reducers/StateTypes';
import Audio, {DispatchProps, StateProps} from './Audio';
import {getWindow} from '../../Globals';

const mapStateToProps = (state: AppState): StateProps => {
  let audioContext: AudioContext|null = null;
  try {
    audioContext = new (getWindow().AudioContext as any || getWindow().webkitAudioContext as any)();
  } catch {}

  return {
    audioContext: null,
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
    loadAudioFile(context: AudioContext, url: string, callback: (err: Error|null, buffer: AudioBuffer|null) => void) {
      loadAudioLocalFile(context, url, callback);
    },
  };
};

const AudioContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Audio);

export default AudioContainer;
