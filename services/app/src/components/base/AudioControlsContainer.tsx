import {connect} from 'react-redux';
import Redux from 'redux';
import {changeSettings} from '../../actions/Settings';
import {AppState} from '../../reducers/StateTypes';
import AudioControls, {AudioControlsDispatchProps, AudioControlsStateProps} from './AudioControls';

const mapStateToProps = (state: AppState, ownProps: any): AudioControlsStateProps => {
  return {
    audioEnabled: state.settings.audioEnabled,
    audioLoaded: state.audio.loaded,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AudioControlsDispatchProps => {
  return {
    onAudioToggle: (audioEnabled: boolean) => {
      dispatch(changeSettings({audioEnabled}));
    },
  };
};

const AudioControlsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AudioControls);

export default AudioControlsContainer;
