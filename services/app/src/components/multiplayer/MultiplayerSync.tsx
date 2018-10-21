import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {MultiplayerState} from '../../reducers/StateTypes';

export const FADE_ENTER_ANIMATION_MS = 500;
export const FADE_EXIT_ANIMATION_MS = 500;

export interface Props {
  commitID: number;
  multiplayer: MultiplayerState;
}

export default class MultiplayerSync extends React.Component<Props, {}> {

  public render() {
    let body = null;
    if (this.props.multiplayer && this.props.multiplayer.syncing === true) {
      const value = Math.floor(100 * this.props.commitID / this.props.multiplayer.syncID);
      body = (
        <CSSTransition
          classNames="fade"
          timeout={{enter: FADE_ENTER_ANIMATION_MS, exit: FADE_EXIT_ANIMATION_MS}}>
          <div className="remote_sync" key={0}>
            <div id="syncContainer">
              <div className="spinner">
                <CircularProgress size={200} thickness={10} value={value} variant={Boolean(value) ? 'determinate' : 'indeterminate'}/>
              </div>
              <h1>Syncing...</h1>
            </div>
          </div>
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
