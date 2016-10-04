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
      clearTimeout(this.timeout);
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
    color: theme.colors.fontColor,
    fontSize: theme.fontSize.flavortext,
    textAlign: 'center'
  },
  logo: {
    position: 'absolute',
    top: theme.vh.small,
    left: theme.vh.small,
    right: theme.vh.small,
  },
  noMultiButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    color: theme.colors.fontColorFaded,
    padding: theme.vh.small,
    margin: 'auto',
    textAlign: 'center',
    border: '1px solid #ccc',
  }
};

const SplashScreen = (props: SplashScreenProps): JSX.Element => {
  return (
    <div style={styles.card}>
      <div style={styles.logo}>
        <img style={{width: '100%'}} src="images/logo-frameless.png"></img>
      </div>
      <div style={styles.center}>
        <div>To Begin:<br/>All players hold one finger on the screen.</div>
      </div>
      <PlayerCounter onPlayerCountSelect={props.onPlayerCountSelect} debounceMillis={1000} />
      <div onTouchTap={props.onNoMultiTouch} style={styles.noMultiButton}>
        No Multi-touch? Click here!
      </div>
    </div>
  );
}

export default SplashScreen;
