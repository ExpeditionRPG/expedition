import {connect} from 'react-redux';
import Redux from 'redux';
import {loadAudioFiles} from '../../actions/Audio';
import {changeSettings} from '../../actions/Settings';
import {openSnackbar} from '../../actions/Snackbar';
import {initialAudioState} from '../../reducers/Audio';
import {AppState} from '../../reducers/StateTypes';
import Audio, {DispatchProps, StateProps} from './Audio';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    themeManager: (state.audioData || {}).themeManager || null,
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
    loadAudio() {
      dispatch(loadAudioFiles());
    },
  };
};

const AudioContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Audio);

export default AudioContainer;
