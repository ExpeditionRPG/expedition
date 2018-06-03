import * as React from 'react'
import IconButton from '@material-ui/core/IconButton'
import ErrorIcon from '@material-ui/icons/Error'
import RefreshIcon from '@material-ui/icons/Refresh'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import {AudioLoadingType} from '../../reducers/StateTypes'

export interface AudioControlsStateProps extends React.Props<any> {
  audioLoaded: AudioLoadingType,
  audioEnabled: boolean,
}

export interface AudioControlsDispatchProps {
  onAudioToggle: (enabled: boolean) => void;
}

export interface AudioControlsProps extends AudioControlsStateProps, AudioControlsDispatchProps {}

// TODO
const white = 'default';

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
        <IconButton onClick={() => this.props.onAudioToggle(!this.props.audioEnabled)} id="audioToggle">
          {this.props.audioEnabled ?
            <VolumeUpIcon color={white}/> :
            <VolumeOffIcon color={white}/>
          }
        </IconButton>
      </div>
    );
  }
}
