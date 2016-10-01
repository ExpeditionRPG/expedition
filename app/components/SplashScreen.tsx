import * as React from 'react'
import theme from '../theme'
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
      clearTimeout(this.timeout)
    }

    if (numFingers > 0) {
      this.timeout = setTimeout(function() {
        this.props.onPlayerCountSelect(numFingers);
      }.bind(this), this.props.debounceMillis);
    }
  }

  render() {
    // TODO: Child components
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

const styles = {
  card: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  center: {
    width: '90%',
    left: '50%',
    marginLeft: '-45%',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    top: '50%',
    marginTop: '-10%',
    height: '20%',
    color: theme.colors.fontColorFaded,
    fontSize: theme.fontSize.flavortext,
    textAlign: 'center'
  },
  noMultiButton: {
    position: 'absolute',
    bottom: theme.vh.small,
    color: theme.colors.fontColorFaded,
    width: '100%',
    textAlign: 'center',
  }
};

const SplashScreen = (props: SplashScreenProps): JSX.Element => {
  return (
    <div style={styles.card}>
      <div style={styles.center}>
        <img style={{width: '100%'}} src="images/logo-frameless.png"></img>
        <div>All players put a finger on the screen to begin.</div>
        <div>v1.0.9</div>
      </div>
      <PlayerCounter onPlayerCountSelect={props.onPlayerCountSelect} debounceMillis={1000} />
      <div onTouchTap={props.onNoMultiTouch} style={styles.noMultiButton}>
        No MultiTouch? Click here!
      </div>
    </div>
  );
}

export default SplashScreen;
