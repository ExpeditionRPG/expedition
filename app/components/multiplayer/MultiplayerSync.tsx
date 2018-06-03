import * as React from 'react'
import {MultiplayerState} from '../../reducers/StateTypes'
import CircularProgress from '@material-ui/core/CircularProgress';
import {TransitionGroup, CSSTransition} from 'react-transition-group'

export const FADE_ENTER_ANIMATION_MS = 500;
export const FADE_EXIT_ANIMATION_MS = 500;

export interface MultiplayerSyncStateProps {
  remotePlay: MultiplayerState;
}

export interface MultiplayerSyncDispatchProps {
  onAnimationComplete: () => any;
}

export interface MultiplayerSyncProps extends MultiplayerSyncStateProps, MultiplayerSyncDispatchProps {}

class SyncContainer extends React.Component<MultiplayerSyncDispatchProps, {}> {
  componentDidMount() {
    setTimeout(() => {this.props.onAnimationComplete();}, FADE_ENTER_ANIMATION_MS);
  }

  render() {
    return <div className="remote_sync">{this.props.children}</div>;
  }
}

export default class MultiplayerSync extends React.Component<MultiplayerSyncProps, {}> {

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
      body = (
        <CSSTransition
          classNames="fade"
          timeout={{enter: FADE_ENTER_ANIMATION_MS, exit: FADE_EXIT_ANIMATION_MS}}>
          <SyncContainer key={0} onAnimationComplete={this.props.onAnimationComplete}>
            <div>
              <div className="spinner">
                <CircularProgress size={200} thickness={10} />
              </div>
              <h1>Syncing...</h1>
            </div>
          </SyncContainer>
        </CSSTransition>
      );
    }

    return (
      <TransitionGroup>
        {body}
      </TransitionGroup>
    );
  }
}
