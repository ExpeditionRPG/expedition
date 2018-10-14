import * as React from 'react';
import {DOUBLE_TAP_MS, SPLASH_SCREEN_TIPS} from '../../Constants';
import {AnnouncementState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import MultiTouchTrigger from '../base/MultiTouchTrigger';

interface PlayerCounterProps extends React.Props<any> {
  transitionMillis: number;
  onDoubleTap: () => any;
  onPlayerCountSelect: (touches: any) => any;
}

class PlayerCounter extends React.Component<PlayerCounterProps, {}> {
  public state: {
    lastTouchTime: number;
    maxTouches: number;
    tip: string;
    touchCount: number;
    transitionTimeout: any;
  };

  constructor(props: PlayerCounterProps) {
    super(props);
    this.state = {
      lastTouchTime: 0,
      maxTouches: 0,
      tip: SPLASH_SCREEN_TIPS[Math.floor(Math.random() * SPLASH_SCREEN_TIPS.length)],
      touchCount: 0,
      transitionTimeout: null,
    };
  }

  // NOTE: transitionMillis is also defined in scss for the timer spinner
  public onTouchChange(numFingers: number) {
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

  public render() {
    const showInstruction = (this.state.touchCount === 0);
    return (
      <div className="playerCounterContainer">
        <div className={'splashMultitouchInstruction ' + (showInstruction ? 'visible' : '')}>
          <h2>To Begin:</h2>
          <p>All players hold one finger on the screen.</p>
          <br/>
          <h2>Multiplayer & More:</h2>
          <p>Double tap the screen.</p>
        </div>
        {!showInstruction && <div className="splashMultitouchPlayerCount">
          <h1>{this.state.touchCount}</h1>
        </div>}
        <div className="splashTips">{this.state.tip}</div>
        <MultiTouchTrigger onTouchChange={this.onTouchChange.bind(this)} />
      </div>
    );
  }
}

export interface StateProps {
  announcement: AnnouncementState;
}

export interface DispatchProps {
  onAnnouncementTap: (announcement: AnnouncementState) => void;
  onPlayerCountSelect: (numLocalPlayers: number) => void;
  onPlayerManualSelect: () => any;
}

interface Props extends StateProps, DispatchProps {}

const SplashScreen = (props: Props): JSX.Element => {
  const announcementVisible = (props.announcement && props.announcement.open && props.announcement.message !== '');
  const splashClass = 'splashScreen' + (announcementVisible ? ' announcing' : '');
  return (
    <div className={splashClass}>
      {announcementVisible &&
        <Button className="announcement" onClick={() => props.onAnnouncementTap(props.announcement)}>
          {props.announcement.message} {props.announcement.link && <img className="inline_icon" src="/images/new_window_white.svg" />}
        </Button>
      }
      <div className="logo">
        <img src="images/logo.png"></img>
      </div>
      <PlayerCounter
        onDoubleTap={props.onPlayerManualSelect}
        onPlayerCountSelect={props.onPlayerCountSelect}
        transitionMillis={1500}
      />
    </div>
  );
};

export default SplashScreen;
