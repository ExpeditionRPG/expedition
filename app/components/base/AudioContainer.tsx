import Redux from 'redux'
import {connect} from 'react-redux'
import Audio, {AudioStateProps, AudioDispatchProps} from './Audio'
import {audioLoadChange} from '../../actions/Audio'
import {changeSettings} from '../../actions/Settings'
import {openSnackbar} from '../../actions/Snackbar'
import {AppState, AudioLoadingType} from '../../reducers/StateTypes'

const mapStateToProps = (state: AppState, ownProps: AudioStateProps): AudioStateProps => {
  return {
    audio: state.audio,
    cardName: state.card ? state.card.name : 'SPLASH_CARD',
    cardPhase: state.card ? state.card.phase : null,
    enabled: state.settings.audioEnabled,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AudioDispatchProps => {
  return {
    disableAudio(): void {
      dispatch(openSnackbar('Audio not supported on this device; disabling.'));
      dispatch(changeSettings({audioEnabled: false}));
    },
    onLoadChange(loaded: AudioLoadingType): void {
      dispatch(audioLoadChange(loaded));
    },
  };
}

const AudioContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Audio);

export default AudioContainer
