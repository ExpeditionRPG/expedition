import * as React from 'react'
import theme from '../theme'
import MultiTouchTrigger from './base/MultiTouchTrigger'

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
  },
  version: {
    position: 'absolute',
    bottom: theme.vh.base,
    color: theme.colors.fontColorFaded,
    textAlign: 'center',
    width: '100%',
    fontSize: theme.fontSize.flavortext,
  },
};

const SplashScreen = (props: SplashScreenProps): JSX.Element => {
  return (
    <div style={styles.card}>
      <div style={styles.center}>
        <img style={{width: '100%'}} src="images/logo-frameless.png"></img>
        <div>All players put a finger on the screen to begin.</div>
      </div>
      <div style={styles.version} >v1.0.9</div>
      <PlayerCounter onPlayerCountSelect={props.onPlayerCountSelect} debounceMillis={1000} />
    </div>
  );
}

export default SplashScreen;
