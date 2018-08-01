import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {MultiplayerState} from '../../reducers/StateTypes';

export const FADE_ENTER_ANIMATION_MS = 500;
export const FADE_EXIT_ANIMATION_MS = 500;

export interface StateProps {
  multiplayer: MultiplayerState;
}

export interface DispatchProps {
  onAnimationComplete: () => any;
}

interface Props extends StateProps, DispatchProps {}

class SyncContainer extends React.Component<DispatchProps, {}> {
  public componentDidMount() {
    setTimeout(() => {this.props.onAnimationComplete(); }, FADE_ENTER_ANIMATION_MS);
  }

  public render() {
    return <div className="remote_sync">{this.props.children}</div>;
  }
}

export default class MultiplayerSync extends React.Component<Props, {}> {

  public render() {
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
    if (this.props.multiplayer && this.props.multiplayer.syncing === true) {
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
