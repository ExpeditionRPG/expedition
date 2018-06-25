import IconButton from '@material-ui/core/IconButton';
import ErrorIcon from '@material-ui/icons/Error';
import RefreshIcon from '@material-ui/icons/Refresh';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import * as React from 'react';
import {AudioLoadingType} from '../../reducers/StateTypes';

export interface AudioControlsStateProps extends React.Props<any> {
  audioLoaded: AudioLoadingType;
  audioEnabled: boolean;
}

export interface AudioControlsDispatchProps {
  onAudioToggle: (enabled: boolean) => void;
}

export interface AudioControlsProps extends AudioControlsStateProps, AudioControlsDispatchProps {}

export default class AudioControls extends React.Component<AudioControlsProps, {}> {
  public render() {
    if (this.props.audioLoaded === 'ERROR') {
      return (
        <div className="audioControls">
          <ErrorIcon nativeColor="white" id="audioLoadError"/>
        </div>
      );
    }

    return (
      <div className="audioControls">
        {this.props.audioLoaded === 'LOADING' && <IconButton disabled={true}>
          <RefreshIcon nativeColor="white" id="audioLoadingIndicator"/>
        </IconButton>}
        <IconButton onClick={() => this.props.onAudioToggle(!this.props.audioEnabled)} id="audioToggle">
          {this.props.audioEnabled ?
            <VolumeUpIcon nativeColor="white" /> :
            <VolumeOffIcon nativeColor="white" />
          }
        </IconButton>
      </div>
    );
  }
}
