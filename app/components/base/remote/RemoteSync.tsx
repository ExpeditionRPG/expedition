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

export interface RemoteSyncStateProps {
  remotePlay: RemotePlayState;
  inflight: any[]; // TODO
}

export interface RemoteSyncDispatchProps {
  onAnimationComplete: () => any;
}

export interface RemoteSyncProps extends RemoteSyncStateProps, RemoteSyncDispatchProps {}

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
      body = (<div key={0} className="remote_sync">
        <div>
          <div className="spinner">
            <CircularProgress size={200} thickness={10} />
          </div>
          <h1>Syncing...</h1>
        </div>
      </div>);
    }

    return (
      <ReactCSSTransitionGroup
                transitionName="fade"
                transitionEnterTimeout={500}
                transitionLeaveTimeout={300}>
        {body}
      </ReactCSSTransitionGroup>
    );
  }
}
