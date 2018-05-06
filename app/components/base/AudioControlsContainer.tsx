import Redux from 'redux'
import {connect} from 'react-redux'
import AudioControls, {AudioControlsStateProps, AudioControlsDispatchProps} from './AudioControls'
import {AppState, AudioState, SettingsType} from '../../reducers/StateTypes'
import {changeSettings} from '../../actions/Settings'

const mapStateToProps = (state: AppState, ownProps: any): AudioControlsStateProps => {
  return {
    audioLoaded: state.audio.loaded,
    audioEnabled: state.settings.audioEnabled,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AudioControlsDispatchProps => {
  return {
    onAudioToggle: (audioEnabled: boolean) => {
      dispatch(changeSettings({audioEnabled}));
    },
  };
}

const AudioControlsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AudioControls);

export default AudioControlsContainer
