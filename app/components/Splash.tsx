import * as React from 'react'

import loginUser from '../actions/user'
import {UserState} from '../reducers/StateTypes'

import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'


export interface SplashDispatchProps {
  onLogin: (user: UserState)=>void;
}

const Splash = (props: any): JSX.Element => {
  return (
    <div className="splash">
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
      <div className="body">
        <h1>Create your own quests</h1>
        <RaisedButton
          label="Get Started"
          primary={true}
          onTouchTap={() => props.onLogin()}
        />
        <div className="learnMore">
          <a href="https://github.com/Fabricate-IO/expedition-quest-ide/blob/master/docs/markdown_guide.md" target="_blank">
            learn more
          </a>
        </div>
        <div className="screenshot">
          <img src="/assets/img/app-screenshot.png"/>
        </div>
      </div>
    </div>
  );
};

export default Splash;
