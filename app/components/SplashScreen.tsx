import * as React from 'react'
import MultiTouchTrigger from './base/MultiTouchTrigger'
import Button from './base/Button'

import {SPLASH_SCREEN_TIPS, DOUBLE_TAP_MS} from '../Constants'
import {AnnouncementState} from '../reducers/StateTypes'

interface PlayerCounterProps extends React.Props<any> {
  transitionMillis: number;
  onDoubleTap: () => any;
  onPlayerCountSelect: (touches: any) => any;
}

class PlayerCounter extends React.Component<PlayerCounterProps, {}> {
  state: {
    didYouKnow: string;
    lastTouchTime: number;
    maxTouches: number;
    touchCount: number;
    transitionTimeout: any;
  };

  constructor(props: PlayerCounterProps) {
    super(props)
    this.state = {
      didYouKnow: SPLASH_SCREEN_TIPS[Math.floor(Math.random() * SPLASH_SCREEN_TIPS.length)],
      lastTouchTime: 0,
      maxTouches: 0,
      touchCount: 0,
      transitionTimeout: null,
    };
  }

  // NOTE: transitionMillis is also defined in scss for the timer spinner
  onTouchChange(numFingers: number) {
    if (this.state.transitionTimeout) {
      clearTimeout(this.state.transitionTimeout);
      this.setState({transitionTimeout: null});
    }

    if (numFingers > 0) {
      if (numFingers > this.state.touchCount) {
        // Double tap to set manually
        if (numFingers === 1 && Date.now() - this.state.lastTouchTime < DOUBLE_TAP_MS) {
          this.props.onDoubleTap();
        }
        this.setState({lastTouchTime: Date.now()});
      }
      this.setState({transitionTimeout: setTimeout(() => {
        this.props.onPlayerCountSelect(numFingers);
      }, this.props.transitionMillis)});
    }
    this.setState({touchCount: numFingers, maxTouches: Math.max(this.state.maxTouches, numFingers)});
  }

  render() {
    const showInstruction = (this.state.touchCount === 0);
    return (
      <div className="playerCounterContainer">
        <div className={'splashMultitouchInstruction ' + (showInstruction ? 'visible' : '')}>
          <h2>To Begin:</h2>
          <p>All players hold one finger on the screen.<br/>
          Or, double tap to manually set player count.</p>
        </div>
        {!showInstruction && <div className="splashMultitouchPlayerCount">
          <h1>{this.state.touchCount}</h1>
        </div>}
        <div className="splashTips">{this.state.didYouKnow}</div>
        <MultiTouchTrigger onTouchChange={this.onTouchChange.bind(this)} />
      </div>
    );
  }
}

export interface SplashScreenStateProps {
  announcement: AnnouncementState;
};

export interface SplashScreenDispatchProps {
  onAnnouncementTap: (announcement: AnnouncementState) => void;
  onPlayerCountSelect: (numPlayers: number) => void;
  onPlayerManualSelect: () => any;
}

interface SplashScreenProps extends SplashScreenStateProps, SplashScreenDispatchProps {}

const SplashScreen = (props: SplashScreenProps): JSX.Element => {
  const announcementVisible = (props.announcement && props.announcement.open && props.announcement.message !== '');
  const splashClass = 'splashScreen' + (announcementVisible ? ' announcing' : '');
  return (
    <div className={splashClass}>
      {announcementVisible &&
        <Button className="announcement" onTouchTap={() => props.onAnnouncementTap(props.announcement)}>
          {props.announcement.message}
        </Button>
      }
      <div className="logo">
        <img src="images/logo-colorized.png"></img>
      </div>
      <PlayerCounter
        onDoubleTap={props.onPlayerManualSelect}
        onPlayerCountSelect={props.onPlayerCountSelect}
        transitionMillis={1500}
      />
    </div>
  );
}

export default SplashScreen;
