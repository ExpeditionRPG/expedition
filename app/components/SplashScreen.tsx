import * as React from 'react'
import MultiTouchTrigger from './base/MultiTouchTrigger'
import Button from './base/Button'

interface PlayerCounterProps extends React.Props<any> {
  debounceMillis: number;
  onPlayerCountSelect: (touches: any) => any;
}

class PlayerCounter extends React.Component<PlayerCounterProps, {}> {
  timeout: any;

  onTouchChange(numFingers: number) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    if (numFingers > 0) {
      this.timeout = setTimeout(function() {
        this.props.onPlayerCountSelect(numFingers);
      }.bind(this), this.props.debounceMillis);
    }
  }

  render() {
    return (
       <MultiTouchTrigger onTouchChange={this.onTouchChange.bind(this)} />
    );
  }
}

export interface SplashScreenStateProps {};

export interface SplashScreenDispatchProps {
  onPlayerCountSelect: (numPlayers: number) => void;
  onNoMultiTouch: (touches: any) => any;
}

interface SplashScreenProps extends SplashScreenStateProps, SplashScreenDispatchProps {}

const SplashScreen = (props: SplashScreenProps): JSX.Element => {
  return (
    <div className="splash_screen">
      <div className="logo">
        <img src="images/logo-colorized.png"></img>
      </div>
      <div className="center">
        <div>To Begin:<br/>All players hold one finger on the screen.</div>
      </div>
      <PlayerCounter onPlayerCountSelect={props.onPlayerCountSelect} debounceMillis={1200} />
      <Button onTouchTap={props.onNoMultiTouch} className="no_multi_button">
        No Multi-touch? Click here!
      </Button>
    </div>
  );
}

export default SplashScreen;
