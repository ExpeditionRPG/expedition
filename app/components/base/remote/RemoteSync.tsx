import * as React from 'react'
import Redux from 'redux'
import FlatButton from 'material-ui/FlatButton'
import NetworkWifi from 'material-ui/svg-icons/device/network-wifi'
import PauseCircle from 'material-ui/svg-icons/av/pause-circle-outline'
import Close from 'material-ui/svg-icons/navigation/close'
import Person from 'material-ui/svg-icons/social/person'
import {RemotePlayState} from '../../../reducers/StateTypes'
import CircularProgress from 'material-ui/CircularProgress';

const ReactCSSTransitionGroup: any = require('react-addons-css-transition-group');

export const FADE_ENTER_ANIMATION_MS = 500;
export const FADE_LEAVE_ANIMATION_MS = 500;

export interface RemoteSyncStateProps {
  remotePlay: RemotePlayState;
}

export interface RemoteSyncDispatchProps {
  onAnimationComplete: () => any;
}

export interface RemoteSyncProps extends RemoteSyncStateProps, RemoteSyncDispatchProps {}

class SyncContainer extends React.Component<RemoteSyncDispatchProps, {}> {
  componentDidMount() {
    setTimeout(() => {this.props.onAnimationComplete();}, FADE_ENTER_ANIMATION_MS);
  }

  render() {
    return <div className="remote_sync">{this.props.children}</div>;
  }
}

export default class RemoteSync extends React.Component<RemoteSyncProps, {}> {

  render() {
    // TODO: this could be much more fancy.
    // Single action (choice):
    // - Fade in a button and remote-ripple it with the client's choice,
    //   then trigger a Next to the thing.
    // Single action (prev):
    // - Fade in a < and remote-ripple it with the client's choice,
    //   then trigger a Prev to the thing.
    // Multiple actions or non-choice:
    // - Sweep an equivalent # "micro-card" symbols across the screen, then Next to the result.
    let body = null;
    if (this.props.remotePlay && this.props.remotePlay.syncing === true) {
      body = (<SyncContainer key={0} onAnimationComplete={this.props.onAnimationComplete}>
        <div>
          <div className="spinner">
            <CircularProgress size={200} thickness={10} />
          </div>
          <h1>Syncing...</h1>
        </div>
      </SyncContainer>);
    }

    return (
      <ReactCSSTransitionGroup
                transitionName="fade"
                transitionEnterTimeout={FADE_ENTER_ANIMATION_MS}
                transitionLeaveTimeout={FADE_LEAVE_ANIMATION_MS}>
        {body}
      </ReactCSSTransitionGroup>
    );
  }
}
