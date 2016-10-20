import * as React from 'react';

import loginUser from '../actions/user';
import {UserState} from '../reducers/StateTypes';

import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';


export interface SplashDispatchProps {
  onLogin: (user: UserState)=>void;
}


const styles = {
  h1: {
    color: 'white',
    fontSize: '2em',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  learnMore: {
    margin: '0.8em auto 2.5em auto',
  },
  learnMoreLink: {
    color: 'white',
    opacity: 0.8,
    textDecoration: 'none',
  },
  screenshot: {
    boxShadow: '0 0 10px #616161',
    width: '70%',
    margin: 'auto',
    display: 'block',
  },
};


const Splash = (props: any): JSX.Element => {
  return (
    <div style={{'background': '#141414'}}>
      <AppBar
        title="Expedition Quest Creator"
        showMenuIconButton={false}
        iconElementRight={
          <FlatButton
            label="Log In"
            onTouchTap={() => props.onLogin()}
          />
        }
      />
      <div style={{'textAlign': 'center'}}>
        <h1 style={styles.h1}>Create your own quests</h1>
        <RaisedButton
          label="Get Started"
          primary={true}
          onTouchTap={() => props.onLogin()}
        />
        <div style={styles.learnMore}>
          <a style={styles.learnMoreLink}
            href="https://github.com/Fabricate-IO/expedition-quest-ide/blob/master/docs/markdown_guide.md"
            target="_blank"
          >
            learn more
          </a>
        </div>
        <img src="/assets/img/app-screenshot.png" style={styles.screenshot}/>
      </div>
    </div>
  );
};

export default Splash;