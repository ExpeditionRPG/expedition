import Redux from 'redux'
import {connect} from 'react-redux'
import Audio, {AudioStateProps, AudioDispatchProps} from './Audio'
import {changeSettings} from '../../actions/Settings'
import {openSnackbar} from '../../actions/Snackbar'
import {AppState, AudioState, SettingsType} from '../../reducers/StateTypes'

const mapStateToProps = (state: AppState, ownProps: AudioStateProps): AudioStateProps => {
  return {
    audio: state.audio,
    settings: state.settings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AudioDispatchProps => {
  return {
    disableAudio(): void {
      dispatch(openSnackbar('Audio not supported on this device; disabling.'));
      dispatch(changeSettings({audioEnabled: false}));
    },
  };
}

const AudioContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Audio);

export default AudioContainer
