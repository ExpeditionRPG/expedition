import * as React from 'react'
import {white} from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'
import VolumeOffIcon from 'material-ui/svg-icons/av/volume-off'
import VolumeUpIcon from 'material-ui/svg-icons/av/volume-up'
import {AudioLoadingType} from '../../reducers/StateTypes'

export interface AudioControlsStateProps extends React.Props<any> {
  audioLoaded: AudioLoadingType,
  audioEnabled: boolean,
}

export interface AudioControlsDispatchProps {
  onAudioToggle: (enabled: boolean) => void;
}

export interface AudioControlsProps extends AudioControlsStateProps, AudioControlsDispatchProps {}

export default class AudioControls extends React.Component<AudioControlsProps, {}> {
  render() {
    if (this.props.audioLoaded === 'ERROR') {
      return (
        <div className="audioControls">
          <ErrorIcon color={white} id="audioLoadError"/>
        </div>
      );
    }

    return (
      <div className="audioControls">
        {this.props.audioLoaded === 'LOADING' && <RefreshIcon color={white} id="audioLoadingIndicator"/>}
        <IconButton onTouchTap={() => this.props.onAudioToggle(!this.props.audioEnabled)} id="audioToggle">
          {this.props.audioEnabled ?
            <VolumeUpIcon color={white}/> :
            <VolumeOffIcon color={white}/>
          }
        </IconButton>
      </div>
    );
  }
}
